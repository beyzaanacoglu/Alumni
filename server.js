const http = require('http');
const fs = require('fs');
const path = require('path');
const userRepository = require('./repositories/userRepository');

const PORT = process.env.PORT || 80;
const FALLBACK_PORT = 3000;

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

async function requestHandler(req, res) {
  const rawPath = decodeURIComponent(req.url.split('?')[0]);
  let cleanPath = rawPath.trim().replace(/\/+$/, '');
  if (!cleanPath) cleanPath = '/';

  // /Alumni prefix'ini normalize et
  let pathWithoutPrefix = cleanPath;
  if (pathWithoutPrefix.toLowerCase().startsWith('/alumni')) {
    pathWithoutPrefix = pathWithoutPrefix.slice(7);
    if (!pathWithoutPrefix) pathWithoutPrefix = '/';
  }

  // ==========================================
  // POST ROUTES
  // ==========================================
  if (req.method === 'POST') {
    if (pathWithoutPrefix.toLowerCase() === '/api/users') {
      try {
        const rawBody = await getRequestBody(req);
        let parsed;
        try {
          parsed = JSON.parse(rawBody || '{}');
        } catch (jsonErr) {
          return sendJson(res, 400, { error: 'Invalid JSON format.' });
        }

        const { name, email, password } = parsed;

        // Required field validation
        if (!name || typeof name !== 'string' || !name.trim() ||
            !email || typeof email !== 'string' || !email.trim() ||
            !password || typeof password !== 'string' || !password.trim()) {
          return sendJson(res, 400, {
            error: "Validation failed: 'name', 'email', and 'password' are required."
          });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          return sendJson(res, 400, {
            error: 'Validation failed: Invalid email format.'
          });
        }

        // Duplicate email check
        const existingUser = userRepository.findByEmail(email.trim());
        if (existingUser) {
          return sendJson(res, 409, {
            error: 'Conflict: A user with this email already exists.'
          });
        }

        // Create user
        const createdUser = userRepository.create({
          name: name.trim(),
          email: email.trim(),
          password: password.trim()
        });

        return sendJson(res, 201, {
          id: createdUser.id,
          name: createdUser.name,
          email: createdUser.email,
          createdAt: createdUser.createdAt
        });
      } catch (err) {
        return sendJson(res, 500, { error: 'Internal server error.' });
      }
    }

    return sendJson(res, 404, { error: 'Not Found' });
  }

  // ==========================================
  // PUT ROUTES (Full Update)
  // ==========================================
  if (req.method === 'PUT') {
    const userMatch = pathWithoutPrefix.match(/^\/api\/users\/([^\/]+)$/i);
    if (userMatch) {
      const userId = userMatch[1];
      const targetUser = userRepository.findById(userId);
      if (!targetUser) {
        return sendJson(res, 404, { error: 'User not found.' });
      }

      try {
        const rawBody = await getRequestBody(req);
        let parsed;
        try {
          parsed = JSON.parse(rawBody || '{}');
        } catch (jsonErr) {
          return sendJson(res, 400, { error: 'Invalid JSON format.' });
        }

        const { name, email, password } = parsed;

        // Validate all required fields for full update
        if (!name || typeof name !== 'string' || !name.trim() ||
            !email || typeof email !== 'string' || !email.trim() ||
            !password || typeof password !== 'string' || !password.trim()) {
          return sendJson(res, 400, {
            error: "Validation failed: 'name', 'email', and 'password' are required for a full update."
          });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          return sendJson(res, 400, {
            error: 'Validation failed: Invalid email format.'
          });
        }

        // Duplicate email check (excluding current user)
        const existingWithEmail = userRepository.findByEmail(email.trim());
        if (existingWithEmail && String(existingWithEmail.id) !== String(userId)) {
          return sendJson(res, 409, {
            error: 'Conflict: Email is already used by another user.'
          });
        }

        const updatedUser = userRepository.update(userId, {
          name: name.trim(),
          email: email.trim(),
          password: password.trim()
        });

        return sendJson(res, 200, {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        });
      } catch (err) {
        return sendJson(res, 500, { error: 'Internal server error.' });
      }
    }

    return sendJson(res, 404, { error: 'Not Found' });
  }

  // ==========================================
  // PATCH ROUTES (Partial Update)
  // ==========================================
  if (req.method === 'PATCH') {
    const userMatch = pathWithoutPrefix.match(/^\/api\/users\/([^\/]+)$/i);
    if (userMatch) {
      const userId = userMatch[1];
      const targetUser = userRepository.findById(userId);
      if (!targetUser) {
        return sendJson(res, 404, { error: 'User not found.' });
      }

      try {
        const rawBody = await getRequestBody(req);
        let parsed;
        try {
          parsed = JSON.parse(rawBody || '{}');
        } catch (jsonErr) {
          return sendJson(res, 400, { error: 'Invalid JSON format.' });
        }

        const { name, email, password } = parsed;

        if (name === undefined && email === undefined && password === undefined) {
          return sendJson(res, 400, {
            error: 'Validation failed: At least one field (name, email, or password) must be provided.'
          });
        }

        const updateData = {};

        // Validate name if provided
        if (name !== undefined) {
          if (typeof name !== 'string' || !name.trim()) {
            return sendJson(res, 400, {
              error: "Validation failed: 'name' must be a non-empty string."
            });
          }
          updateData.name = name.trim();
        }

        // Validate email if provided
        if (email !== undefined) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
            return sendJson(res, 400, {
              error: 'Validation failed: Invalid email format.'
            });
          }

          // Duplicate email check (excluding current user)
          const existingWithEmail = userRepository.findByEmail(email.trim());
          if (existingWithEmail && String(existingWithEmail.id) !== String(userId)) {
            return sendJson(res, 409, {
              error: 'Conflict: Email is already used by another user.'
            });
          }
          updateData.email = email.trim();
        }

        // Validate password if provided
        if (password !== undefined) {
          if (typeof password !== 'string' || !password.trim()) {
            return sendJson(res, 400, {
              error: "Validation failed: 'password' must be a non-empty string."
            });
          }
          updateData.password = password.trim();
        }

        const updatedUser = userRepository.update(userId, updateData);

        return sendJson(res, 200, {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        });
      } catch (err) {
        return sendJson(res, 500, { error: 'Internal server error.' });
      }
    }

    return sendJson(res, 404, { error: 'Not Found' });
  }

  // ==========================================
  // DELETE ROUTES
  // ==========================================
  if (req.method === 'DELETE') {
    const userMatch = pathWithoutPrefix.match(/^\/api\/users\/([^\/]+)$/i);
    if (userMatch) {
      const userId = userMatch[1];
      const targetUser = userRepository.findById(userId);
      if (!targetUser) {
        return sendJson(res, 404, { error: 'User not found.' });
      }

      try {
        const deleted = userRepository.delete(userId);
        if (!deleted) {
          return sendJson(res, 404, { error: 'User not found.' });
        }
        res.writeHead(204);
        return res.end();
      } catch (err) {
        return sendJson(res, 500, { error: 'Internal server error.' });
      }
    }

    return sendJson(res, 404, { error: 'Not Found' });
  }

  // ==========================================
  // GET ROUTES
  // ==========================================
  if (req.method === 'GET') {
    // 1. Ana Sayfa (One Page / Loading Page HTML)
    if (pathWithoutPrefix === '/' || pathWithoutPrefix === '/index.html') {
      const htmlPath = path.join(__dirname, 'public', 'index.html');
      if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(htmlContent);
      }
      return sendText(res, 200, 'ok');
    }

    // 2. Swagger / OpenAPI Spec JSON
    if (pathWithoutPrefix.toLowerCase() === '/api-docs/openapi.json' ||
        pathWithoutPrefix.toLowerCase() === '/openapi.json' ||
        pathWithoutPrefix.toLowerCase() === '/swagger.json') {
      const specPath = path.join(__dirname, 'docs', 'openapi.json');
      if (fs.existsSync(specPath)) {
        const specContent = fs.readFileSync(specPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(specContent);
      }
      return sendJson(res, 404, { error: 'OpenAPI specification not found.' });
    }

    // 3. Interactive Swagger UI
    if (pathWithoutPrefix.toLowerCase() === '/docs' ||
        pathWithoutPrefix.toLowerCase() === '/api-docs' ||
        pathWithoutPrefix.toLowerCase() === '/swagger' ||
        pathWithoutPrefix.toLowerCase() === '/swagger.html') {
      const swaggerHtmlPath = path.join(__dirname, 'public', 'swagger.html');
      if (fs.existsSync(swaggerHtmlPath)) {
        const swaggerContent = fs.readFileSync(swaggerHtmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(swaggerContent);
      }
      return sendText(res, 200, 'Swagger UI');
    }

    // 2. GET /api/health (Health check)
    if (pathWithoutPrefix.toLowerCase() === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        message: 'API is running'
      });
    }

    // 3. GET /api/users (List all users)
    if (pathWithoutPrefix.toLowerCase() === '/api/users') {
      try {
        const users = userRepository.findAll();
        return sendJson(res, 200, users);
      } catch (err) {
        return sendJson(res, 500, { error: 'Internal server error.' });
      }
    }

    // 3. GET /about (Temporary About Page)
    if (pathWithoutPrefix.toLowerCase() === '/about' || pathWithoutPrefix.toLowerCase() === '/about.html') {
      const htmlPath = path.join(__dirname, 'public', 'about.html');
      if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(htmlContent);
      }
      return sendText(res, 200, 'Temporary about page');
    }

    // 4. GET /hello -> Hello, world!
    if (pathWithoutPrefix.toLowerCase() === '/hello') {
      return sendText(res, 200, 'Hello, world!');
    }

    // 5. GET /hello, {name} veya /hello/{name}
    const helloCommaMatch = pathWithoutPrefix.match(/^\/hello,\s*(.+)$/i);
    const helloSlashMatch = pathWithoutPrefix.match(/^\/hello\/([^\/]+)$/i);
    if (helloCommaMatch || helloSlashMatch) {
      const name = (helloCommaMatch ? helloCommaMatch[1] : helloSlashMatch[1]).trim();
      return sendText(res, 200, `Hello, ${name}!`);
    }

    // 6. Matematiksel İşlemler: /{operation}/{number1}/{number2}
    const segments = pathWithoutPrefix.split('/').filter(Boolean);
    if (segments.length === 3) {
      const [op, num1Str, num2Str] = segments;
      const num1 = parseFloat(num1Str);
      const num2 = parseFloat(num2Str);

      if (isNaN(num1) || isNaN(num2)) {
        return sendText(res, 400, 'Hata: Gecersiz sayi parametresi!');
      }

      let result;
      switch (op.toLowerCase()) {
        case 'sum':
        case 'add':
        case 'topla':
          result = num1 + num2;
          break;
        case 'sub':
        case 'subtract':
        case 'cikar':
          result = num1 - num2;
          break;
        case 'mul':
        case 'multiply':
        case 'carp':
          result = num1 * num2;
          break;
        case 'div':
        case 'divide':
        case 'bol':
          if (num2 === 0) {
            return sendText(res, 400, 'Hata: Sifira bolunemez!');
          }
          result = num1 / num2;
          break;
        default:
          return sendText(res, 404, 'Desteklenmeyen islem. Gecerli islemler: sum, sub, mul, div');
      }

      return sendText(res, 200, String(result));
    }

    return sendText(res, 404, 'Not Found');
  }

  // Other HTTP methods
  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method Not Allowed');
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  const base = PORT === 80 ? 'http://localhost' : 'http://localhost:' + PORT;
  console.log('Server running on ' + base + '/Alumni');
}).on('error', (err) => {
  if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && PORT === 80) {
    console.log('Port 80 kullanılamadı (' + err.code + '), port ' + FALLBACK_PORT + ' deneniyor...');
    server.listen(FALLBACK_PORT, () => {
      console.log('Server running on http://localhost:' + FALLBACK_PORT + '/Alumni');
    });
  } else {
    console.error(err);
  }
});

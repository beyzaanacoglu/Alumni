const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleApiUserRoutes } = require('./routes/apiUserRoutes');
const { handleUserRoutes } = require('./routes/userRoutes');

const PORT = process.env.PORT || 80;
const FALLBACK_PORT = 3000;

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

  // 1. API User Routes (/api/users...)
  const isApiUserHandled = await handleApiUserRoutes(req, res, pathWithoutPrefix);
  if (isApiUserHandled) return;

  // 2. View User Routes (/users...)
  const isViewUserHandled = await handleUserRoutes(req, res, pathWithoutPrefix);
  if (isViewUserHandled) return;

  // 3. General GET Routes
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

    // 4. GET /api/health (Health check)
    if (pathWithoutPrefix.toLowerCase() === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        message: 'API is running'
      });
    }

    // 5. GET /about (Temporary About Page)
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

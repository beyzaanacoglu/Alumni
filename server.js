const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 80;
const FALLBACK_PORT = 3000;

function requestHandler(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Method Not Allowed');
  }

  const rawPath = decodeURIComponent(req.url.split('?')[0]);
  let cleanPath = rawPath.trim().replace(/\/+$/, '');
  if (!cleanPath) cleanPath = '/';

  // /Alumni prefix'ini normalize et
  let pathWithoutPrefix = cleanPath;
  if (pathWithoutPrefix.toLowerCase().startsWith('/alumni')) {
    pathWithoutPrefix = pathWithoutPrefix.slice(7);
    if (!pathWithoutPrefix) pathWithoutPrefix = '/';
  }

  // 1. Ana Sayfa (One Page / Loading Page HTML)
  if (pathWithoutPrefix === '/' || pathWithoutPrefix === '/index.html') {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(htmlContent);
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('ok');
  }

  // 2. GET /about (Temporary About Page)
  if (pathWithoutPrefix.toLowerCase() === '/about' || pathWithoutPrefix.toLowerCase() === '/about.html') {
    const htmlPath = path.join(__dirname, 'public', 'about.html');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(htmlContent);
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Temporary about page');
  }

  // 3. /hello -> Hello, world!
  if (pathWithoutPrefix.toLowerCase() === '/hello') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Hello, world!');
  }

  // 4. /hello, {name} veya /hello/{name}
  const helloCommaMatch = pathWithoutPrefix.match(/^\/hello,\s*(.+)$/i);
  const helloSlashMatch = pathWithoutPrefix.match(/^\/hello\/([^\/]+)$/i);
  if (helloCommaMatch || helloSlashMatch) {
    const name = (helloCommaMatch ? helloCommaMatch[1] : helloSlashMatch[1]).trim();
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`Hello, ${name}!`);
  }

  // 5. Matematiksel İşlemler: /{operation}/{number1}/{number2}
  const segments = pathWithoutPrefix.split('/').filter(Boolean);
  if (segments.length === 3) {
    const [op, num1Str, num2Str] = segments;
    const num1 = parseFloat(num1Str);
    const num2 = parseFloat(num2Str);

    if (isNaN(num1) || isNaN(num2)) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Hata: Gecersiz sayi parametresi!');
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
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Hata: Sifira bolunemez!');
        }
        result = num1 / num2;
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Desteklenmeyen islem. Gecerli islemler: sum, sub, mul, div');
    }

    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(String(result));
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
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

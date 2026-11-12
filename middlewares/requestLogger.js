/**
 * Request Logger Middleware
 * Gelen her HTTP isteğinin metodunu, yolunu, durum kodunu ve toplam yanıt süresini loglar.
 */

function requestLogger(req, res, next) {
  const startTime = Date.now();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Yanıt tamamlandığında süreyi hesapla
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // ANSI renk kodları
    let color = '\x1b[32m'; // Yeşil (2xx)
    if (statusCode >= 500) {
      color = '\x1b[1;31m'; // Parlak Kırmızı (5xx)
    } else if (statusCode >= 400) {
      color = '\x1b[31m'; // Kırmızı (4xx)
    } else if (statusCode >= 300) {
      color = '\x1b[33m'; // Sarı (3xx)
    }
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] ${color}${method.padEnd(7)}${reset} ${url.padEnd(30)} -> ${color}${statusCode}${reset} (${duration}ms) [IP: ${ip}]`
    );
  });

  if (typeof next === 'function') {
    next();
  }
}

module.exports = requestLogger;

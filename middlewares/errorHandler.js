/**
 * Central Error Handler Middleware
 * Express pipeline'ında next(err) ile fırlatılan tüm hataları tek bir noktada yakalar.
 * Hata tipine göre doğru HTTP statü kodunu belirler, logs/error.logs dosyasına kaydeder
 * ve istemciye tutarlı, güvenli bir yanıt döner.
 */

const { logErrorToFile } = require('../utils/fileLogger');

function errorHandler(err, req, res, next) {
  // 1. HTTP Statü Kodunu Belirle (Varsayılan: 500 Internal Server Error)
  let statusCode = err.statusCode || 500;
  let errorName = err.name || 'InternalServerError';
  let message = err.message || 'Sunucu tarafında beklenmeyen bir hata meydana geldi.';

  // Özel / Veritabanı Hata Tiplerini Normalize Et
  if (err.name === 'DuplicateError' || err.code === '23505') {
    // PostgreSQL unique constraint ihlali
    statusCode = 409;
    errorName = 'DuplicateError';
    message = err.message || 'Bu kayıt zaten mevcut veya benzersizlik kısıtı ihlal edildi.';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorName = 'NotFoundError';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorName = 'ValidationError';
  } else if (err.type === 'entity.parse.failed') {
    // JSON body parse hatası
    statusCode = 400;
    errorName = 'BadJsonFormat';
    message = 'Gönderilen JSON verisi geçersiz sözdizimine (syntax) sahip.';
  }

  // 2. Hata Detayını logs/error.log Dosyasına Kaydet (gerçek mesaj ve stack her zaman loglanır)
  logErrorToFile({
    statusCode,
    level: statusCode >= 500 ? 'ERROR' : 'WARN',
    name: errorName,
    message,
    details: err.details || null,
    stack: err.stack,
  }, req);

  // 3. Konsola Hata Özeti Bas
  console.error(`\x1b[31m[ERROR HANDLER] [${statusCode}] ${req.method} ${req.originalUrl || req.url} - ${message}\x1b[0m`);

  // Production ortamında 5xx iç hata detaylarını istemciye sızdırma
  const isProd = process.env.NODE_ENV === 'production';
  const clientMessage = (isProd && statusCode >= 500)
    ? 'Sunucu tarafında beklenmeyen bir hata meydana geldi.'
    : message;

  // 4. Yanıt Başlığı ve Formatı
  const isApi = req.originalUrl?.startsWith('/api') || 
                req.url?.startsWith('/api') || 
                (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isApi) {
    const payload = {
      status: statusCode,
      error: errorName,
      message: clientMessage,
      details: (isProd && statusCode >= 500) ? undefined : (err.details || undefined),
      timestamp: new Date().toISOString(),
    };
    if (typeof res.status === 'function') {
      return res.status(statusCode).json(payload);
    }
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(payload, null, 2));
  }

  // HTML Yanıtı (Tarayıcı için - 5xx Guardian)
  const htmlBody = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${statusCode} - ${errorName}</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .box { background: rgba(23, 32, 53, 0.9); border: 1px solid rgba(239, 68, 68, 0.4); padding: 32px; border-radius: 16px; max-width: 520px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { font-size: 4rem; color: #ef4444; margin: 0 0 10px; }
        p { color: #cbd5e1; line-height: 1.6; }
        a { display: inline-block; margin-top: 18px; padding: 10px 20px; background: #6366f1; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>${statusCode}</h1>
        <h3>${errorName}</h3>
        <p>${clientMessage}</p>
        <a href="/">Ana Sayfaya Dön</a>
      </div>
    </body>
    </html>
  `;

  if (typeof res.status === 'function') {
    return res.status(statusCode).send(htmlBody);
  }
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  return res.end(htmlBody);
}

module.exports = errorHandler;

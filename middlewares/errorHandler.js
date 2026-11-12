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

  // 2. Hata Detayını logs/error.logs Dosyasına Kaydet
  logErrorToFile({
    statusCode,
    name: errorName,
    message,
    details: err.details || null,
    stack: err.stack,
  }, req);

  // 3. Konsola Hata Özeti Bas
  console.error(`\x1b[31m[ERROR HANDLER] [${statusCode}] ${req.method} ${req.originalUrl || req.url} - ${message}\x1b[0m`);

  // 4. Yanıt Başlığı ve Formatı
  const isApi = req.originalUrl?.startsWith('/api') || 
                req.url?.startsWith('/api') || 
                (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isApi || !res.render) {
    return res.status(statusCode).json({
      status: statusCode,
      error: errorName,
      message: message,
      details: err.details || undefined,
      timestamp: new Date().toISOString(),
    });
  }

  // HTML Yanıtı (Tarayıcı için)
  return res.status(statusCode).send(`
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
        <p>${message}</p>
        <a href="/">Ana Sayfaya Dön</a>
      </div>
    </body>
    </html>
  `);
}

module.exports = errorHandler;

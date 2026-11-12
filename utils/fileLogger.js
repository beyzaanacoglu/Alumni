/**
 * File Logger Utility
 * Hataları ve sistem olaylarını proje kökündeki logs/error.logs dosyasına kalıcı olarak yazar.
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const ERROR_LOG_FILE = path.join(LOGS_DIR, 'error.logs');

// logs dizini yoksa otomatik oluştur
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Hata detayını logs/error.logs dosyasına formatlı şekilde ekler.
 * @param {Error|Object} err - Hata nesnesi
 * @param {Object} [req] - İsteğe bağlı Express req nesnesi
 */
function logErrorToFile(err, req = null) {
  const timestamp = new Date().toISOString();
  const statusCode = err.statusCode || 500;
  const method = req ? req.method : 'N/A';
  const url = req ? (req.originalUrl || req.url) : 'N/A';
  const ip = req ? (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : 'N/A';

  const logEntry = [
    `--------------------------------------------------------------------------------`,
    `TIMESTAMP  : [${timestamp}]`,
    `STATUS     : ${statusCode}`,
    `METHOD/URL : ${method} ${url}`,
    `CLIENT IP  : ${ip}`,
    `MESSAGE    : ${err.message || 'Unknown Error'}`,
    err.details ? `DETAILS    : ${JSON.stringify(err.details)}` : null,
    err.stack ? `STACKTRACE : ${err.stack}` : null,
    `--------------------------------------------------------------------------------\n`,
  ].filter(Boolean).join('\n');

  fs.appendFile(ERROR_LOG_FILE, logEntry, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('CRITICAL: logs/error.logs dosyasına yazılamadı:', writeErr);
    }
  });
}

module.exports = {
  logErrorToFile,
  ERROR_LOG_FILE,
};

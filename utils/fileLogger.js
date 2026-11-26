/**
 * File Logger Utility
 * Hataları ve sistem olaylarını proje kökündeki logs/error.log dosyasına kalıcı olarak yazar.
 * Dosya 5 MB sınırını aştığında otomatik olarak logs/error.1.log olarak arşivler.
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const ERROR_LOG_FILE = path.join(LOGS_DIR, 'error.log');
const ARCHIVE_LOG_FILE = path.join(LOGS_DIR, 'error.1.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB

// logs dizini yoksa otomatik oluştur
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function rotateIfNeeded(callback) {
  fs.stat(ERROR_LOG_FILE, (err, stats) => {
    if (!err && stats.size >= MAX_LOG_SIZE) {
      fs.rename(ERROR_LOG_FILE, ARCHIVE_LOG_FILE, () => callback());
    } else {
      callback();
    }
  });
}

/**
 * Hata veya uyarı detayını logs/error.log dosyasına formatlı şekilde ekler.
 * @param {Error|Object} err - Hata nesnesi
 * @param {Object} [req] - İsteğe bağlı HTTP req nesnesi
 */
function logErrorToFile(err, req = null) {
  const timestamp = new Date().toISOString();
  const statusCode = err.statusCode || 500;
  const level = err.level || (statusCode >= 500 ? 'ERROR' : 'WARN');
  const method = req ? req.method : 'N/A';
  const url = req ? (req.originalUrl || req.url) : 'N/A';
  const ip = req ? (req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : 'N/A';

  const logEntry = [
    `--------------------------------------------------------------------------------`,
    `TIMESTAMP  : [${timestamp}]`,
    `LEVEL      : ${level}`,
    `STATUS     : ${statusCode}`,
    `METHOD/URL : ${method} ${url}`,
    `CLIENT IP  : ${ip}`,
    `MESSAGE    : ${err.message || 'Unknown Error'}`,
    err.details ? `DETAILS    : ${JSON.stringify(err.details)}` : null,
    err.stack ? `STACKTRACE : ${err.stack}` : null,
    `--------------------------------------------------------------------------------\n`,
  ].filter(Boolean).join('\n');

  rotateIfNeeded(() => {
    fs.appendFile(ERROR_LOG_FILE, logEntry, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('CRITICAL: logs/error.log dosyasına yazılamadı:', writeErr);
      }
    });
  });
}

module.exports = {
  logErrorToFile,
  ERROR_LOG_FILE,
};

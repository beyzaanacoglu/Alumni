/**
 * Generic 404 Handler Middleware
 * Rota pipeline'ında eşleşmeyen tüm geçersiz istekleri yakalar ve NotFoundError fırlatarak
 * merkezi errorHandler'a iletir.
 */

const { NotFoundError } = require('../utils/errors');

function notFoundHandler(req, res, next) {
  const method = req.method;
  const path = req.originalUrl || req.url;
  
  // NotFoundError fırlatarak merkezi hata yakalayıcıya devret
  const err = new NotFoundError(
    `İstenen '${method} ${path}' uç noktası veya kaynağı bu sunucuda tanımlı değildir.`
  );
  
  next(err);
}

module.exports = notFoundHandler;

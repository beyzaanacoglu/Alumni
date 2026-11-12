/**
 * Custom Application Error Hierarchy
 * Merkezi hata yakalayıcı (errorHandler) ile tam uyumlu HTTP hata sınıfları.
 */

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Beklenen, kontrollü operasyonel hatalar
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Aradığınız kaynak bulunamadı.') {
    super(message, 404);
  }
}

class DuplicateError extends AppError {
  constructor(message = 'Bu kayıt zaten mevcut veya çakışma oluştu.') {
    super(message, 409);
  }
}

class ValidationError extends AppError {
  constructor(message = 'İstek doğrulama hatası.', details = []) {
    super(message, 400, details);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  DuplicateError,
  ValidationError,
};

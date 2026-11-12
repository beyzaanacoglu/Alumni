/**
 * Express Application Pipeline Setup
 * Modüler Middleware Sıralaması (Clean Architecture):
 * [1. Logger] -> [2. JSON Reader] -> [3. Static Files] -> [4. Routes/Controllers] -> [5. 404 Handler] -> [6. Central Error Handler]
 */

const express = require('express');
const path = require('path');

// Middleware'ler
const requestLogger = require('./middlewares/requestLogger');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');
const validate = require('./middlewares/bodyValidator');

// Özel Hata Sınıfları
const { NotFoundError, DuplicateError, ValidationError } = require('./utils/errors');

const app = express();

// =============================================================================
// 1. PIPELINE ADIMI: REQUEST LOGGER MIDDLEWARE
// =============================================================================
// Gelen her isteğin metodunu, yolunu ve yanıt süresini hesaplayıp konsola basar.
app.use(requestLogger);

// =============================================================================
// 2. PIPELINE ADIMI: JSON & URLENCODED BODY PARSERS
// =============================================================================
// Gelen gövdeyi (req.body) JSON formatında ayrıştırır.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// =============================================================================
// 3. PIPELINE ADIMI: STATIC ASSET SERVING
// =============================================================================
app.use('/Alumni', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
// 4. PIPELINE ADIMI: ROUTES & CONTROLLERS (WITH BODY VALIDATION)
// =============================================================================

// Örnek: Body Validation Middleware Kullanımı (Kullanıcı Oluşturma)
app.post(
  '/api/users',
  validate({
    name: { required: true, type: 'string', min: 2, max: 100 },
    email: { required: true, type: 'string', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    role: { required: true, enum: ['student', 'alumni', 'admin'] },
  }),
  (req, res, next) => {
    try {
      // Simüle edilen controller işlemi
      res.status(201).json({
        status: 201,
        message: 'Kullanıcı başarıyla oluşturuldu.',
        data: req.body,
      });
    } catch (err) {
      next(err); // Hata merkezi errorHandler'a iletilir
    }
  }
);

// Örnek: Body Validation Middleware Kullanımı (Duyuru Oluşturma)
app.post(
  '/api/announcements',
  validate({
    title: { required: true, type: 'string', min: 3, max: 150 },
    content: { required: true, type: 'string', min: 10 },
    user_id: { required: true },
  }),
  (req, res, next) => {
    try {
      res.status(201).json({
        status: 201,
        message: 'Duyuru başarıyla oluşturuldu.',
        data: req.body,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Örnek: 409 DuplicateError Tetikleyen Test Rotası
app.get('/api/test-duplicate', (req, res, next) => {
  next(new DuplicateError('Bu e-posta adresi ile zaten kayıtlı bir kullanıcı bulunmaktadır.'));
});

// Örnek: 500 Sunucu Hatası Tetikleyen Test Rotası
app.get('/api/test-error', (req, res, next) => {
  next(new Error('Beklenmeyen bir veritabanı bağlantı hatası simüle edildi.'));
});

// =============================================================================
// 5. PIPELINE ADIMI: GENERIC 404 NOT FOUND HANDLER
// =============================================================================
// Yukarıdaki hiçbir rotayla eşleşmeyen tüm istekler burada yakalanır.
app.use(notFoundHandler);

// =============================================================================
// 6. PIPELINE ADIMI: CENTRAL ERROR HANDLER MIDDLEWARE
// =============================================================================
// next(err) ile iletilen tüm hatalar tek bir merkezden yakalanıp logs/error.logs'a yazılır.
app.use(errorHandler);

module.exports = app;

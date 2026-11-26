/**
 * Generic Body Validation Middleware
 * Controller'a girmeden önce req.body içeriğini doğrular.
 * Eksik veya geçersiz alan varsa anında 400 Bad Request döner.
 *
 * @param {Object|Array<string>} rules - Doğrulama kuralları nesnesi veya zorunlu alanlar dizisi
 * 
 * Örnek Kullanım 1:
 * router.post('/users', validate(['name', 'email', 'role']), controller.createUser);
 *
 * Örnek Kullanım 2:
 * router.post('/announcements', validate({
 *   title: { required: true, type: 'string', min: 3 },
 *   content: { required: true, type: 'string' },
 *   user_id: { required: true }
 * }), controller.createAnnouncement);
 */

function sendBadRequest(res, payload) {
  if (typeof res.status === 'function') {
    return res.status(400).json(payload);
  }
  res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
  return res.end(JSON.stringify(payload, null, 2));
}

function validate(rules) {
  return function bodyValidatorMiddleware(req, res, next) {
    const body = req.body;

    // Body hiç yoksa
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return sendBadRequest(res, {
        status: 400,
        error: 'Bad Request',
        message: 'İstek gövdesi (JSON body) eksik veya geçersiz formatta.',
        timestamp: new Date().toISOString(),
      });
    }

    const errors = [];
    const missingFields = [];

    // 1. Durum: rules basit bir dizi ise (örn: ['title', 'content', 'user_id'])
    if (Array.isArray(rules)) {
      for (const field of rules) {
        const val = body[field];
        if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
          missingFields.push(field);
          errors.push({
            field,
            message: `'${field}' alanı zorunludur ve boş bırakılamaz.`,
          });
        }
      }
    } 
    // 2. Durum: rules detaylı bir nesne ise
    else if (typeof rules === 'object') {
      for (const [field, rule] of Object.entries(rules)) {
        const val = body[field];
        const isMissing = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');

        // Zorunluluk kontrolü
        if (rule.required && isMissing) {
          missingFields.push(field);
          errors.push({
            field,
            message: `'${field}' alanı zorunludur.`,
          });
          continue;
        }

        // Değer mevcutsa tip ve kural kontrolleri
        if (!isMissing) {
          // Tip kontrolü (string, number, boolean)
          if (rule.type && typeof val !== rule.type) {
            errors.push({
              field,
              message: `'${field}' alanı '${rule.type}' tipinde olmalıdır (Gelen: ${typeof val}).`,
            });
          }

          // Min uzunluk (string için)
          if (rule.min && typeof val === 'string' && val.trim().length < rule.min) {
            errors.push({
              field,
              message: `'${field}' en az ${rule.min} karakter olmalıdır.`,
            });
          }

          // Max uzunluk
          if (rule.max && typeof val === 'string' && val.trim().length > rule.max) {
            errors.push({
              field,
              message: `'${field}' en fazla ${rule.max} karakter olabilir.`,
            });
          }

          // Enum kontrolü
          if (rule.enum && Array.isArray(rule.enum) && !rule.enum.includes(val)) {
            errors.push({
              field,
              message: `'${field}' değeri şu seçeneklerden biri olmalıdır: [${rule.enum.join(', ')}].`,
            });
          }

          // Regex kontrolü
          if (rule.regex && rule.regex instanceof RegExp && !rule.regex.test(val)) {
            errors.push({
              field,
              message: `'${field}' alanı beklenen format kuralına uymuyor.`,
            });
          }
        }
      }
    }

    // Hata varsa controller'a GEÇME, anında 400 Bad Request dön
    if (errors.length > 0) {
      return sendBadRequest(res, {
        status: 400,
        error: 'Bad Request',
        message: 'İstek doğrulaması başarısız oldu. Lütfen parametreleri kontrol edin.',
        missingFields: missingFields.length > 0 ? missingFields : undefined,
        errors,
        timestamp: new Date().toISOString(),
      });
    }

    // Doğrulama başarılı, sonraki middleware/controller'a geç
    next();
  };
}

module.exports = validate;

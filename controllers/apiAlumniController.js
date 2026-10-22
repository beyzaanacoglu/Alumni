const AlumniModel = require('../models/alumniModel');

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED = ['firstName', 'lastName', 'email', 'graduationYear', 'department'];
const OPTIONAL_STRINGS = ['phone', 'currentCompany', 'jobTitle', 'city', 'linkedinUrl'];
const STRING_FIELDS = ['firstName', 'lastName', 'email', 'department', ...OPTIONAL_STRINGS];

/**
 * Govdeyi dogrular. partial=true ise yalnizca verilen alanlar kontrol edilir.
 * @returns {{error?: string, data?: Object}}
 */
function validate(body, partial) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Validation failed: JSON object body is required.' };
  }
  const data = {};

  if (!partial) {
    const missing = REQUIRED.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
    if (missing.length) return { error: `Validation failed: ${missing.join(', ')} required.` };
  } else if (!Object.keys(body).some(k => STRING_FIELDS.includes(k) || k === 'graduationYear')) {
    return { error: 'Validation failed: At least one updatable field must be provided.' };
  }

  for (const f of STRING_FIELDS) {
    if (body[f] === undefined) continue;
    const optional = OPTIONAL_STRINGS.includes(f);
    if (body[f] === null && optional) { data[f] = null; continue; }
    if (typeof body[f] !== 'string' || (!optional && !body[f].trim())) {
      return { error: `Validation failed: '${f}' must be a non-empty string.` };
    }
    data[f] = body[f].trim();
  }

  if (data.email !== undefined && !EMAIL_REGEX.test(data.email)) {
    return { error: 'Validation failed: Invalid email format.' };
  }

  if (body.graduationYear !== undefined) {
    const year = Number(body.graduationYear);
    if (!Number.isInteger(year) || year < 1950 || year > 2100) {
      return { error: "Validation failed: 'graduationYear' must be an integer between 1950 and 2100." };
    }
    data.graduationYear = year;
  }

  return { data };
}

async function parseBody(req, res) {
  const raw = await getRequestBody(req);
  try {
    return JSON.parse(raw || '{}');
  } catch (e) {
    sendJson(res, 400, { error: 'Invalid JSON format.' });
    return undefined;
  }
}

const ApiAlumniController = {
  /** GET /api/alumni?department=&graduationYear=&city=&search= */
  async getAll(req, res, query = {}) {
    try {
      return sendJson(res, 200, await AlumniModel.getAll(query));
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** GET /api/alumni/:id */
  async getById(req, res, id) {
    try {
      const item = await AlumniModel.getById(id);
      if (!item) return sendJson(res, 404, { error: 'Alumni not found.' });
      return sendJson(res, 200, item);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** POST /api/alumni */
  async create(req, res) {
    try {
      const body = await parseBody(req, res);
      if (body === undefined) return;
      const { error, data } = validate(body, false);
      if (error) return sendJson(res, 400, { error });

      if (await AlumniModel.getByEmail(data.email)) {
        return sendJson(res, 409, { error: 'Conflict: An alumni with this email already exists.' });
      }
      return sendJson(res, 201, await AlumniModel.create(data));
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** PUT /api/alumni/:id (tam guncelleme) ve PATCH (kismi) */
  async update(req, res, id, partial) {
    try {
      const existing = await AlumniModel.getById(id);
      if (!existing) return sendJson(res, 404, { error: 'Alumni not found.' });

      const body = await parseBody(req, res);
      if (body === undefined) return;
      const { error, data } = validate(body, partial);
      if (error) return sendJson(res, 400, { error });

      if (data.email) {
        const other = await AlumniModel.getByEmail(data.email);
        if (other && String(other.id) !== String(id)) {
          return sendJson(res, 409, { error: 'Conflict: Email is already used by another alumni.' });
        }
      }

      // PUT: belirtilmeyen opsiyonel alanlar temizlenir
      if (!partial) {
        OPTIONAL_STRINGS.forEach(f => { if (data[f] === undefined) data[f] = null; });
      }
      return sendJson(res, 200, await AlumniModel.update(id, data));
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** DELETE /api/alumni/:id */
  async remove(req, res, id) {
    try {
      const deleted = await AlumniModel.delete(id);
      if (!deleted) return sendJson(res, 404, { error: 'Alumni not found.' });
      res.writeHead(204);
      return res.end();
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** GET /api/alumni/:id/jobs */
  async getJobs(req, res, id) {
    try {
      const alumni = await AlumniModel.getById(id);
      if (!alumni) return sendJson(res, 404, { error: 'Alumni not found.' });
      const jobPostingRepository = require('../repositories/jobPostingRepository');
      const jobs = await jobPostingRepository.findAll({ alumniId: id });
      return sendJson(res, 200, jobs);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  }
};

module.exports = ApiAlumniController;


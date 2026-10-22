const JobPostingModel = require('../models/jobPostingModel');
const alumniRepository = require('../repositories/alumniRepository');

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

async function parseBody(req, res) {
  const raw = await getRequestBody(req);
  try {
    return JSON.parse(raw || '{}');
  } catch (e) {
    sendJson(res, 400, { error: 'Invalid JSON format.' });
    return undefined;
  }
}

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'internship', 'contract'];
const WORK_MODES = ['onsite', 'remote', 'hybrid'];
const LEVELS = ['entry', 'mid', 'senior'];
const APP_STATUSES = ['submitted', 'reviewing', 'accepted', 'rejected'];

function validatePosting(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Validation failed: JSON object body is required.' };
  }

  const data = {};

  if (!partial) {
    const required = ['alumniId', 'title', 'description', 'companyName', 'employmentType'];
    const missing = required.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
    if (missing.length) return { error: `Validation failed: ${missing.join(', ')} required.` };
  }

  if (body.alumniId !== undefined) {
    const id = Number(body.alumniId);
    if (!Number.isInteger(id) || id <= 0) return { error: "Validation failed: 'alumniId' must be a positive integer." };
    data.alumniId = id;
  }

  for (const f of ['title', 'description', 'companyName']) {
    if (body[f] !== undefined) {
      if (typeof body[f] !== 'string' || !body[f].trim()) return { error: `Validation failed: '${f}' must be a non-empty string.` };
      data[f] = body[f].trim();
    }
  }

  for (const f of ['city', 'country', 'requiredSkills', 'contactEmail', 'externalApplicationLink']) {
    if (body[f] !== undefined) {
      if (body[f] === null || body[f] === '') { data[f] = null; }
      else {
        if (typeof body[f] !== 'string') return { error: `Validation failed: '${f}' must be a string.` };
        data[f] = body[f].trim();
      }
    }
  }

  if (body.employmentType !== undefined) {
    if (!EMPLOYMENT_TYPES.includes(body.employmentType)) {
      return { error: `Validation failed: 'employmentType' must be one of: ${EMPLOYMENT_TYPES.join(', ')}.` };
    }
    data.employmentType = body.employmentType;
  }

  if (body.workMode !== undefined) {
    if (!WORK_MODES.includes(body.workMode)) {
      return { error: `Validation failed: 'workMode' must be one of: ${WORK_MODES.join(', ')}.` };
    }
    data.workMode = body.workMode;
  }

  if (body.experienceLevel !== undefined) {
    if (body.experienceLevel !== null && !LEVELS.includes(body.experienceLevel)) {
      return { error: `Validation failed: 'experienceLevel' must be one of: ${LEVELS.join(', ')}.` };
    }
    data.experienceLevel = body.experienceLevel;
  }

  if (body.status !== undefined) {
    if (!['open', 'closed'].includes(body.status)) return { error: "Validation failed: 'status' must be 'open' or 'closed'." };
    data.status = body.status;
  }

  if (body.applicationDeadline !== undefined) {
    if (body.applicationDeadline === null || body.applicationDeadline === '') { data.applicationDeadline = null; }
    else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.applicationDeadline))) {
        return { error: "Validation failed: 'applicationDeadline' must be in YYYY-MM-DD format." };
      }
      data.applicationDeadline = body.applicationDeadline;
    }
  }

  // Coordinates (optional, lat between -90 and 90, lng between -180 and 180)
  if (body.latitude !== undefined) {
    if (body.latitude === null || body.latitude === '') { data.latitude = null; }
    else {
      const lat = Number(body.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) return { error: "Validation failed: 'latitude' must be between -90 and 90." };
      data.latitude = lat;
    }
  }

  if (body.longitude !== undefined) {
    if (body.longitude === null || body.longitude === '') { data.longitude = null; }
    else {
      const lng = Number(body.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) return { error: "Validation failed: 'longitude' must be between -180 and 180." };
      data.longitude = lng;
    }
  }

  return { data };
}

const ApiJobPostingController = {
  /** GET /api/job-postings?status=&employmentType=&workMode=&city=&alumniId=&search= */
  async getAll(req, res, query = {}) {
    try {
      const postings = await JobPostingModel.getAll(query);
      return sendJson(res, 200, postings);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** GET /api/job-postings/:id */
  async getById(req, res, id) {
    try {
      const posting = await JobPostingModel.getById(id);
      if (!posting) return sendJson(res, 404, { error: 'Job posting not found.' });
      return sendJson(res, 200, posting);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** POST /api/job-postings */
  async create(req, res) {
    try {
      const body = await parseBody(req, res);
      if (body === undefined) return;
      const { error, data } = validatePosting(body, false);
      if (error) return sendJson(res, 400, { error });

      // Check author exists in alumni
      const author = await alumniRepository.findById(data.alumniId);
      if (!author) return sendJson(res, 400, { error: 'Validation failed: Author alumni record not found.' });

      const created = await JobPostingModel.create(data);
      return sendJson(res, 201, created);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** PUT /api/job-postings/:id */
  async update(req, res, id, partial = false) {
    try {
      const existing = await JobPostingModel.getById(id);
      if (!existing) return sendJson(res, 404, { error: 'Job posting not found.' });

      const body = await parseBody(req, res);
      if (body === undefined) return;
      const { error, data } = validatePosting(body, partial);
      if (error) return sendJson(res, 400, { error });

      if (data.alumniId) {
        const author = await alumniRepository.findById(data.alumniId);
        if (!author) return sendJson(res, 400, { error: 'Validation failed: Author alumni record not found.' });
      }

      const updated = await JobPostingModel.update(id, data);
      return sendJson(res, 200, updated);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** DELETE /api/job-postings/:id */
  async remove(req, res, id) {
    try {
      const deleted = await JobPostingModel.delete(id);
      if (!deleted) return sendJson(res, 404, { error: 'Job posting not found.' });
      res.writeHead(204);
      return res.end();
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  // ---------------- Application endpoints ----------------

  /** GET /api/job-postings/:id/applications */
  async getApplications(req, res, id) {
    try {
      const posting = await JobPostingModel.getById(id);
      if (!posting) return sendJson(res, 404, { error: 'Job posting not found.' });

      const applications = await JobPostingModel.getApplications(id);
      return sendJson(res, 200, applications);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** POST /api/job-postings/:id/applications */
  async apply(req, res, id) {
    try {
      const posting = await JobPostingModel.getById(id);
      if (!posting) return sendJson(res, 404, { error: 'Job posting not found.' });

      // If external link is provided, direct application is not accepted internally
      if (posting.externalApplicationLink) {
        return sendJson(res, 400, {
          error: 'External application required.',
          externalUrl: posting.externalApplicationLink
        });
      }

      if (posting.status !== 'open') {
        return sendJson(res, 400, { error: 'This job posting is closed for applications.' });
      }

      const body = await parseBody(req, res);
      if (body === undefined) return;

      const applicantUserId = Number(body.applicantUserId);
      if (!Number.isInteger(applicantUserId) || applicantUserId <= 0) {
        return sendJson(res, 400, { error: "Validation failed: 'applicantUserId' is required." });
      }

      const existingApp = await JobPostingModel.getApplicationByUser(id, applicantUserId);
      if (existingApp) {
        return sendJson(res, 409, { error: 'Conflict: User has already applied to this job posting.' });
      }

      const application = await JobPostingModel.createApplication({
        jobPostingId: id,
        applicantUserId,
        coverLetter: body.coverLetter ? String(body.coverLetter).trim() : null
      });

      return sendJson(res, 201, application);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** PATCH /api/job-postings/:id/applications/:appId */
  async updateApplicationStatus(req, res, id, appId) {
    try {
      const application = await JobPostingModel.getApplicationById(appId);
      if (!application || String(application.jobPostingId) !== String(id)) {
        return sendJson(res, 404, { error: 'Application not found.' });
      }

      const body = await parseBody(req, res);
      if (body === undefined) return;

      if (!body.status || !APP_STATUSES.includes(body.status)) {
        return sendJson(res, 400, { error: `Validation failed: status must be one of: ${APP_STATUSES.join(', ')}.` });
      }

      const updated = await JobPostingModel.updateApplicationStatus(appId, body.status);
      return sendJson(res, 200, updated);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** DELETE /api/job-postings/:id/applications/:appId */
  async deleteApplication(req, res, id, appId) {
    try {
      const application = await JobPostingModel.getApplicationById(appId);
      if (!application || String(application.jobPostingId) !== String(id)) {
        return sendJson(res, 404, { error: 'Application not found.' });
      }

      await JobPostingModel.deleteApplication(appId);
      res.writeHead(204);
      return res.end();
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** GET /api/applications or /api/my-applications */
  async listApplications(req, res, query = {}) {
    try {
      const applications = await JobPostingModel.getAllApplications(query);
      return sendJson(res, 200, applications);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /** DELETE /api/applications/:id */
  async deleteApplicationDirect(req, res, id) {
    try {
      const deleted = await JobPostingModel.deleteApplication(id);
      if (!deleted) return sendJson(res, 404, { error: 'Application not found.' });
      res.writeHead(204);
      return res.end();
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  }
};

module.exports = ApiJobPostingController;

const { pool } = require('../config/db');

/**
 * Job Application Repository (PostgreSQL; DB yoksa in-memory yedek)
 */
const SELECT = `id, job_posting_id AS "jobPostingId", applicant_user_id AS "applicantUserId",
  type, cover_letter AS "coverLetter", status, created_at AS "createdAt", updated_at AS "updatedAt"`;

const iso = (v) => (v ? new Date(v).toISOString() : null);
const normalize = (r) => ({ ...r, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) });
const isId = (id) => /^\d+$/.test(String(id));

const memory = [
  {
    id: 1, jobPostingId: 1, applicantUserId: 2, type: 'job',
    coverLetter: 'Merhaba, ilanınızdaki teknik gereksinimler yazılım geliştirme hedeflerimle ve üniversitede yaptığım projelerle birebir örtüşüyor.',
    status: 'pending', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: null
  },
  {
    id: 2, jobPostingId: 2, applicantUserId: 2, type: 'internship',
    coverLetter: 'Merhaba, zorunlu yaz stajım kapsamında şirketinizin dinamik ekibinde stajyer mühendis olarak yer almak ve pratik tecrübe edinmek istiyorum.',
    status: 'reviewing', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: null
  },
  {
    id: 3, jobPostingId: 4, applicantUserId: 2, type: 'volunteer',
    coverLetter: 'Mezunlarımızın başlattığı bu açık kaynak gönüllü topluluk projesine kodlama ve test süreçlerinde destek olmak istiyorum.',
    status: 'accepted', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), updatedAt: null
  }
];
let nextId = 4;

const jobApplicationRepository = {
  async findByPosting(jobPostingId) {
    if (pool) {
      if (!isId(jobPostingId)) return [];
      const res = await pool.query(`SELECT ${SELECT} FROM applications WHERE job_posting_id = $1 ORDER BY id ASC`, [jobPostingId]);
      return res.rows.map(normalize);
    }
    return memory.filter(a => String(a.jobPostingId) === String(jobPostingId)).map(a => ({ ...a }));
  },

  async findById(id) {
    if (pool) {
      if (!isId(id)) return null;
      const res = await pool.query(`SELECT ${SELECT} FROM applications WHERE id = $1`, [id]);
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const a = memory.find(x => String(x.id) === String(id));
    return a ? { ...a } : null;
  },

  async findByPostingAndUser(jobPostingId, userId) {
    if (pool) {
      if (!isId(jobPostingId) || !isId(userId)) return null;
      const res = await pool.query(
        `SELECT ${SELECT} FROM applications WHERE job_posting_id = $1 AND applicant_user_id = $2`,
        [jobPostingId, userId]
      );
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const a = memory.find(x => String(x.jobPostingId) === String(jobPostingId) && String(x.applicantUserId) === String(userId));
    return a ? { ...a } : null;
  },

  async create({ jobPostingId, applicantUserId, coverLetter, type = 'job' }) {
    if (pool) {
      const res = await pool.query(
        `INSERT INTO applications (job_posting_id, applicant_user_id, cover_letter, type)
         VALUES ($1, $2, $3, $4) RETURNING ${SELECT}`,
        [jobPostingId, applicantUserId, coverLetter || null, type]
      );
      return normalize(res.rows[0]);
    }
    const item = {
      id: nextId++, jobPostingId: Number(jobPostingId), applicantUserId: Number(applicantUserId),
      type, coverLetter: coverLetter || null, status: 'submitted',
      createdAt: new Date().toISOString(), updatedAt: null
    };
    memory.push(item);
    return { ...item };
  },

  async updateStatus(id, status) {
    if (pool) {
      if (!isId(id)) return null;
      const res = await pool.query(
        `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING ${SELECT}`,
        [status, id]
      );
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const item = memory.find(x => String(x.id) === String(id));
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    return { ...item };
  },

  async delete(id) {
    if (pool) {
      if (!isId(id)) return false;
      const res = await pool.query('DELETE FROM applications WHERE id = $1', [id]);
      return res.rowCount > 0;
    }
    const index = memory.findIndex(x => String(x.id) === String(id));
    if (index === -1) return false;
    memory.splice(index, 1);
    return true;
  },

  async findByUser(userId) {
    if (pool) {
      if (!isId(userId)) return [];
      const res = await pool.query(`SELECT ${SELECT} FROM applications WHERE applicant_user_id = $1 ORDER BY id DESC`, [userId]);
      return res.rows.map(normalize);
    }
    return memory.filter(a => String(a.applicantUserId) === String(userId)).map(a => ({ ...a })).reverse();
  },

  async findAll(filters = {}) {
    if (pool) {
      const where = [];
      const params = [];
      if (filters.userId && isId(filters.userId)) {
        params.push(Number(filters.userId));
        where.push(`applicant_user_id = $${params.length}`);
      }
      if (filters.jobPostingId && isId(filters.jobPostingId)) {
        params.push(Number(filters.jobPostingId));
        where.push(`job_posting_id = $${params.length}`);
      }
      const sql = `SELECT ${SELECT} FROM applications ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
      const res = await pool.query(sql, params);
      return res.rows.map(normalize);
    }
    return memory.filter(a => {
      if (filters.userId && String(a.applicantUserId) !== String(filters.userId)) return false;
      if (filters.jobPostingId && String(a.jobPostingId) !== String(filters.jobPostingId)) return false;
      return true;
    }).map(a => ({ ...a })).reverse();
  },

  /** In-memory modda ilan silinince basvurulari da siler (DB'de FK CASCADE yapar). */
  removeByPostingInMemory(jobPostingId) {
    for (let i = memory.length - 1; i >= 0; i--) {
      if (String(memory[i].jobPostingId) === String(jobPostingId)) memory.splice(i, 1);
    }
  }
};

module.exports = jobApplicationRepository;

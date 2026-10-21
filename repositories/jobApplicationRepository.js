const { pool } = require('../config/db');

/**
 * Job Application Repository (PostgreSQL; DB yoksa in-memory yedek)
 */
const SELECT = `id, job_posting_id AS "jobPostingId", applicant_user_id AS "applicantUserId",
  cover_letter AS "coverLetter", status, created_at AS "createdAt", updated_at AS "updatedAt"`;

const iso = (v) => (v ? new Date(v).toISOString() : null);
const normalize = (r) => ({ ...r, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) });
const isId = (id) => /^\d+$/.test(String(id));

const memory = [];
let nextId = 1;

const jobApplicationRepository = {
  async findByPosting(jobPostingId) {
    if (pool) {
      if (!isId(jobPostingId)) return [];
      const res = await pool.query(`SELECT ${SELECT} FROM job_applications WHERE job_posting_id = $1 ORDER BY id ASC`, [jobPostingId]);
      return res.rows.map(normalize);
    }
    return memory.filter(a => String(a.jobPostingId) === String(jobPostingId)).map(a => ({ ...a }));
  },

  async findById(id) {
    if (pool) {
      if (!isId(id)) return null;
      const res = await pool.query(`SELECT ${SELECT} FROM job_applications WHERE id = $1`, [id]);
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const a = memory.find(x => String(x.id) === String(id));
    return a ? { ...a } : null;
  },

  async findByPostingAndUser(jobPostingId, userId) {
    if (pool) {
      if (!isId(jobPostingId) || !isId(userId)) return null;
      const res = await pool.query(
        `SELECT ${SELECT} FROM job_applications WHERE job_posting_id = $1 AND applicant_user_id = $2`,
        [jobPostingId, userId]
      );
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const a = memory.find(x => String(x.jobPostingId) === String(jobPostingId) && String(x.applicantUserId) === String(userId));
    return a ? { ...a } : null;
  },

  async create({ jobPostingId, applicantUserId, coverLetter }) {
    if (pool) {
      const res = await pool.query(
        `INSERT INTO job_applications (job_posting_id, applicant_user_id, cover_letter)
         VALUES ($1, $2, $3) RETURNING ${SELECT}`,
        [jobPostingId, applicantUserId, coverLetter || null]
      );
      return normalize(res.rows[0]);
    }
    const item = {
      id: nextId++, jobPostingId: Number(jobPostingId), applicantUserId: Number(applicantUserId),
      coverLetter: coverLetter || null, status: 'submitted',
      createdAt: new Date().toISOString(), updatedAt: null
    };
    memory.push(item);
    return { ...item };
  },

  async updateStatus(id, status) {
    if (pool) {
      if (!isId(id)) return null;
      const res = await pool.query(
        `UPDATE job_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING ${SELECT}`,
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
      const res = await pool.query('DELETE FROM job_applications WHERE id = $1', [id]);
      return res.rowCount > 0;
    }
    const index = memory.findIndex(x => String(x.id) === String(id));
    if (index === -1) return false;
    memory.splice(index, 1);
    return true;
  },

  /** In-memory modda ilan silinince basvurulari da siler (DB'de FK CASCADE yapar). */
  removeByPostingInMemory(jobPostingId) {
    for (let i = memory.length - 1; i >= 0; i--) {
      if (String(memory[i].jobPostingId) === String(jobPostingId)) memory.splice(i, 1);
    }
  }
};

module.exports = jobApplicationRepository;

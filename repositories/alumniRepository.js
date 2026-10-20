const { pool } = require('../config/db');
const { makeMany } = require('../data/factories/alumniFactory');

/**
 * Alumni Repository
 * Tum alumni veri erisimi burada toplanir (PostgreSQL; DB yoksa in-memory yedek).
 */
const COLUMNS = ['first_name', 'last_name', 'email', 'phone', 'graduation_year',
  'department', 'current_company', 'job_title', 'city', 'linkedin_url'];

const SELECT = `id, first_name AS "firstName", last_name AS "lastName", email, phone,
  graduation_year AS "graduationYear", department, current_company AS "currentCompany",
  job_title AS "jobTitle", city, linkedin_url AS "linkedinUrl",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

// camelCase API alani -> snake_case kolon
const FIELD_TO_COLUMN = {
  firstName: 'first_name', lastName: 'last_name', email: 'email', phone: 'phone',
  graduationYear: 'graduation_year', department: 'department', currentCompany: 'current_company',
  jobTitle: 'job_title', city: 'city', linkedinUrl: 'linkedin_url'
};

function toIso(v) {
  return v ? new Date(v).toISOString() : null;
}

function normalizeRow(r) {
  return { ...r, createdAt: toIso(r.createdAt), updatedAt: toIso(r.updatedAt) };
}

// ---- In-memory yedek ----
const memory = makeMany(5).map((r, i) => ({
  id: i + 1,
  firstName: r.first_name, lastName: r.last_name, email: r.email, phone: r.phone,
  graduationYear: r.graduation_year, department: r.department, currentCompany: r.current_company,
  jobTitle: r.job_title, city: r.city, linkedinUrl: r.linkedin_url,
  createdAt: new Date().toISOString(), updatedAt: null
}));
let nextId = memory.length + 1;

const alumniRepository = {
  /**
   * @param {Object} filters { department, graduationYear, city, search }
   */
  async findAll(filters = {}) {
    if (pool) {
      const where = [];
      const params = [];
      if (filters.department) { params.push(filters.department); where.push(`department = $${params.length}`); }
      if (filters.graduationYear) { params.push(Number(filters.graduationYear)); where.push(`graduation_year = $${params.length}`); }
      if (filters.city) { params.push(filters.city); where.push(`city = $${params.length}`); }
      if (filters.search) {
        params.push(`%${filters.search}%`);
        where.push(`(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
      }
      const sql = `SELECT ${SELECT} FROM alumni ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id ASC`;
      const res = await pool.query(sql, params);
      return res.rows.map(normalizeRow);
    }
    const s = filters.search ? String(filters.search).toLowerCase() : null;
    return memory.filter(a =>
      (!filters.department || a.department === filters.department) &&
      (!filters.graduationYear || a.graduationYear === Number(filters.graduationYear)) &&
      (!filters.city || a.city === filters.city) &&
      (!s || [a.firstName, a.lastName, a.email].some(v => v.toLowerCase().includes(s)))
    ).map(a => ({ ...a }));
  },

  async findById(id) {
    if (pool) {
      if (!/^\d+$/.test(String(id))) return null;
      const res = await pool.query(`SELECT ${SELECT} FROM alumni WHERE id = $1`, [id]);
      return res.rows[0] ? normalizeRow(res.rows[0]) : null;
    }
    const a = memory.find(x => String(x.id) === String(id));
    return a ? { ...a } : null;
  },

  async findByEmail(email) {
    const normalized = String(email).trim().toLowerCase();
    if (pool) {
      const res = await pool.query(`SELECT ${SELECT} FROM alumni WHERE LOWER(email) = $1`, [normalized]);
      return res.rows[0] ? normalizeRow(res.rows[0]) : null;
    }
    const a = memory.find(x => x.email.toLowerCase() === normalized);
    return a ? { ...a } : null;
  },

  async create(data) {
    const values = {
      ...data,
      email: data.email.trim().toLowerCase()
    };
    if (pool) {
      const cols = Object.keys(FIELD_TO_COLUMN).filter(f => values[f] !== undefined);
      const params = cols.map(f => values[f]);
      const res = await pool.query(
        `INSERT INTO alumni (${cols.map(f => FIELD_TO_COLUMN[f]).join(', ')})
         VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})
         RETURNING ${SELECT}`,
        params
      );
      return normalizeRow(res.rows[0]);
    }
    const item = {
      id: nextId++,
      firstName: null, lastName: null, email: null, phone: null, graduationYear: null,
      department: null, currentCompany: null, jobTitle: null, city: null, linkedinUrl: null,
      ...values,
      createdAt: new Date().toISOString(), updatedAt: null
    };
    memory.push(item);
    return { ...item };
  },

  /**
   * Verilen alanlari gunceller (kismi guncelleme). Bulunamazsa null doner.
   */
  async update(id, fields) {
    const data = { ...fields };
    if (data.email !== undefined) data.email = data.email.trim().toLowerCase();

    if (pool) {
      if (!/^\d+$/.test(String(id))) return null;
      const cols = Object.keys(FIELD_TO_COLUMN).filter(f => data[f] !== undefined);
      const sets = cols.map((f, i) => `${FIELD_TO_COLUMN[f]} = $${i + 1}`);
      const params = cols.map(f => data[f]);
      params.push(id);
      const res = await pool.query(
        `UPDATE alumni SET ${sets.concat('updated_at = NOW()').join(', ')}
         WHERE id = $${params.length} RETURNING ${SELECT}`,
        params
      );
      return res.rows[0] ? normalizeRow(res.rows[0]) : null;
    }
    const item = memory.find(x => String(x.id) === String(id));
    if (!item) return null;
    Object.keys(FIELD_TO_COLUMN).forEach(f => { if (data[f] !== undefined) item[f] = data[f]; });
    item.updatedAt = new Date().toISOString();
    return { ...item };
  },

  async delete(id) {
    if (pool) {
      if (!/^\d+$/.test(String(id))) return false;
      const res = await pool.query('DELETE FROM alumni WHERE id = $1', [id]);
      return res.rowCount > 0;
    }
    const index = memory.findIndex(x => String(x.id) === String(id));
    if (index === -1) return false;
    memory.splice(index, 1);
    return true;
  }
};

module.exports = alumniRepository;

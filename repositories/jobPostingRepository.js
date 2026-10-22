const { pool } = require('../config/db');
const jobApplicationRepository = require('./jobApplicationRepository');

/**
 * Job Posting Repository (PostgreSQL; DB yoksa in-memory yedek)
 */
const FIELD_TO_COLUMN = {
  alumniId: 'alumni_id', title: 'title', description: 'description', companyName: 'company_name',
  city: 'city', country: 'country', employmentType: 'employment_type', workMode: 'work_mode',
  experienceLevel: 'experience_level', requiredSkills: 'required_skills', contactEmail: 'contact_email',
  externalApplicationLink: 'external_application_link', applicationDeadline: 'application_deadline',
  status: 'status', latitude: 'latitude', longitude: 'longitude'
};
const FIELDS = Object.keys(FIELD_TO_COLUMN);

const SELECT = `id, alumni_id AS "alumniId", title, description, company_name AS "companyName", city,
  TRIM(country) AS country, employment_type AS "employmentType", work_mode AS "workMode",
  experience_level AS "experienceLevel", required_skills AS "requiredSkills",
  contact_email AS "contactEmail", external_application_link AS "externalApplicationLink",
  TO_CHAR(application_deadline, 'YYYY-MM-DD') AS "applicationDeadline", status,
  latitude::float8 AS latitude, longitude::float8 AS longitude,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

const iso = (v) => (v ? new Date(v).toISOString() : null);
const normalize = (r) => ({ ...r, createdAt: iso(r.createdAt), updatedAt: iso(r.updatedAt) });
const isId = (id) => /^\d+$/.test(String(id));

const memory = [
  {
    id: 1, alumniId: 1, title: 'Junior Backend Geliştirici (Node.js & PostgreSQL)',
    description: 'Node.js ve PostgreSQL ile çalışacak, takım çalışmasına yatkın junior geliştirici aranıyor.',
    companyName: 'Trendyol', city: 'Istanbul', country: 'TR', employmentType: 'full_time',
    workMode: 'hybrid', experienceLevel: 'entry', requiredSkills: 'Node.js, PostgreSQL, Git, REST API',
    contactEmail: 'kariyer@trendyol.example.com', externalApplicationLink: null,
    applicationDeadline: '2026-12-31', status: 'open', latitude: 41.0643, longitude: 29.0069,
    createdAt: new Date().toISOString(), updatedAt: null
  },
  {
    id: 2, alumniId: 1, title: 'Yaz Stajı - İş Analizi & Süreç Yönetimi',
    description: 'Yönetim Bilişim Sistemleri öğrencileri için 8 haftalık kurumsal staj programı. Dahili başvuru takibi yapılmaktadır.',
    companyName: 'Garanti BBVA', city: 'Istanbul', country: 'TR', employmentType: 'internship',
    workMode: 'onsite', experienceLevel: 'entry', requiredSkills: 'SQL, Excel, UML, Problem Çözme',
    contactEmail: null, externalApplicationLink: null,
    applicationDeadline: '2026-12-15', status: 'open', latitude: 41.0138, longitude: 28.9497,
    createdAt: new Date().toISOString(), updatedAt: null
  },
  {
    id: 3, alumniId: 1, title: 'Frontend React Geliştirici',
    description: 'Kullanıcı deneyimini en üst seviyeye taşıyacak, modern ve responsive web arayüzleri geliştirecek takım arkadaşı arıyoruz.',
    companyName: 'Getir', city: 'Izmir', country: 'TR', employmentType: 'full_time',
    workMode: 'hybrid', experienceLevel: 'mid', requiredSkills: 'React, TypeScript, CSS3, Redux',
    contactEmail: 'kariyer@getir.example.com', externalApplicationLink: 'https://careers.example.com/getir/fe',
    applicationDeadline: '2027-01-15', status: 'open', latitude: 38.4237, longitude: 27.1428,
    createdAt: new Date().toISOString(), updatedAt: null
  },
  {
    id: 4, alumniId: 2, title: 'Mezunlar Web Portali Açık Kaynak Gönüllü Geliştirici',
    description: 'Üniversitemiz mezun ağı tarafından geliştirilen açık kaynaklı web uygulamasına gönüllü olarak katkıda bulunacak geliştiriciler aranıyor.',
    companyName: 'Mezunlar Bilişim Kulübü', city: 'Ankara', country: 'TR', employmentType: 'volunteer',
    workMode: 'remote', experienceLevel: null, requiredSkills: 'JavaScript, HTML5, CSS3, Git, Topluluk Katılımı',
    contactEmail: null, externalApplicationLink: null,
    applicationDeadline: '2027-02-28', status: 'open', latitude: 39.9334, longitude: 32.8597,
    createdAt: new Date().toISOString(), updatedAt: null
  },
  {
    id: 5, alumniId: 1, title: 'Ürün Yöneticisi Asistanı (Remote)',
    description: 'Mezun ağımız üzerinden duyurulan, mentorluk destekli part-time asistan pozisyonu.',
    companyName: 'SAP', city: 'Berlin', country: 'DE', employmentType: 'part_time',
    workMode: 'remote', experienceLevel: 'mid', requiredSkills: 'Ürün yönetimi, analitik düşünme, İngilizce',
    contactEmail: 'mehmet.demir@mezun.example.com', externalApplicationLink: null,
    applicationDeadline: '2027-03-30', status: 'open', latitude: 52.5200, longitude: 13.4050,
    createdAt: new Date().toISOString(), updatedAt: null
  }
];
let nextId = 6;

const jobPostingRepository = {
  /** filters: status, employmentType, workMode, city, alumniId, search */
  async findAll(filters = {}) {
    if (pool) {
      const where = [];
      const params = [];
      const add = (cond, v) => { params.push(v); where.push(cond.replace('?', `$${params.length}`)); };
      if (filters.status) add('status = ?', filters.status);
      if (filters.employmentType) add('employment_type = ?', filters.employmentType);
      if (filters.workMode) add('work_mode = ?', filters.workMode);
      if (filters.city) add('city = ?', filters.city);
      if (filters.alumniId && isId(filters.alumniId)) add('alumni_id = ?', Number(filters.alumniId));
      if (filters.search) {
        params.push(`%${filters.search}%`);
        where.push(`(title ILIKE $${params.length} OR company_name ILIKE $${params.length})`);
      }
      const sql = `SELECT ${SELECT} FROM job_postings ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
      return (await pool.query(sql, params)).rows.map(normalize);
    }
    const s = filters.search ? String(filters.search).toLowerCase() : null;
    return memory.filter(p =>
      (!filters.status || p.status === filters.status) &&
      (!filters.employmentType || p.employmentType === filters.employmentType) &&
      (!filters.workMode || p.workMode === filters.workMode) &&
      (!filters.city || p.city === filters.city) &&
      (!filters.alumniId || String(p.alumniId) === String(filters.alumniId)) &&
      (!s || p.title.toLowerCase().includes(s) || p.companyName.toLowerCase().includes(s))
    ).map(p => ({ ...p })).reverse();
  },

  async findById(id) {
    if (pool) {
      if (!isId(id)) return null;
      const res = await pool.query(`SELECT ${SELECT} FROM job_postings WHERE id = $1`, [id]);
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const p = memory.find(x => String(x.id) === String(id));
    return p ? { ...p } : null;
  },

  async create(data) {
    if (pool) {
      const cols = FIELDS.filter(f => data[f] !== undefined);
      const res = await pool.query(
        `INSERT INTO job_postings (${cols.map(f => FIELD_TO_COLUMN[f]).join(', ')})
         VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING ${SELECT}`,
        cols.map(f => data[f])
      );
      return normalize(res.rows[0]);
    }
    const item = {
      id: nextId++,
      city: null, country: null, experienceLevel: null, requiredSkills: null, contactEmail: null,
      externalApplicationLink: null, applicationDeadline: null, latitude: null, longitude: null,
      workMode: 'onsite', status: 'open',
      ...data,
      createdAt: new Date().toISOString(), updatedAt: null
    };
    memory.push(item);
    return { ...item };
  },

  async update(id, fields) {
    if (pool) {
      if (!isId(id)) return null;
      const cols = FIELDS.filter(f => fields[f] !== undefined);
      const sets = cols.map((f, i) => `${FIELD_TO_COLUMN[f]} = $${i + 1}`).concat('updated_at = NOW()');
      const params = cols.map(f => fields[f]).concat(id);
      const res = await pool.query(
        `UPDATE job_postings SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${SELECT}`,
        params
      );
      return res.rows[0] ? normalize(res.rows[0]) : null;
    }
    const item = memory.find(x => String(x.id) === String(id));
    if (!item) return null;
    FIELDS.forEach(f => { if (fields[f] !== undefined) item[f] = fields[f]; });
    item.updatedAt = new Date().toISOString();
    return { ...item };
  },

  async delete(id) {
    if (pool) {
      if (!isId(id)) return false;
      const res = await pool.query('DELETE FROM job_postings WHERE id = $1', [id]);
      return res.rowCount > 0;
    }
    const index = memory.findIndex(x => String(x.id) === String(id));
    if (index === -1) return false;
    memory.splice(index, 1);
    jobApplicationRepository.removeByPostingInMemory(id);
    return true;
  }
};

module.exports = jobPostingRepository;
module.exports.FIELDS = FIELDS;

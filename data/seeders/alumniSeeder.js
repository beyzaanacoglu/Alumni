const { makeMany } = require('../factories/alumniFactory');

/**
 * Alumni Seeder
 * Sabit (elle yazilmis) gercekci kayitlar + factory ile uretilen ek kayitlar ekler.
 * E-posta cakismalarinda kaydi atlar (idempotent).
 */
const FIXED_ALUMNI = [
  { first_name: 'Ayse', last_name: 'Yilmaz', email: 'ayse.yilmaz@mezun.example.com', phone: '+90 532 111 2233', graduation_year: 2018, department: 'Yonetim Bilisim Sistemleri', current_company: 'Trendyol', job_title: 'Yazilim Muhendisi', city: 'Istanbul', linkedin_url: 'https://www.linkedin.com/in/ayse-yilmaz' },
  { first_name: 'Mehmet', last_name: 'Demir', email: 'mehmet.demir@mezun.example.com', phone: '+90 533 222 3344', graduation_year: 2015, department: 'Yonetim Bilisim Sistemleri', current_company: 'SAP', job_title: 'Urun Yoneticisi', city: 'Berlin', linkedin_url: 'https://www.linkedin.com/in/mehmet-demir' },
  { first_name: 'Elif', last_name: 'Kaya', email: 'elif.kaya@mezun.example.com', phone: '+90 535 333 4455', graduation_year: 2020, department: 'Isletme', current_company: 'Garanti BBVA', job_title: 'Is Analisti', city: 'Ankara', linkedin_url: 'https://www.linkedin.com/in/elif-kaya' }
];

const EXTRA_COUNT = 12;

module.exports = {
  name: 'alumniSeeder',

  async run(pool) {
    const rows = [...FIXED_ALUMNI, ...makeMany(EXTRA_COUNT)];
    let inserted = 0;
    for (const r of rows) {
      const res = await pool.query(
        `INSERT INTO alumni
           (first_name, last_name, email, phone, graduation_year, department, current_company, job_title, city, linkedin_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (email) DO NOTHING`,
        [r.first_name, r.last_name, r.email, r.phone, r.graduation_year, r.department,
         r.current_company, r.job_title, r.city, r.linkedin_url]
      );
      inserted += res.rowCount;
    }
    return inserted;
  },

  FIXED_ALUMNI
};

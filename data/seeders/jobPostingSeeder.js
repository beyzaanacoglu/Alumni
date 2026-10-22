const { makeMany } = require('../factories/jobPostingFactory');

/**
 * Job Posting Seeder
 * Sabit ornek ilanlar + JobPostingFactory ile uretilen zengin sahte verileri ekler.
 * Mevcut mezun (alumni) kayitlarina baglar.
 * Idempotent: Ayni baslik ve sirket adina sahip ilanlar varsa tekrar eklemez.
 */
const FIXED_SAMPLE = [
  {
    title: 'Junior Yazilim Gelistirici (Node.js)',
    description: 'Node.js ve PostgreSQL ile calisacak, takim calismasina yatkin junior gelistirici araniyor.',
    company_name: 'Trendyol',
    city: 'Istanbul',
    country: 'TR',
    employment_type: 'full_time',
    work_mode: 'hybrid',
    experience_level: 'entry',
    required_skills: 'Node.js, PostgreSQL, Git',
    contact_email: 'kariyer@trendyol.example.com',
    external_application_link: 'https://careers.example.com/trendyol/junior-dev',
    application_deadline: '2026-12-31',
    latitude: 41.0643,
    longitude: 29.0069
  },
  {
    title: 'Yaz Staji - Is Analizi & Surec Yonetimi',
    description: 'Yonetim Bilisim Sistemleri ogrencileri icin 8 haftalik kurumsal staj programi. Dahili basvuru takibi yapilmaktadir.',
    company_name: 'Garanti BBVA',
    city: 'Istanbul',
    country: 'TR',
    employment_type: 'internship',
    work_mode: 'onsite',
    experience_level: 'entry',
    required_skills: 'SQL, Excel, UML',
    contact_email: null,
    external_application_link: null, // Dahili basvuru kabul eder
    application_deadline: '2026-12-15',
    latitude: 41.0138,
    longitude: 28.9497
  },
  {
    title: 'Urun Yoneticisi Asistani (Remote)',
    description: 'Mezun agimiz uzerinden duyurulan, mentorluk destekli part-time asistan pozisyonu.',
    company_name: 'SAP',
    city: 'Berlin',
    country: 'DE',
    employment_type: 'part_time',
    work_mode: 'remote',
    experience_level: 'mid',
    required_skills: 'Urun yonetimi, analitik dusunme, Ingilizce',
    contact_email: 'mehmet.demir@mezun.example.com',
    external_application_link: null, // Dahili basvuru kabul eder
    application_deadline: '2027-01-30',
    latitude: 52.5200,
    longitude: 13.4050
  }
];

const EXTRA_FACTORY_COUNT = 8;

module.exports = {
  name: 'jobPostingSeeder',

  async run(pool) {
    const { rows: alumniRows } = await pool.query('SELECT id FROM alumni ORDER BY id ASC');
    if (alumniRows.length === 0) {
      throw new Error('Alumni tablosu bos; once alumniSeeder calistirin.');
    }

    const factoryPostings = makeMany(EXTRA_FACTORY_COUNT);
    const allPostings = [...FIXED_SAMPLE, ...factoryPostings];

    let inserted = 0;
    for (let i = 0; i < allPostings.length; i++) {
      const p = allPostings[i];
      const alumniId = alumniRows[i % alumniRows.length].id;

      // Idempotency: ayni sirkette ayni baslikta ilan varsa atla
      const check = await pool.query(
        'SELECT id FROM job_postings WHERE title = $1 AND company_name = $2',
        [p.title, p.company_name]
      );

      if (check.rowCount > 0) {
        continue;
      }

      await pool.query(
        `INSERT INTO job_postings
           (alumni_id, title, description, company_name, city, country, employment_type, work_mode,
            experience_level, required_skills, contact_email, external_application_link,
            application_deadline, status, latitude, longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [
          alumniId,
          p.title,
          p.description,
          p.company_name,
          p.city,
          p.country || 'TR',
          p.employment_type,
          p.work_mode || 'onsite',
          p.experience_level || null,
          p.required_skills || null,
          p.contact_email || null,
          p.external_application_link || null,
          p.application_deadline || null,
          p.status || 'open',
          p.latitude || null,
          p.longitude || null
        ]
      );
      inserted++;
    }

    return inserted;
  },

  FIXED_SAMPLE
};

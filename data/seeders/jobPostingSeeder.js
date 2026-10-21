/**
 * Job Posting Seeder
 * Mevcut mezunlara baglanan gercekci ornek ilanlar ekler.
 * Dis baglantisi olan ilanlar harici basvuruya, baglantisi olmayanlar dahili basvuru takibine ornektir.
 */
const SAMPLE = [
  { title: 'Junior Yazilim Gelistirici', description: 'Node.js ve PostgreSQL ile calisacak, takim calismasina yatkin junior gelistirici araniyor.', company_name: 'Trendyol', city: 'Istanbul', country: 'TR', employment_type: 'full_time', work_mode: 'hybrid', experience_level: 'entry', required_skills: 'Node.js, PostgreSQL, Git', contact_email: 'kariyer@trendyol.example.com', external_application_link: 'https://careers.example.com/trendyol/junior-dev', application_deadline: '2026-12-31', latitude: 41.0643, longitude: 29.0069 },
  { title: 'Yaz Staji - Is Analizi', description: 'Yonetim Bilisim Sistemleri ogrencileri icin 8 haftalik staj programi.', company_name: 'Garanti BBVA', city: 'Istanbul', country: 'TR', employment_type: 'internship', work_mode: 'onsite', experience_level: 'entry', required_skills: 'SQL, Excel', contact_email: null, external_application_link: null, application_deadline: '2026-12-15', latitude: 41.0138, longitude: 28.9497 },
  { title: 'Urun Yoneticisi Asistani', description: 'Mezun agimiz uzerinden duyurulan, mentorluk destekli asistan pozisyonu.', company_name: 'SAP', city: 'Berlin', country: 'DE', employment_type: 'part_time', work_mode: 'remote', experience_level: 'mid', required_skills: 'Urun yonetimi, analitik dusunme', contact_email: 'mehmet.demir@mezun.example.com', external_application_link: null, application_deadline: null, latitude: null, longitude: null }
];

module.exports = {
  name: 'jobPostingSeeder',

  async run(pool) {
    const { rows } = await pool.query('SELECT id FROM alumni ORDER BY id ASC LIMIT 3');
    if (rows.length === 0) throw new Error('Alumni tablosu bos; once alumniSeeder calistirin.');

    const existing = await pool.query('SELECT COUNT(*)::int AS n FROM job_postings');
    if (existing.rows[0].n > 0) return 0;

    let inserted = 0;
    for (let i = 0; i < SAMPLE.length; i++) {
      const s = SAMPLE[i];
      await pool.query(
        `INSERT INTO job_postings
           (alumni_id, title, description, company_name, city, country, employment_type, work_mode,
            experience_level, required_skills, contact_email, external_application_link,
            application_deadline, latitude, longitude)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [rows[i % rows.length].id, s.title, s.description, s.company_name, s.city, s.country,
         s.employment_type, s.work_mode, s.experience_level, s.required_skills, s.contact_email,
         s.external_application_link, s.application_deadline, s.latitude, s.longitude]
      );
      inserted++;
    }
    return inserted;
  },

  SAMPLE
};

const fs = require('fs');
const path = require('path');
const { make } = require('../factories/applicationFactory');

/**
 * Application Seeder
 * Dahili basvuru kabul eden (external_application_link IS NULL) ilanlara aday basvurulari ekler.
 * Aday kullanicilar data/users.json dosyasindan okunur.
 * Idempotent: UNIQUE(job_posting_id, applicant_user_id) kisitlamasina gore ON CONFLICT DO NOTHING kullanir.
 */
module.exports = {
  name: 'applicationSeeder',

  async run(pool) {
    // 1. Dahili basvuru kabul eden ilanlari getir
    const { rows: postings } = await pool.query(
      `SELECT id, employment_type, alumni_id FROM job_postings
       WHERE external_application_link IS NULL
       ORDER BY id ASC`
    );

    if (postings.length === 0) {
      return 0;
    }

    // 2. Aday kullanicilari belirle (data/users.json veya varsayilan aday ID'leri)
    let candidateUserIds = [1, 2];
    try {
      const usersFile = path.join(__dirname, '..', 'users.json');
      if (fs.existsSync(usersFile)) {
        const users = JSON.parse(fs.readFileSync(usersFile, 'utf8') || '[]');
        if (users.length > 0) {
          candidateUserIds = users.map(u => u.id);
        }
      }
    } catch (e) {
      // fallback to [1, 2]
    }

    // Aday havuzunu zenginlestirmek icin en azindan 1..5 arasinda aday kimligi destekleyelim
    if (candidateUserIds.length < 4) {
      for (let i = 1; i <= 5; i++) {
        if (!candidateUserIds.includes(i)) candidateUserIds.push(i);
      }
    }

    let inserted = 0;
    let factoryIndex = 0;

    for (const posting of postings) {
      // Ilan turune gore basvuru tipini belirle
      let appType = 'job';
      if (posting.employment_type === 'internship') appType = 'internship';
      else if (posting.employment_type === 'volunteer') appType = 'volunteer';
      else if (posting.employment_type === 'project') appType = 'project';

      // Her dahili ilan icin 2 ila 3 farkli adaydan basvuru olustur
      for (const userId of candidateUserIds.slice(0, 3)) {
        const fakeApp = make(factoryIndex++, {
          job_posting_id: posting.id,
          applicant_user_id: userId,
          type: appType
        });

        const res = await pool.query(
          `INSERT INTO applications
             (job_posting_id, applicant_user_id, type, cover_letter, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (job_posting_id, applicant_user_id) DO NOTHING`,
          [posting.id, userId, fakeApp.type, fakeApp.cover_letter, fakeApp.status]
        );

        inserted += res.rowCount;
      }
    }

    return inserted;
  }
};

/**
 * Migration / seed calistirici.
 * Kullanim (DB_* ortam degiskenleri gerekli):
 *   node data/migrate.js up        # migration'lari uygula
 *   node data/migrate.js down      # geri al
 *   node data/migrate.js seed      # ornek verileri ekle
 *   node data/migrate.js fresh     # down + up + seed
 */
const { pool } = require('../config/db');
const migrations = require('./migrations');
const seeders = [
  require('./seeders/alumniSeeder'),
  require('./seeders/jobPostingSeeder'),
  require('./seeders/applicationSeeder')
];

async function main() {
  const cmd = process.argv[2] || 'up';
  if (!pool) {
    console.error('DB_HOST tanimli degil. .env.example dosyasina bakin.');
    process.exit(1);
  }
  try {
    if (cmd === 'down' || cmd === 'fresh') {
      for (const m of [...migrations].reverse()) {
        await m.down(pool);
        console.log(`[migrate] down: ${m.name}`);
      }
    }
    if (cmd === 'up' || cmd === 'fresh') {
      for (const m of migrations) {
        await m.up(pool);
        console.log(`[migrate] up: ${m.name}`);
      }
    }
    if (cmd === 'seed' || cmd === 'fresh') {
      for (const s of seeders) {
        const n = await s.run(pool);
        console.log(`[seed] ${s.name}: ${n} kayit eklendi`);
      }
    }
    if (!['up', 'down', 'seed', 'fresh'].includes(cmd)) {
      console.error('Gecersiz komut. up | down | seed | fresh');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('[migrate] hata:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

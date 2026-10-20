/**
 * Migration / seed calistirici.
 * Kullanim (DB_* ortam degiskenleri gerekli):
 *   node data/migrate.js up        # migration'lari uygula
 *   node data/migrate.js down      # geri al
 *   node data/migrate.js seed      # ornek verileri ekle
 *   node data/migrate.js fresh     # down + up + seed
 */
const { pool } = require('../config/db');
const migration = require('./migrations/001_create_alumni_table');
const alumniSeeder = require('./seeders/alumniSeeder');

async function main() {
  const cmd = process.argv[2] || 'up';
  if (!pool) {
    console.error('DB_HOST tanimli degil. .env.example dosyasina bakin.');
    process.exit(1);
  }
  try {
    if (cmd === 'down' || cmd === 'fresh') {
      await migration.down(pool);
      console.log(`[migrate] down: ${migration.name}`);
    }
    if (cmd === 'up' || cmd === 'fresh') {
      await migration.up(pool);
      console.log(`[migrate] up: ${migration.name}`);
    }
    if (cmd === 'seed' || cmd === 'fresh') {
      const n = await alumniSeeder.run(pool);
      console.log(`[seed] ${alumniSeeder.name}: ${n} kayit eklendi`);
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

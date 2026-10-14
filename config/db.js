const { Pool } = require('pg');

let pool = null;

if (process.env.DB_HOST) {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'alumni_user',
    password: process.env.DB_PASSWORD || 'alumni_secret_pass',
    database: process.env.DB_NAME || 'alumni_database',
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
  });
}

/**
 * Initializes database tables if they do not exist
 */
async function initDb() {
  if (!pool) {
    console.log('[DB] No DB_HOST configured, using in-memory / local storage.');
    return;
  }

  try {
    console.log(`[DB] Connecting to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT || 5432}...`);
    
    // Create announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      );
    `);

    // Seed initial announcements if table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM announcements');
    const count = parseInt(countResult.rows[0].count, 10);
    if (count === 0) {
      await pool.query(`
        INSERT INTO announcements (title, content, created_at) VALUES
        ('2026 Mezunlar Bulusmasi', 'Bu yilki geleneksel mezunlar bulusmamiz 15 Temmuz tarihinde kampus ana amfisinde gerceklestirilecektir. Tum mezunlarimiz davetlidir.', NOW()),
        ('Kariyer ve Mentorluk Programi', 'Yeni mezunlarimiz icin baslatilan mentorluk programi basvurulari acilmistir. Gonullu mentor olmak isteyen mezunlarimiz profil uzerinden basvurabilir.', NOW());
      `);
      console.log('[DB] Seeded initial announcements.');
    }

    console.log('[DB] Database tables initialized and ready.');
  } catch (err) {
    console.error('[DB] Database initialization error:', err.message);
  }
}

module.exports = {
  pool,
  initDb
};

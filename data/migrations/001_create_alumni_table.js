/**
 * Migration: alumni tablosu (PostgreSQL)
 * up()  -> tabloyu ve indexleri olusturur
 * down() -> tabloyu siler
 */
module.exports = {
  name: '001_create_alumni_table',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alumni (
        id              SERIAL PRIMARY KEY,
        first_name      VARCHAR(100) NOT NULL,
        last_name       VARCHAR(100) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        phone           VARCHAR(30),
        graduation_year SMALLINT NOT NULL CHECK (graduation_year BETWEEN 1950 AND 2100),
        department      VARCHAR(150) NOT NULL,
        current_company VARCHAR(150),
        job_title       VARCHAR(150),
        city            VARCHAR(100),
        linkedin_url    VARCHAR(255),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_alumni_graduation_year ON alumni (graduation_year);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_alumni_department ON alumni (department);');
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS alumni;');
  }
};

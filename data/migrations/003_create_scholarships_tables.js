/**
 * Migration: scholarships tablosu ve applications tablosu burs iliskisi (PostgreSQL)
 * external_application_link NULL ise ogrenci basvurulari applications tablosunda takip edilir.
 * is_anonymous TRUE ise mezunun adi arayuzde 'Anonim Mezun' olarak maskelenir.
 */
module.exports = {
  name: '003_create_scholarships_tables',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id                         SERIAL PRIMARY KEY,
        alumni_id                  INTEGER NOT NULL REFERENCES alumni(id) ON DELETE CASCADE,
        title                      VARCHAR(255) NOT NULL,
        description                TEXT NOT NULL,
        donor_name                 VARCHAR(255),
        is_anonymous               BOOLEAN NOT NULL DEFAULT FALSE,
        amount                     NUMERIC(10,2),
        currency                   CHAR(3) NOT NULL DEFAULT 'TRY',
        duration                   VARCHAR(100),
        quota                      INTEGER,
        requirements               TEXT,
        contact_email              VARCHAR(255),
        external_application_link  VARCHAR(500),
        application_deadline       DATE,
        status                     VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
        created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at                 TIMESTAMPTZ
      );
    `);

    await pool.query('CREATE INDEX IF NOT EXISTS idx_scholarships_status_deadline ON scholarships (status, application_deadline);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_scholarships_is_anonymous ON scholarships (is_anonymous);');

    // applications tablosuna scholarship_id sutununu ekle
    await pool.query(`
      ALTER TABLE applications 
      ADD COLUMN IF NOT EXISTS scholarship_id INTEGER REFERENCES scholarships(id) ON DELETE CASCADE;
    `);

    // applications tablosunun job_posting_id alanini NULL kabul edilebilir yap (burs basvurulari icin)
    await pool.query(`
      ALTER TABLE applications ALTER COLUMN job_posting_id DROP NOT NULL;
    `);

    // scholarship_id ve applicant_user_id cifti icin benzersizlik kurali
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'uq_applications_scholarship_user'
        ) THEN
          ALTER TABLE applications ADD CONSTRAINT uq_applications_scholarship_user UNIQUE (scholarship_id, applicant_user_id);
        END IF;
      END $$;
    `);
  },

  async down(pool) {
    await pool.query('ALTER TABLE applications DROP CONSTRAINT IF EXISTS uq_applications_scholarship_user;');
    await pool.query('ALTER TABLE applications DROP COLUMN IF EXISTS scholarship_id;');
    await pool.query('DROP TABLE IF EXISTS scholarships;');
  }
};

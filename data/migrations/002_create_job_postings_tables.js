/**
 * Migration: job_postings ve job_applications tablolari (PostgreSQL)
 * job_postings.external_application_link NULL ise basvurular job_applications tablosunda takip edilir.
 * Not: kullanicilar data/users.json icinde tutuldugu icin applicant_user_id uzerinde FK yoktur;
 * varlik kontrolu uygulama katmaninda yapilir.
 */
module.exports = {
  name: '002_create_job_postings_tables',

  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id                         SERIAL PRIMARY KEY,
        alumni_id                  INTEGER NOT NULL REFERENCES alumni(id) ON DELETE CASCADE,
        title                      VARCHAR(255) NOT NULL,
        description                TEXT NOT NULL,
        company_name               VARCHAR(255) NOT NULL,
        city                       VARCHAR(100),
        country                    CHAR(2),
        employment_type            VARCHAR(20) NOT NULL
                                   CHECK (employment_type IN ('full_time','part_time','internship','volunteer','project','contract')),
        work_mode                  VARCHAR(10) NOT NULL DEFAULT 'onsite'
                                   CHECK (work_mode IN ('onsite','remote','hybrid')),
        experience_level           VARCHAR(10) CHECK (experience_level IN ('entry','mid','senior')),
        required_skills            TEXT,
        contact_email              VARCHAR(255),
        external_application_link  VARCHAR(500),
        application_deadline       DATE,
        status                     VARCHAR(10) NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
        latitude                   NUMERIC(10,8) CHECK (latitude BETWEEN -90 AND 90),
        longitude                  NUMERIC(11,8) CHECK (longitude BETWEEN -180 AND 180),
        created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at                 TIMESTAMPTZ
      );
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_job_postings_status_deadline ON job_postings (status, application_deadline);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_job_postings_employment_type ON job_postings (employment_type);');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id                SERIAL PRIMARY KEY,
        job_posting_id    INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
        applicant_user_id INTEGER NOT NULL,
        type              VARCHAR(20) NOT NULL DEFAULT 'job' CHECK (type IN ('job','internship','volunteer','project')),
        cover_letter      TEXT,
        status            VARCHAR(15) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','submitted','reviewing','accepted','rejected')),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ,
        UNIQUE (job_posting_id, applicant_user_id)
      );
    `);
  },

  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS applications;');
    await pool.query('DROP TABLE IF EXISTS job_applications;');
    await pool.query('DROP TABLE IF EXISTS job_postings;');
  }
};

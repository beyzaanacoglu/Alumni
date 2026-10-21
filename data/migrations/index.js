/**
 * Siralanmis migration listesi. up() sirayla, down() tersten calisir.
 */
module.exports = [
  require('./001_create_alumni_table'),
  require('./002_create_job_postings_tables'),
  require('./003_create_scholarships_tables')
];

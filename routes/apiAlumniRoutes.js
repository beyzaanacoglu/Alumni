const ApiAlumniController = require('../controllers/apiAlumniController');

/**
 * Dispatches /api/alumni requests to ApiAlumniController.
 * @returns {Promise<boolean>} true if handled
 */
async function handleApiAlumniRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  if (path === '/api/alumni') {
    if (method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      await ApiAlumniController.getAll(req, res, Object.fromEntries(url.searchParams));
      return true;
    }
    if (method === 'POST') {
      await ApiAlumniController.create(req, res);
      return true;
    }
    return false;
  }

  // Match /api/alumni/:id/jobs
  const jobsMatch = pathWithoutPrefix.match(/^\/api\/alumni\/([^\/]+)\/jobs$/i);
  if (jobsMatch) {
    const id = jobsMatch[1];
    if (method === 'GET') { await ApiAlumniController.getJobs(req, res, id); return true; }
    return false;
  }

  const match = pathWithoutPrefix.match(/^\/api\/alumni\/([^\/]+)$/i);
  if (match) {
    const id = match[1];
    if (method === 'GET') { await ApiAlumniController.getById(req, res, id); return true; }
    if (method === 'PUT') { await ApiAlumniController.update(req, res, id, false); return true; }
    if (method === 'PATCH') { await ApiAlumniController.update(req, res, id, true); return true; }
    if (method === 'DELETE') { await ApiAlumniController.remove(req, res, id); return true; }
  }

  return false;
}

module.exports = { handleApiAlumniRoutes };

const ApiJobPostingController = require('../controllers/apiJobPostingController');

/**
 * Dispatches /api/job-postings requests to ApiJobPostingController.
 * @returns {Promise<boolean>} true if handled
 */
async function handleApiJobPostingRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  // /api/job-postings
  if (path === '/api/job-postings') {
    if (method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      await ApiJobPostingController.getAll(req, res, Object.fromEntries(url.searchParams));
      return true;
    }
    if (method === 'POST') {
      await ApiJobPostingController.create(req, res);
      return true;
    }
    return false;
  }

  // /api/job-postings/:id/applications/:appId
  const appItemMatch = pathWithoutPrefix.match(/^\/api\/job-postings\/([^\/]+)\/applications\/([^\/]+)$/i);
  if (appItemMatch) {
    const [, id, appId] = appItemMatch;
    if (method === 'PATCH') { await ApiJobPostingController.updateApplicationStatus(req, res, id, appId); return true; }
    if (method === 'DELETE') { await ApiJobPostingController.deleteApplication(req, res, id, appId); return true; }
    return false;
  }

  // /api/job-postings/:id/applications
  const appListMatch = pathWithoutPrefix.match(/^\/api\/job-postings\/([^\/]+)\/applications$/i);
  if (appListMatch) {
    const id = appListMatch[1];
    if (method === 'GET') { await ApiJobPostingController.getApplications(req, res, id); return true; }
    if (method === 'POST') { await ApiJobPostingController.apply(req, res, id); return true; }
    return false;
  }

  // /api/job-postings/:id
  const match = pathWithoutPrefix.match(/^\/api\/job-postings\/([^\/]+)$/i);
  if (match) {
    const id = match[1];
    if (method === 'GET') { await ApiJobPostingController.getById(req, res, id); return true; }
    if (method === 'PUT') { await ApiJobPostingController.update(req, res, id, false); return true; }
    if (method === 'PATCH') { await ApiJobPostingController.update(req, res, id, true); return true; }
    if (method === 'DELETE') { await ApiJobPostingController.remove(req, res, id); return true; }
  }

  return false;
}

module.exports = { handleApiJobPostingRoutes };

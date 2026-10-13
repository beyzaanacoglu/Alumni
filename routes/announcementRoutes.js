const AnnouncementController = require('../controllers/announcementController');

/**
 * Parses form urlencoded or json body for view post actions
 */
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        if (body.startsWith('{')) {
          return resolve(JSON.parse(body));
        }
        // form urlencoded
        const params = new URLSearchParams(body);
        const obj = {};
        for (const [k, v] of params.entries()) {
          obj[k] = v;
        }
        resolve(obj);
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Dispatches View Announcement requests to AnnouncementController.
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} pathWithoutPrefix - Normalized route path
 * @returns {Promise<boolean>} True if route matched and handled, false otherwise
 */
async function handleAnnouncementRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  // GET /announcements
  if (method === 'GET' && (path === '/announcements' || path === '/announcements/')) {
    AnnouncementController.listAnnouncements(req, res);
    return true;
  }

  // POST /announcements
  if (method === 'POST' && (path === '/announcements' || path === '/announcements/')) {
    const body = await parseBody(req);
    AnnouncementController.createAnnouncement(req, res, body);
    return true;
  }

  // GET /announcements/:id/edit
  const editMatch = pathWithoutPrefix.match(/^\/announcements\/([^\/]+)\/edit$/i);
  if (method === 'GET' && editMatch) {
    AnnouncementController.editAnnouncement(req, res, editMatch[1]);
    return true;
  }

  // POST /announcements/:id/update
  const updateMatch = pathWithoutPrefix.match(/^\/announcements\/([^\/]+)\/update$/i);
  if (method === 'POST' && updateMatch) {
    const body = await parseBody(req);
    AnnouncementController.updateAnnouncement(req, res, updateMatch[1], body);
    return true;
  }

  // POST /announcements/:id/delete
  const deleteMatch = pathWithoutPrefix.match(/^\/announcements\/([^\/]+)\/delete$/i);
  if (method === 'POST' && deleteMatch) {
    AnnouncementController.deleteAnnouncement(req, res, deleteMatch[1]);
    return true;
  }

  // GET /announcements/:id
  const showMatch = pathWithoutPrefix.match(/^\/announcements\/([^\/]+)$/i);
  if (method === 'GET' && showMatch) {
    AnnouncementController.showAnnouncement(req, res, showMatch[1]);
    return true;
  }

  return false;
}

module.exports = {
  handleAnnouncementRoutes
};

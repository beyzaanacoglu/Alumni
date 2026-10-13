const ApiAnnouncementController = require('../controllers/apiAnnouncementController');

/**
 * Dispatches API Announcement requests to ApiAnnouncementController.
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} pathWithoutPrefix - Normalized route path
 * @returns {Promise<boolean>} True if route matched and handled, false otherwise
 */
async function handleApiAnnouncementRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  // GET /api/announcements
  if (method === 'GET' && path === '/api/announcements') {
    await ApiAnnouncementController.getAllAnnouncements(req, res);
    return true;
  }

  // POST /api/announcements
  if (method === 'POST' && path === '/api/announcements') {
    await ApiAnnouncementController.createAnnouncement(req, res);
    return true;
  }

  // Match /api/announcements/:id
  const announcementWithIdMatch = pathWithoutPrefix.match(/^\/api\/announcements\/([^\/]+)$/i);
  if (announcementWithIdMatch) {
    const id = announcementWithIdMatch[1];

    if (method === 'GET') {
      await ApiAnnouncementController.getAnnouncementById(req, res, id);
      return true;
    }

    if (method === 'PUT') {
      await ApiAnnouncementController.updateAnnouncement(req, res, id);
      return true;
    }

    if (method === 'PATCH') {
      await ApiAnnouncementController.patchAnnouncement(req, res, id);
      return true;
    }

    if (method === 'DELETE') {
      await ApiAnnouncementController.deleteAnnouncement(req, res, id);
      return true;
    }
  }

  return false;
}

module.exports = {
  handleApiAnnouncementRoutes
};

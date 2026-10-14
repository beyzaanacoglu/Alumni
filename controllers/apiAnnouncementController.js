const AnnouncementModel = require('../models/announcementModel');

/**
 * Helper to parse request body as JSON
 */
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

/**
 * Helper to send JSON responses with status code
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

const ApiAnnouncementController = {
  /**
   * GET /api/announcements
   * Retrieves all announcements.
   */
  async getAllAnnouncements(req, res) {
    try {
      const list = await AnnouncementModel.getAllAnnouncements();
      return sendJson(res, 200, list);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * GET /api/announcements/:id
   * Retrieves a single announcement by ID.
   */
  async getAnnouncementById(req, res, id) {
    try {
      const item = await AnnouncementModel.getAnnouncementById(id);
      if (!item) {
        return sendJson(res, 404, { error: 'Announcement not found.' });
      }
      return sendJson(res, 200, item);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * POST /api/announcements
   * Creates a new announcement.
   */
  async createAnnouncement(req, res) {
    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { title, content } = parsed;

      // Validation
      if (!title || typeof title !== 'string' || !title.trim() ||
          !content || typeof content !== 'string' || !content.trim()) {
        return sendJson(res, 400, {
          error: "Validation failed: 'title' and 'content' are required non-empty fields."
        });
      }

      const created = await AnnouncementModel.createAnnouncement({
        title: title.trim(),
        content: content.trim()
      });

      return sendJson(res, 201, created);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * PUT /api/announcements/:id
   * Fully updates an existing announcement.
   */
  async updateAnnouncement(req, res, id) {
    const existing = await AnnouncementModel.getAnnouncementById(id);
    if (!existing) {
      return sendJson(res, 404, { error: 'Announcement not found.' });
    }

    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { title, content } = parsed;

      // For full update, both title and content are required
      if (!title || typeof title !== 'string' || !title.trim() ||
          !content || typeof content !== 'string' || !content.trim()) {
        return sendJson(res, 400, {
          error: "Validation failed: 'title' and 'content' are required for a full update."
        });
      }

      const updated = await AnnouncementModel.updateAnnouncement(id, {
        title: title.trim(),
        content: content.trim()
      });

      return sendJson(res, 200, updated);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * PATCH /api/announcements/:id
   * Partially updates an existing announcement.
   */
  async patchAnnouncement(req, res, id) {
    const existing = await AnnouncementModel.getAnnouncementById(id);
    if (!existing) {
      return sendJson(res, 404, { error: 'Announcement not found.' });
    }

    try {
      const rawBody = await getRequestBody(req);
      let parsed;
      try {
        parsed = JSON.parse(rawBody || '{}');
      } catch (jsonErr) {
        return sendJson(res, 400, { error: 'Invalid JSON format.' });
      }

      const { title, content } = parsed;

      if (title === undefined && content === undefined) {
        return sendJson(res, 400, {
          error: "Validation failed: At least one field ('title' or 'content') must be provided."
        });
      }

      const updateData = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || !title.trim()) {
          return sendJson(res, 400, {
            error: "Validation failed: 'title' must be a non-empty string."
          });
        }
        updateData.title = title.trim();
      }

      if (content !== undefined) {
        if (typeof content !== 'string' || !content.trim()) {
          return sendJson(res, 400, {
            error: "Validation failed: 'content' must be a non-empty string."
          });
        }
        updateData.content = content.trim();
      }

      const updated = await AnnouncementModel.updateAnnouncement(id, updateData);

      return sendJson(res, 200, updated);
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  },

  /**
   * DELETE /api/announcements/:id
   * Deletes an announcement by ID.
   */
  async deleteAnnouncement(req, res, id) {
    const existing = await AnnouncementModel.getAnnouncementById(id);
    if (!existing) {
      return sendJson(res, 404, { error: 'Announcement not found.' });
    }

    try {
      const deleted = await AnnouncementModel.deleteAnnouncement(id);
      if (!deleted) {
        return sendJson(res, 404, { error: 'Announcement not found.' });
      }
      res.writeHead(204);
      return res.end();
    } catch (err) {
      return sendJson(res, 500, { error: 'Internal server error.' });
    }
  }
};

module.exports = ApiAnnouncementController;

const { pool } = require('../config/db');

/**
 * Announcement Entity Class
 * Represents a single Announcement in the application domain.
 */
class Announcement {
  constructor({ id, title, content, createdAt, updatedAt } = {}) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      ...(this.updatedAt ? { updatedAt: this.updatedAt } : {})
    };
  }
}

// In-Memory Storage fallback (when database is not configured)
const announcements = [
  new Announcement({
    id: 1,
    title: '2026 Mezunlar Bulusmasi',
    content: 'Bu yilki geleneksel mezunlar bulusmamiz 15 Temmuz tarihinde kampus ana amfisinde gerceklestirilecektir. Tum mezunlarimiz davetlidir.',
    createdAt: new Date().toISOString()
  }),
  new Announcement({
    id: 2,
    title: 'Kariyer ve Mentorluk Programi',
    content: 'Yeni mezunlarimiz icin baslatilan mentorluk programi basvurulari acilmistir. Gonullu mentor olmak isteyen mezunlarimiz profil uzerinden basvurabilir.',
    createdAt: new Date().toISOString()
  })
];

let nextId = 3;

/**
 * Announcement Model
 * Coordinates data operations for Announcement resources.
 * Supports persistent PostgreSQL database with in-memory fallback.
 */
const AnnouncementModel = {
  /**
   * Retrieves all announcements from persistent DB or in-memory fallback.
   * @returns {Promise<Array<Object>>} List of announcements
   */
  async getAllAnnouncements() {
    if (pool) {
      const res = await pool.query('SELECT id, title, content, created_at AS "createdAt", updated_at AS "updatedAt" FROM announcements ORDER BY id ASC');
      return res.rows.map(r => new Announcement({
        id: r.id,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null
      }).toJSON());
    }
    return announcements.map(a => a.toJSON());
  },

  /**
   * Finds an announcement by its ID.
   * @param {string|number} id - Announcement ID
   * @returns {Promise<Object|null>} Announcement object or null
   */
  async getAnnouncementById(id) {
    if (pool) {
      const res = await pool.query('SELECT id, title, content, created_at AS "createdAt", updated_at AS "updatedAt" FROM announcements WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return new Announcement({
        id: r.id,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null
      }).toJSON();
    }
    const announcement = announcements.find(a => String(a.id) === String(id));
    return announcement ? announcement.toJSON() : null;
  },

  /**
   * Creates a new announcement in persistent DB or in-memory fallback.
   * @param {Object} data - { title, content }
   * @returns {Promise<Object>} Created announcement
   */
  async createAnnouncement({ title, content }) {
    if (pool) {
      const res = await pool.query(
        'INSERT INTO announcements (title, content, created_at) VALUES ($1, $2, NOW()) RETURNING id, title, content, created_at AS "createdAt", updated_at AS "updatedAt"',
        [title ? title.trim() : '', content ? content.trim() : '']
      );
      const r = res.rows[0];
      return new Announcement({
        id: r.id,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null
      }).toJSON();
    }

    const newAnnouncement = new Announcement({
      id: nextId++,
      title: title ? title.trim() : '',
      content: content ? content.trim() : '',
      createdAt: new Date().toISOString()
    });

    announcements.push(newAnnouncement);
    return newAnnouncement.toJSON();
  },

  /**
   * Fully or partially updates an existing announcement.
   * @param {string|number} id - Announcement ID
   * @param {Object} data - Updated fields { title, content }
   * @returns {Promise<Object|null>} Updated announcement or null if not found
   */
  async updateAnnouncement(id, data) {
    if (pool) {
      const existing = await this.getAnnouncementById(id);
      if (!existing) return null;

      const newTitle = data.title !== undefined ? data.title.trim() : existing.title;
      const newContent = data.content !== undefined ? data.content.trim() : existing.content;

      const res = await pool.query(
        'UPDATE announcements SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING id, title, content, created_at AS "createdAt", updated_at AS "updatedAt"',
        [newTitle, newContent, id]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return new Announcement({
        id: r.id,
        title: r.title,
        content: r.content,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : null
      }).toJSON();
    }

    const index = announcements.findIndex(a => String(a.id) === String(id));
    if (index === -1) return null;

    const item = announcements[index];

    if (data.title !== undefined) {
      item.title = data.title.trim();
    }
    if (data.content !== undefined) {
      item.content = data.content.trim();
    }

    item.updatedAt = new Date().toISOString();
    announcements[index] = item;

    return item.toJSON();
  },

  /**
   * Deletes an announcement by its ID.
   * @param {string|number} id - Announcement ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteAnnouncement(id) {
    if (pool) {
      const res = await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
      return res.rowCount > 0;
    }

    const index = announcements.findIndex(a => String(a.id) === String(id));
    if (index === -1) return false;

    announcements.splice(index, 1);
    return true;
  }
};

module.exports = AnnouncementModel;
module.exports.AnnouncementModel = AnnouncementModel;
module.exports.Announcement = Announcement;

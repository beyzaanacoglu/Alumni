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

// In-Memory Storage (Without a Database)
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
 * Coordinates in-memory data operations for Announcement resources.
 */
const AnnouncementModel = {
  /**
   * Retrieves all announcements in memory.
   * @returns {Array<Announcement>} List of announcements
   */
  getAllAnnouncements() {
    return announcements.map(a => a.toJSON());
  },

  /**
   * Finds an announcement by its ID.
   * @param {string|number} id - Announcement ID
   * @returns {Object|null} Announcement object or null
   */
  getAnnouncementById(id) {
    const announcement = announcements.find(a => String(a.id) === String(id));
    return announcement ? announcement.toJSON() : null;
  },

  /**
   * Creates a new announcement in memory.
   * @param {Object} data - { title, content }
   * @returns {Object} Created announcement
   */
  createAnnouncement({ title, content }) {
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
   * @returns {Object|null} Updated announcement or null if not found
   */
  updateAnnouncement(id, data) {
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
   * @returns {boolean} True if deleted, false if not found
   */
  deleteAnnouncement(id) {
    const index = announcements.findIndex(a => String(a.id) === String(id));
    if (index === -1) return false;

    announcements.splice(index, 1);
    return true;
  }
};

module.exports = AnnouncementModel;
module.exports.AnnouncementModel = AnnouncementModel;
module.exports.Announcement = Announcement;

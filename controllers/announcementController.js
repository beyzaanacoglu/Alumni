const AnnouncementModel = require('../models/announcementModel');
const fs = require('fs');
const path = require('path');

function getRedirectUrl(req, redirectPath) {
  const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
  return (isAlumni ? '/Alumni' : '') + redirectPath;
}

/**
 * AnnouncementController
 * View controller for web-based Announcement operations.
 * Renders HTML views for listing, showing, creating, updating, and deleting announcements.
 */
const AnnouncementController = {
  /**
   * GET /announcements
   * Renders announcements list and create form view.
   */
  async listAnnouncements(req, res) {
    try {
      const announcements = await AnnouncementModel.getAllAnnouncements();
      const templatePath = path.join(__dirname, '..', 'public', 'announcements.html');

      let html = fs.readFileSync(templatePath, 'utf8');

      // Check query params for notification banners
      const host = req.headers && req.headers.host ? req.headers.host : 'localhost';
      const parsedUrl = new URL(req.url, `http://${host}`);
      const success = parsedUrl.searchParams.get('success');
      const error = parsedUrl.searchParams.get('error');

      let bannerHtml = '';
      if (success === '1' || success === 'created') {
        bannerHtml = `<div class="alert alert-success">✅ Duyuru başarıyla yayınlandı!</div>`;
      } else if (success === 'updated') {
        bannerHtml = `<div class="alert alert-success">✅ Duyuru başarıyla güncellendi!</div>`;
      } else if (success === 'deleted') {
        bannerHtml = `<div class="alert alert-success">🗑️ Duyuru başarıyla silindi!</div>`;
      } else if (error === 'validation') {
        bannerHtml = `<div class="alert alert-error">❌ Lütfen başlık ve içerik alanlarını eksiksiz doldurun.</div>`;
      } else if (error === 'not_found') {
        bannerHtml = `<div class="alert alert-error">❌ İstenen duyuru bulunamadı.</div>`;
      }

      const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
      const prefix = isAlumni ? '/Alumni' : '';

      // Generate announcements cards / list
      let rowsHtml = '';
      if (!announcements || announcements.length === 0) {
        rowsHtml = `<div class="empty-state">Henüz kayıtlı duyuru bulunmuyor. Sol taraftaki formu kullanarak yeni bir duyuru yayınlayabilirsiniz.</div>`;
      } else {
        rowsHtml = announcements.map(a => {
          const createdDate = a.createdAt ? new Date(a.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
          const updatedDate = a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
          
          return `
          <div class="announcement-item">
            <div class="announcement-header">
              <div class="announcement-title-group">
                <span class="badge">#${a.id}</span>
                <h3 class="announcement-title">${a.title}</h3>
              </div>
              <div class="announcement-actions">
                <a href="${prefix}/announcements/${a.id}" class="action-btn action-view">👁️ Detay</a>
                <a href="${prefix}/announcements/${a.id}/edit" class="action-btn action-edit">✏️ Düzenle</a>
                <form method="POST" action="${prefix}/announcements/${a.id}/delete" style="display:inline;" onsubmit="return confirm('Bu duyuruyu silmek istediğinize emin misiniz?');">
                  <button type="submit" class="action-btn action-delete">🗑️ Sil</button>
                </form>
              </div>
            </div>
            <p class="announcement-preview">${a.content}</p>
            <div class="announcement-footer">
              <span class="date-text">📅 Oluşturulma: ${createdDate}</span>
              ${updatedDate ? `<span class="date-text">📝 Güncellenme: ${updatedDate}</span>` : ''}
            </div>
          </div>`;
        }).join('');
      }

      html = html.replace('<!-- NOTIFICATION_BANNER -->', bannerHtml);
      html = html.replace('<!-- ANNOUNCEMENT_LIST -->', rowsHtml);

      if (isAlumni) {
        html = html.replace(/action="\/announcements"/g, 'action="/Alumni/announcements"');
        html = html.replace(/href="\/announcements"/g, 'href="/Alumni/announcements"');
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Internal server error loading announcements view.');
    }
  },

  /**
   * GET /announcements/:id
   * Renders the single announcement detail view.
   */
  async showAnnouncement(req, res, id) {
    try {
      const announcement = await AnnouncementModel.getAnnouncementById(id);
      if (!announcement) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?error=not_found') });
        return res.end();
      }

      const templatePath = path.join(__dirname, '..', 'public', 'announcement-detail.html');
      let html = fs.readFileSync(templatePath, 'utf8');

      const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
      const prefix = isAlumni ? '/Alumni' : '';

      const createdStr = announcement.createdAt ? new Date(announcement.createdAt).toLocaleString('tr-TR') : '-';
      let updatedSection = '';
      if (announcement.updatedAt) {
        const updatedStr = new Date(announcement.updatedAt).toLocaleString('tr-TR');
        updatedSection = `<div class="info-item"><span class="info-label">Son Güncelleme:</span><span class="info-value">${updatedStr}</span></div>`;
      }

      html = html.replace(/\{\{ANNOUNCEMENT_ID\}\}/g, announcement.id);
      html = html.replace(/\{\{ANNOUNCEMENT_TITLE\}\}/g, announcement.title);
      html = html.replace(/\{\{ANNOUNCEMENT_CONTENT\}\}/g, announcement.content);
      html = html.replace(/\{\{ANNOUNCEMENT_CREATED\}\}/g, createdStr);
      html = html.replace('{{ANNOUNCEMENT_UPDATED_SECTION}}', updatedSection);

      if (isAlumni) {
        html = html.replace(/href="\/announcements/g, 'href="/Alumni/announcements');
        html = html.replace(/action="\/announcements/g, 'action="/Alumni/announcements');
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Internal server error.');
    }
  },

  /**
   * GET /announcements/:id/edit
   * Renders the announcement edit form with pre-filled data.
   */
  async editAnnouncement(req, res, id) {
    try {
      const announcement = await AnnouncementModel.getAnnouncementById(id);
      if (!announcement) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?error=not_found') });
        return res.end();
      }

      const templatePath = path.join(__dirname, '..', 'public', 'announcement-edit.html');
      let html = fs.readFileSync(templatePath, 'utf8');

      const host = req.headers && req.headers.host ? req.headers.host : 'localhost';
      const parsedUrl = new URL(req.url, `http://${host}`);
      const error = parsedUrl.searchParams.get('error');

      let errorBanner = '';
      if (error === 'validation') {
        errorBanner = `<div class="alert-error">❌ Lütfen başlık ve içerik alanlarını geçerli şekilde doldurun.</div>`;
      }

      const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
      const prefix = isAlumni ? '/Alumni' : '';

      html = html.replace('<!-- ERROR_BANNER -->', errorBanner);
      html = html.replace(/\{\{ANNOUNCEMENT_ID\}\}/g, announcement.id);
      html = html.replace(/\{\{ANNOUNCEMENT_TITLE\}\}/g, announcement.title);
      html = html.replace(/\{\{ANNOUNCEMENT_CONTENT\}\}/g, announcement.content);

      if (isAlumni) {
        html = html.replace(/href="\/announcements/g, 'href="/Alumni/announcements');
        html = html.replace(/action="\/announcements/g, 'action="/Alumni/announcements');
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Internal server error.');
    }
  },

  /**
   * POST /announcements
   * Receives new announcement form data and creates record via AnnouncementModel.
   */
  async createAnnouncement(req, res, announcementData) {
    try {
      const { title, content } = announcementData || {};

      if (!title || typeof title !== 'string' || !title.trim() ||
          !content || typeof content !== 'string' || !content.trim()) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?error=validation') });
        return res.end();
      }

      await AnnouncementModel.createAnnouncement({
        title: title.trim(),
        content: content.trim()
      });

      res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?success=created') });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Error creating announcement.');
    }
  },

  /**
   * POST /announcements/:id/update
   * Receives updated announcement form data and updates via AnnouncementModel.
   */
  async updateAnnouncement(req, res, id, announcementData) {
    try {
      const target = await AnnouncementModel.getAnnouncementById(id);
      if (!target) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?error=not_found') });
        return res.end();
      }

      const { title, content } = announcementData || {};

      if (!title || typeof title !== 'string' || !title.trim() ||
          !content || typeof content !== 'string' || !content.trim()) {
        res.writeHead(302, { Location: getRedirectUrl(req, `/announcements/${id}/edit?error=validation`) });
        return res.end();
      }

      await AnnouncementModel.updateAnnouncement(id, {
        title: title.trim(),
        content: content.trim()
      });

      res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?success=updated') });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Error updating announcement.');
    }
  },

  /**
   * POST /announcements/:id/delete
   * Deletes an announcement via AnnouncementModel and redirects to list.
   */
  async deleteAnnouncement(req, res, id) {
    try {
      const deleted = await AnnouncementModel.deleteAnnouncement(id);
      if (!deleted) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?error=not_found') });
        return res.end();
      }

      res.writeHead(302, { Location: getRedirectUrl(req, '/announcements?success=deleted') });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Error deleting announcement.');
    }
  }
};

module.exports = AnnouncementController;

const UserModel = require('../models/userModel');
const fs = require('fs');
const path = require('path');

function getRedirectUrl(req, redirectPath) {
  const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
  return (isAlumni ? '/Alumni' : '') + redirectPath;
}

/**
 * UserController
 * Implements the Full CRUD view controller for User resources,
 * delegating all data queries and updates to UserModel and rendering HTML views.
 */
const UserController = {
  /**
   * GET /users
   * Renders all users in the users table view.
   */
  listUsers(req, res) {
    try {
      const users = UserModel.getAllUsers();
      const templatePath = path.join(__dirname, '..', 'public', 'users.html');
      
      let html = fs.readFileSync(templatePath, 'utf8');

      // Check query params for notification banners
      const host = req.headers && req.headers.host ? req.headers.host : 'localhost';
      const parsedUrl = new URL(req.url, `http://${host}`);
      const success = parsedUrl.searchParams.get('success');
      const error = parsedUrl.searchParams.get('error');

      let bannerHtml = '';
      if (success === '1' || success === 'created') {
        bannerHtml = `<div class="alert alert-success">✅ Kullanıcı başarıyla oluşturuldu!</div>`;
      } else if (success === 'updated') {
        bannerHtml = `<div class="alert alert-success">✅ Kullanıcı başarıyla güncellendi!</div>`;
      } else if (success === 'deleted') {
        bannerHtml = `<div class="alert alert-success">🗑️ Kullanıcı başarıyla silindi!</div>`;
      } else if (error === 'validation') {
        bannerHtml = `<div class="alert alert-error">❌ Lütfen tüm zorunlu alanları geçerli şekilde doldurun.</div>`;
      } else if (error === 'email_exists') {
        bannerHtml = `<div class="alert alert-error">❌ Bu e-posta adresi ile kayıtlı başka bir kullanıcı bulunuyor.</div>`;
      } else if (error === 'not_found') {
        bannerHtml = `<div class="alert alert-error">❌ İstenen kullanıcı bulunamadı.</div>`;
      }

      // Generate table rows with Action buttons (View, Edit, Delete)
      let rowsHtml = '';
      if (!users || users.length === 0) {
        rowsHtml = `<tr><td colspan="5" class="empty-state">Henüz kayıtlı kullanıcı bulunmuyor. Formdan yeni kullanıcı ekleyebilirsiniz.</td></tr>`;
      } else {
        const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
        const prefix = isAlumni ? '/Alumni' : '';

        rowsHtml = users.map(u => {
          const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
          return `<tr>
            <td><span class="user-badge">#${u.id}</span></td>
            <td><strong>${u.name}</strong></td>
            <td>${u.email}</td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${date}</td>
            <td style="text-align: right; white-space: nowrap;">
              <a href="${prefix}/users/${u.id}" style="color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 0.85rem; margin-right: 12px;">👁️ Detay</a>
              <a href="${prefix}/users/${u.id}/edit" style="color: #a5b4fc; text-decoration: none; font-weight: 600; font-size: 0.85rem; margin-right: 12px;">✏️ Düzenle</a>
              <form method="POST" action="${prefix}/users/${u.id}/delete" style="display: inline;" onsubmit="return confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?');">
                <button type="submit" style="background: none; border: none; color: #f87171; cursor: pointer; font-weight: 600; font-size: 0.85rem;">🗑️ Sil</button>
              </form>
            </td>
          </tr>`;
        }).join('');
      }

      html = html.replace('<!-- NOTIFICATION_BANNER -->', bannerHtml);
      html = html.replace('<!-- USER_ROWS -->', rowsHtml);

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Internal server error loading users view.');
    }
  },

  /**
   * GET /users/:id
   * Renders the user details view.
   */
  showUser(req, res, id) {
    try {
      const user = UserModel.getUserById(id);
      if (!user) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=not_found') });
        return res.end();
      }

      const templatePath = path.join(__dirname, '..', 'public', 'user-detail.html');
      let html = fs.readFileSync(templatePath, 'utf8');

      const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
      const prefix = isAlumni ? '/Alumni' : '';

      const createdStr = user.createdAt ? new Date(user.createdAt).toLocaleString('tr-TR') : '-';
      let updatedSection = '';
      if (user.updatedAt) {
        const updatedStr = new Date(user.updatedAt).toLocaleString('tr-TR');
        updatedSection = `<div class="info-item"><span class="info-label">Son Güncelleme:</span><span class="info-value">${updatedStr}</span></div>`;
      }

      html = html.replace(/\{\{USER_ID\}\}/g, user.id);
      html = html.replace(/\{\{USER_NAME\}\}/g, user.name);
      html = html.replace(/\{\{USER_EMAIL\}\}/g, user.email);
      html = html.replace(/\{\{USER_CREATED\}\}/g, createdStr);
      html = html.replace('{{USER_UPDATED_SECTION}}', updatedSection);

      if (isAlumni) {
        html = html.replace(/href="\/users/g, 'href="/Alumni/users');
        html = html.replace(/action="\/users/g, 'action="/Alumni/users');
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Internal server error.');
    }
  },

  /**
   * GET /users/:id/edit
   * Renders the user edit form view with pre-filled data.
   */
  editUser(req, res, id) {
    try {
      const user = UserModel.getUserById(id);
      if (!user) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=not_found') });
        return res.end();
      }

      const templatePath = path.join(__dirname, '..', 'public', 'user-edit.html');
      let html = fs.readFileSync(templatePath, 'utf8');

      const host = req.headers && req.headers.host ? req.headers.host : 'localhost';
      const parsedUrl = new URL(req.url, `http://${host}`);
      const error = parsedUrl.searchParams.get('error');

      let errorBanner = '';
      if (error === 'validation') {
        errorBanner = `<div class="alert-error">❌ Lütfen geçerli bir isim ve e-posta girin.</div>`;
      } else if (error === 'email_exists') {
        errorBanner = `<div class="alert-error">❌ Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.</div>`;
      }

      const isAlumni = req.url && req.url.toLowerCase().startsWith('/alumni');
      const prefix = isAlumni ? '/Alumni' : '';

      html = html.replace('<!-- ERROR_BANNER -->', errorBanner);
      html = html.replace(/\{\{USER_ID\}\}/g, user.id);
      html = html.replace(/\{\{USER_NAME\}\}/g, user.name);
      html = html.replace(/\{\{USER_EMAIL\}\}/g, user.email);

      if (isAlumni) {
        html = html.replace(/href="\/users/g, 'href="/Alumni/users');
        html = html.replace(/action="\/users/g, 'action="/Alumni/users');
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Internal server error.');
    }
  },

  /**
   * POST /users
   * Creates a new user from web form submission.
   */
  createUser(req, res, userData) {
    try {
      const { name, email, password } = userData || {};

      // Basic required fields validation
      if (!name || typeof name !== 'string' || !name.trim() ||
          !email || typeof email !== 'string' || !email.trim() ||
          !password || typeof password !== 'string' || !password.trim()) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=validation') });
        return res.end();
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=validation') });
        return res.end();
      }

      // Uniqueness check
      const existingUser = UserModel.getUserByEmail(email.trim());
      if (existingUser) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=email_exists') });
        return res.end();
      }

      // Call User Model
      UserModel.createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim()
      });

      res.writeHead(302, { Location: getRedirectUrl(req, '/users?success=created') });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Error creating user.');
    }
  },

  /**
   * POST /users/:id/update
   * Receives updated user form data and updates via UserModel.
   */
  updateUser(req, res, id, userData) {
    try {
      const targetUser = UserModel.getUserById(id);
      if (!targetUser) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=not_found') });
        return res.end();
      }

      const { name, email, password } = userData || {};

      if (!name || typeof name !== 'string' || !name.trim() ||
          !email || typeof email !== 'string' || !email.trim()) {
        res.writeHead(302, { Location: getRedirectUrl(req, `/users/${id}/edit?error=validation`) });
        return res.end();
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.writeHead(302, { Location: getRedirectUrl(req, `/users/${id}/edit?error=validation`) });
        return res.end();
      }

      // Duplicate email check against other users
      const existingWithEmail = UserModel.getUserByEmail(email.trim());
      if (existingWithEmail && String(existingWithEmail.id) !== String(id)) {
        res.writeHead(302, { Location: getRedirectUrl(req, `/users/${id}/edit?error=email_exists`) });
        return res.end();
      }

      const updatePayload = {
        name: name.trim(),
        email: email.trim()
      };

      if (password && typeof password === 'string' && password.trim()) {
        updatePayload.password = password.trim();
      }

      UserModel.updateUser(id, updatePayload);

      res.writeHead(302, { Location: getRedirectUrl(req, '/users?success=updated') });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Error updating user.');
    }
  },

  /**
   * POST /users/:id/delete
   * Deletes user via UserModel and redirects to user list.
   */
  deleteUser(req, res, id) {
    try {
      const targetUser = UserModel.getUserById(id);
      if (!targetUser) {
        res.writeHead(302, { Location: getRedirectUrl(req, '/users?error=not_found') });
        return res.end();
      }

      UserModel.deleteUser(id);

      res.writeHead(302, { Location: getRedirectUrl(req, '/users?success=deleted') });
      return res.end();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Error deleting user.');
    }
  }
};

module.exports = UserController;

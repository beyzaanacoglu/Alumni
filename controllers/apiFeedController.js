const feedRepository = require('../repositories/feedRepository');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const apiFeedController = {
  async getFeed(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const category = url.searchParams.get('category');
      const posts = feedRepository.getAll(category);
      return sendJson(res, 200, { success: true, count: posts.length, data: posts });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  },

  async createPost(req, res) {
    try {
      const body = await parseJsonBody(req);
      if (!body.content || !body.content.trim()) {
        return sendJson(res, 400, { success: false, error: 'Gönderi içeriği boş olamaz.' });
      }
      const newPost = feedRepository.create(body);
      return sendJson(res, 201, { success: true, message: 'Gönderi başarıyla paylaşıldı.', data: newPost });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  },

  async toggleLike(req, res, id) {
    try {
      const body = await parseJsonBody(req).catch(() => ({}));
      const userName = body.userName || 'Beyza Anacoğlu';
      const updatedPost = feedRepository.toggleLike(id, userName);
      if (!updatedPost) {
        return sendJson(res, 404, { success: false, error: 'Gönderi bulunamadı.' });
      }
      return sendJson(res, 200, { success: true, data: updatedPost });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  },

  async addComment(req, res, id) {
    try {
      const body = await parseJsonBody(req);
      if (!body.text || !body.text.trim()) {
        return sendJson(res, 400, { success: false, error: 'Yorum metni boş olamaz.' });
      }
      const result = feedRepository.addComment(id, body);
      if (!result) {
        return sendJson(res, 404, { success: false, error: 'Gönderi bulunamadı.' });
      }
      return sendJson(res, 201, { success: true, message: 'Yorum eklendi.', data: result.newComment, post: result.post });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }
};

module.exports = apiFeedController;

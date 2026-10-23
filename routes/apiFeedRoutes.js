const apiFeedController = require('../controllers/apiFeedController');

/**
 * Dispatches API Feed requests to apiFeedController.
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} pathWithoutPrefix - Normalized route path
 * @returns {Promise<boolean>} True if route matched and handled, false otherwise
 */
async function handleApiFeedRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  // GET /api/feed
  if (method === 'GET' && path === '/api/feed') {
    await apiFeedController.getFeed(req, res);
    return true;
  }

  // POST /api/feed
  if (method === 'POST' && path === '/api/feed') {
    await apiFeedController.createPost(req, res);
    return true;
  }

  // POST /api/feed/:id/like
  const likeMatch = pathWithoutPrefix.match(/^\/api\/feed\/([^\/]+)\/like$/i);
  if (likeMatch && method === 'POST') {
    const id = likeMatch[1];
    await apiFeedController.toggleLike(req, res, id);
    return true;
  }

  // POST /api/feed/:id/comments
  const commentMatch = pathWithoutPrefix.match(/^\/api\/feed\/([^\/]+)\/comments$/i);
  if (commentMatch && method === 'POST') {
    const id = commentMatch[1];
    await apiFeedController.addComment(req, res, id);
    return true;
  }

  return false;
}

module.exports = {
  handleApiFeedRoutes
};

const ApiUserController = require('../controllers/apiUserController');

/**
 * Dispatches API User requests to ApiUserController.
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} pathWithoutPrefix - Normalized route path
 * @returns {Promise<boolean>} True if route matched and handled, false otherwise
 */
async function handleApiUserRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  // GET /api/users
  if (method === 'GET' && path === '/api/users') {
    await ApiUserController.getAllUsers(req, res);
    return true;
  }

  // POST /api/users
  if (method === 'POST' && path === '/api/users') {
    await ApiUserController.createUser(req, res);
    return true;
  }

  // Match /api/users/:id
  const userWithIdMatch = pathWithoutPrefix.match(/^\/api\/users\/([^\/]+)$/i);
  if (userWithIdMatch) {
    const id = userWithIdMatch[1];

    if (method === 'GET') {
      await ApiUserController.getUserById(req, res, id);
      return true;
    }

    if (method === 'PUT') {
      await ApiUserController.updateUser(req, res, id);
      return true;
    }

    if (method === 'PATCH') {
      await ApiUserController.patchUser(req, res, id);
      return true;
    }

    if (method === 'DELETE') {
      await ApiUserController.deleteUser(req, res, id);
      return true;
    }
  }

  return false;
}

module.exports = {
  handleApiUserRoutes
};

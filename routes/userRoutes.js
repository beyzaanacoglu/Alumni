const UserController = require('../controllers/userController');

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
 * Dispatches View User requests to UserController.
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {string} pathWithoutPrefix - Normalized route path
 * @returns {Promise<boolean>} True if route matched and handled, false otherwise
 */
async function handleUserRoutes(req, res, pathWithoutPrefix) {
  const method = req.method;
  const path = pathWithoutPrefix.toLowerCase();

  // GET /users
  if (method === 'GET' && (path === '/users' || path === '/users/')) {
    UserController.listUsers(req, res);
    return true;
  }

  // POST /users
  if (method === 'POST' && (path === '/users' || path === '/users/')) {
    const body = await parseBody(req);
    UserController.createUser(req, res, body);
    return true;
  }

  // GET /users/:id/edit
  const editMatch = pathWithoutPrefix.match(/^\/users\/([^\/]+)\/edit$/i);
  if (method === 'GET' && editMatch) {
    UserController.editUser(req, res, editMatch[1]);
    return true;
  }

  // POST /users/:id/update
  const updateMatch = pathWithoutPrefix.match(/^\/users\/([^\/]+)\/update$/i);
  if (method === 'POST' && updateMatch) {
    const body = await parseBody(req);
    UserController.updateUser(req, res, updateMatch[1], body);
    return true;
  }

  // POST /users/:id/delete
  const deleteMatch = pathWithoutPrefix.match(/^\/users\/([^\/]+)\/delete$/i);
  if (method === 'POST' && deleteMatch) {
    UserController.deleteUser(req, res, deleteMatch[1]);
    return true;
  }

  // GET /users/:id
  const showMatch = pathWithoutPrefix.match(/^\/users\/([^\/]+)$/i);
  if (method === 'GET' && showMatch) {
    UserController.showUser(req, res, showMatch[1]);
    return true;
  }

  return false;
}

module.exports = {
  handleUserRoutes
};

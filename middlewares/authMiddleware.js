const { verifyToken } = require('../config/auth');

/**
 * Bouncer – protects protected /api/* routes.
 * Returns 401 if token missing/invalid/expired.
 * On success, attaches decoded payload to req.user and calls next().
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 401,
      error: 'Unauthorized',
      message: 'I do not know who you are'
    }));
  }

  const token = authHeader.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    }));
  }

  req.user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role || 'student'
  };

  if (typeof next === 'function') {
    return next();
  }
}

module.exports = { authMiddleware, verifyToken };

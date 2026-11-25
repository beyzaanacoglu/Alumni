const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'CHANGE_ME_IN_PROD' } = process.env;
/**
 * Bouncer – protects all /api/* routes.
 * Returns 401 if token missing/invalid/expired.
 * On success, attaches decoded payload to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'I do not know who you are' }));
  }
  const token = authHeader.slice(7).trim(); // remove "Bearer "
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Invalid or expired token' }));
  }
}
module.exports = { authMiddleware };

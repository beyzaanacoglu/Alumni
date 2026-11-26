/**
 * Role & Ownership Authorization Middleware (403 Guard)
 * Implements ddd.md Section 5.3 ("Who May Do What" & "Yours, Not Someone Else's").
 */

function sendForbidden(res, message = 'I know who you are, and the answer is no') {
  const payload = {
    status: 403,
    error: 'Forbidden',
    message,
    timestamp: new Date().toISOString()
  };
  if (typeof res.status === 'function') {
    return res.status(403).json(payload);
  }
  res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
  return res.end(JSON.stringify(payload, null, 2));
}

/**
 * Checks whether req.user.role is in allowedRoles.
 * Returns true if authorized; sends 403 and returns false otherwise.
 */
function checkRole(req, res, allowedRoles = []) {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    sendForbidden(res, 'I know who you are, and the answer is no');
    return false;
  }
  return true;
}

/**
 * Express-style middleware wrapper for role verification.
 */
function requireRole(...allowedRoles) {
  return function roleGuard(req, res, next) {
    if (!checkRole(req, res, allowedRoles)) return;
    if (typeof next === 'function') return next();
  };
}

/**
 * Checks resource ownership ("Yours, Not Someone Else's").
 * Admins bypass ownership restrictions.
 * Returns true if allowed; sends 403 and returns false otherwise.
 */
function requireOwnerOrAdmin(req, res, resourceOwnerId) {
  if (!req.user) {
    sendForbidden(res, 'I know who you are, and the answer is no');
    return false;
  }
  if (req.user.role === 'admin') return true;
  if (String(req.user.id) !== String(resourceOwnerId)) {
    sendForbidden(res, 'Cannot modify a resource belonging to another member');
    return false;
  }
  return true;
}

module.exports = {
  sendForbidden,
  checkRole,
  requireRole,
  requireOwnerOrAdmin
};

const crypto = require('crypto');

const FALLBACK_SECRET = 'bufu-super-secret-key-2026';
const JWT_SECRET = process.env.JWT_SECRET || FALLBACK_SECRET;

if (process.env.NODE_ENV === 'production' && JWT_SECRET === FALLBACK_SECRET) {
  console.warn('[SECURITY] Warning: Using fallback JWT_SECRET in production. Set JWT_SECRET in .env!');
}

/**
 * Generates an HMAC-SHA256 signed token (payloadB64.sigB64).
 */
function signToken(user, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'student',
    exp: Date.now() + expiresInMs
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed token and checks expiration.
 * Returns decoded payload or null.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(sigB64);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  JWT_SECRET,
  signToken,
  verifyToken
};

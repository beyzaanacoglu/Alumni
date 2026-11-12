/**
 * 404 Guardian Middleware
 * Catches unhandled routes and returns structured 404 responses with detailed reasons.
 */

function guardian404Middleware(req, res, path) {
  const method = req.method;
  const isApi = path.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'));

  // Mantıklı ve açıklayıcı gerekçe (Reason) üretimi
  let reason = `Route '${method} ${path}' is not registered on this server.`;
  let suggestion = 'Please check the URL spelling or consult the navigation menu.';

  if (path.startsWith('/api/users/')) {
    reason = `User with the requested ID was not found or the endpoint format is incorrect.`;
    suggestion = 'Verify the user ID or list all users via GET /api/users.';
  } else if (path.startsWith('/api/announcements/')) {
    reason = `Announcement was not found or has been removed.`;
    suggestion = 'List all announcements via GET /api/announcements.';
  } else if (path.startsWith('/api/')) {
    reason = `The API endpoint '${method} ${path}' does not exist in the routing table.`;
    suggestion = 'Check the interactive OpenAPI documentation at /swagger.html.';
  } else if (path.endsWith('.html') || path.startsWith('/public')) {
    reason = `The static page or asset '${path}' does not exist on the file system.`;
    suggestion = 'Return to the home feed at / or view available pages.';
  }

  // 1. JSON Yanıtı (API veya Postman istekleri için)
  if (isApi) {
    const errorPayload = {
      status: 404,
      error: 'Not Found',
      reason: reason,
      suggestion: suggestion,
      path: path,
      method: method,
      timestamp: new Date().toISOString()
    };

    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(errorPayload, null, 2));
  }

  // 2. HTML Yanıtı (Tarayıcı gezintisi için)
  const htmlResponse = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Guardian Not Found</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f19; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: rgba(23, 32, 53, 0.85); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 36px; max-width: 580px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
    .code { font-size: 5rem; font-weight: 900; color: #ef4444; margin: 0; line-height: 1; }
    .badge { display: inline-block; background: rgba(239, 68, 68, 0.15); color: #f87171; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.3); margin-top: 12px; }
    h2 { font-size: 1.5rem; margin: 16px 0 12px; color: #ffffff; }
    .reason-box { background: rgba(15, 23, 42, 0.9); border-left: 4px solid #ef4444; border-radius: 6px; padding: 14px; text-align: left; margin: 20px 0; font-size: 0.95rem; line-height: 1.5; color: #e2e8f0; }
    .reason-title { font-weight: 700; color: #fca5a5; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px; }
    .suggestion { color: #94a3b8; font-size: 0.9rem; text-align: left; margin-bottom: 24px; }
    .btn { display: inline-block; background: #6366f1; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.95rem; transition: background 0.2s; }
    .btn:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="code">404</div>
    <span class="badge">404 Guardian Protected</span>
    <h2>Aradığınız Kaynak Bulunamadı</h2>
    <div class="reason-box">
      <div class="reason-title">Gerekçe (Reason):</div>
      <div>${reason}</div>
    </div>
    <div class="suggestion">💡 <strong>Öneri:</strong> ${suggestion}</div>
    <a href="/Alumni" class="btn">Ana Sayfaya Dön</a>
  </div>
</body>
</html>`;

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  return res.end(htmlResponse);
}

module.exports = { guardian404Middleware };

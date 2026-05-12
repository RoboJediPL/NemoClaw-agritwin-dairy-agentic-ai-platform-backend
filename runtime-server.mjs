import http from 'node:http';

const port = Number(process.env.PORT || 3000);
const service = process.env.SERVICE_NAME || 'agritwin-dairy-backend';

let appImportStatus = 'pending';
let appImportError = null;

const server = http.createServer((req, res) => {
  const body = JSON.stringify({
    ok: appImportStatus === 'loaded',
    service,
    status: appImportStatus,
    error: appImportError,
    path: req.url,
    timestamp: new Date().toISOString()
  });

  if (req.url === '/health' || req.url === '/ready' || req.url === '/') {
    res.writeHead(appImportStatus === 'failed' ? 500 : 200, {
      'content-type': 'application/json'
    });
    res.end(body);
    return;
  }

  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ ok: false, service, error: 'not found', path: req.url }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`${service} runtime server listening on 0.0.0.0:${port}`);
});

try {
  await import('./src/index.mjs');
  appImportStatus = 'loaded';
  console.log(`${service} app module loaded`);
} catch (error) {
  appImportStatus = 'failed';
  appImportError = error?.stack || error?.message || String(error);
  console.error(`${service} app module failed`, error);
}

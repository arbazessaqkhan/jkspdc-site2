/**
 * Reverse proxy: single public URL for both frontend (4321) and backend (3000)
 * - /api/*   → NestJS backend on port 3000
 * - /*       → Astro frontend on port 4321
 * 
 * Also proxies WebSocket connections (Astro HMR) to keep live reload working.
 */
const http = require('http');
const net  = require('net');
const url  = require('url');

const PROXY_PORT   = 8080;
const FRONTEND     = { host: 'localhost', port: 4321 };
const BACKEND      = { host: 'localhost', port: 3000  };

function targetFor(reqUrl) {
  return (reqUrl.startsWith('/api') || reqUrl.startsWith('/uploads')) ? BACKEND : FRONTEND;
}

function forwardRequest(req, res) {
  const target = targetFor(req.url);

  const options = {
    hostname : target.host,
    port     : target.port,
    path     : req.url,
    method   : req.method,
    headers  : {
      ...req.headers,
      host: `${target.host}:${target.port}`,
    },
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    console.error(`[proxy] error forwarding to ${target.host}:${target.port}`, err.message);
    if (!res.headersSent) {
      res.writeHead(502);
      res.end(`Proxy error: ${err.message}`);
    }
  });

  req.pipe(proxy, { end: true });
}

function forwardWs(req, socket, head) {
  const target = targetFor(req.url);

  const conn = net.createConnection(target.port, target.host, () => {
    conn.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n'
    );
    conn.write(head);
    socket.pipe(conn);
    conn.pipe(socket);
  });

  conn.on('error', (err) => {
    console.error('[proxy ws] error', err.message);
    socket.destroy();
  });
}

const server = http.createServer(forwardRequest);
server.on('upgrade', forwardWs);

server.listen(PROXY_PORT, () => {
  console.log(`✅  Proxy running on http://localhost:${PROXY_PORT}`);
  console.log(`    /api/* → localhost:${BACKEND.port}  (NestJS backend)`);
  console.log(`    /*     → localhost:${FRONTEND.port}  (Astro frontend)`);
});

#!/usr/bin/env node
/**
 * Serves dist/ (the three-design review build) at http://localhost:4321.
 * A tiny static server so each design's own 404 page is used under its prefix.
 */
import { createServer as http } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.pf_meta': 'application/octet-stream',
};

/** `prefix` mirrors REVIEW_ROOT, e.g. '/site/' when the build was made for GitHub Pages. */
export function createServer(port = 4321, prefix = process.env.REVIEW_ROOT ?? '/') {
  const strip = prefix.replace(/\/+$/, '');
  const server = http((req, res) => {
    let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (strip && url === strip) return res.writeHead(301, { Location: strip + '/' }).end();
    if (strip && url.startsWith(strip + '/')) url = url.slice(strip.length);
    let file = normalize(join(root, url));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!url.endsWith('/')) return res.writeHead(301, { Location: strip + url + '/' }).end();
      file = join(file, 'index.html');
    }
    if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
    let status = 200;
    if (!existsSync(file)) {
      status = 404;
      const design = url.split('/')[1];
      file = existsSync(join(root, design, '404.html')) ? join(root, design, '404.html') : join(root, '404.html');
    }
    res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4321);
  await createServer(port);
  console.log(`Serving dist/ at http://localhost:${port}${(process.env.REVIEW_ROOT ?? '/').replace(/\/?$/, '/')}`);
}

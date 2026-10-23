#!/usr/bin/env node
/**
 * Design review build: compiles each design under its own path and writes a chooser page.
 *
 *   dist/index.html      the chooser (intent, traits and a screenshot of each design)
 *   dist/holt/ …         the full site in the Holt design
 *   dist/raft/ …         … Raft
 *   dist/current/ …      … Current
 *
 * Once a design is picked, production builds use `DESIGN=<name> npm run build:one` (or make that the
 * default and delete this script along with the other designs).
 *
 * REVIEW_ROOT sets where the review build is served from: '/' (default, for `npm run preview`) or
 * '/site/' for https://linuxserver.github.io/site/ (set by .github/workflows/deploy.yml).
 *
 * Usage: node scripts/build-all.mjs [holt raft current] [--no-shots]
 */
import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ALL = ['holt', 'raft', 'current'];
const args = process.argv.slice(2);
const only = args.filter((a) => ALL.includes(a));
const designs = only.length ? only : ALL;
const shots = !args.includes('--no-shots');
const root = new URL('../', import.meta.url).pathname;
const R = (process.env.REVIEW_ROOT ?? '/').replace(/\/?$/, '/');

const run = (cmd, argv, env = {}) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${argv.join(' ')} exited ${code}`))));
  });

if (!only.length) rmSync(`${root}dist`, { recursive: true, force: true });
mkdirSync(`${root}dist`, { recursive: true });

for (const d of designs) {
  console.log(`\n━━━ ${d} ━━━`);
  rmSync(`${root}dist/${d}`, { recursive: true, force: true });
  // Rendered Markdown is cached in the content store and does not notice base-path changes; start it fresh
  // (the optimised-image cache next to it is kept).
  rmSync(`${root}node_modules/.astro-${d}/data-store.json`, { force: true });
  await run('npx', ['astro', 'build'], { DESIGN: d, BASE_PATH: `${R}${d}/`, OUT_DIR: `./dist/${d}`, PUBLIC_REVIEW: '1', PUBLIC_REVIEW_ROOT: R, SHARED_ASSETS_BASE: R });
  await run('npx', ['pagefind', '--site', `dist/${d}`, '--silent']);
  // Old post images and videos are linked from the shared copy (SHARED_ASSETS_BASE), not per design.
  for (const dir of ['content', 'media']) rmSync(`${root}dist/${d}/${dir}`, { recursive: true, force: true });
}
for (const dir of ['content', 'media']) cpSync(`${root}public/${dir}`, `${root}dist/${dir}`, { recursive: true });

// Shared /content and /media paths in old posts are rewritten with the base, so nothing to copy.
// GitHub Pages only uses the top-level 404.html, so it shows the right design's own 404 page in place
// (keeping the URL), or goes back to the chooser.
writeFileSync(
  `${root}dist/404.html`,
  `<!doctype html><meta charset="utf-8"><title>Not found</title><meta name="robots" content="noindex"><script>
const r=${JSON.stringify(R)},d=location.pathname.slice(r.length).split('/')[0];
if(${JSON.stringify(ALL)}.includes(d))fetch(r+d+'/404.html').then(x=>x.text()).then(h=>{document.open();document.write(h);document.close()});else location.replace(r);
</script>`,
);

const metas = [];
for (const d of ALL) {
  if (!existsSync(`${root}src/designs/${d}/meta.ts`)) continue;
  metas.push((await import(pathToFileURL(`${root}src/designs/${d}/meta.ts`).href)).default);
}

if (shots) {
  try {
    const { chromium } = await import('playwright');
    const { createServer } = await import('./preview.mjs');
    const server = await createServer(0, R);
    const port = server.address().port;
    const browser = await chromium.launch();
    mkdirSync(`${root}dist/_shots`, { recursive: true });
    for (const m of metas) {
      if (!existsSync(`${root}dist/${m.id}/index.html`)) continue;
      for (const [suffix, scheme] of [['', 'light'], ['-dark', 'dark']]) {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
        await page.goto(`http://localhost:${port}${R}${m.id}/`, { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: 'nav[aria-label="Design review"]{display:none!important}' });
        await page.screenshot({ path: `${root}dist/_shots/${m.id}${suffix}.jpg`, type: 'jpeg', quality: 82 });
        await page.close();
      }
    }
    await browser.close();
    server.close();
  } catch (e) {
    console.warn(`Screenshots skipped: ${e.message}`);
  }
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const card = (m) => `
  <article class="card">
    <a class="shot" href="${R}${m.id}/" aria-label="Open the ${esc(m.name)} design">
      <img src="${R}_shots/${m.id}.jpg" alt="" width="1440" height="900" loading="lazy" onerror="this.parentNode.classList.add('noshot');this.remove()">
    </a>
    <div class="body">
      <div class="swatch" aria-hidden="true">${m.swatch.map((c) => `<span style="background:${c}"></span>`).join('')}</div>
      <h2><a href="${R}${m.id}/">${esc(m.name)}</a></h2>
      <p class="tagline">${esc(m.tagline)}</p>
      <p>${esc(m.intent)}</p>
      <ul>${m.traits.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p class="links"><a class="btn" href="${R}${m.id}/">Explore ${esc(m.name)}</a> <a href="${R}${m.id}/images/">Images</a> <a href="${R}${m.id}/blog/">Blog</a> <a href="${R}${m.id}/images/webtop/">An image page</a></p>
    </div>
  </article>`;

writeFileSync(
  `${root}dist/index.html`,
  `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>LinuxServer.io: three designs</title>
<meta name="robots" content="noindex">
<link rel="icon" href="${R}holt/favicon.svg" type="image/svg+xml">
<style>
  :root { color-scheme: light dark; --bg:#faf8fd; --fg:#1c1530; --muted:#5d5470; --card:#fff; --line:#e7e1f2; --accent:#c42a7c; }
  @media (prefers-color-scheme: dark) { :root { --bg:#100b1a; --fg:#f3eefb; --muted:#b3a9c6; --card:#1a1328; --line:#2c2340; --accent:#ff6fae; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 1320px; margin: 0 auto; padding: 56px 20px 80px; }
  header { max-width: 760px; margin-bottom: 40px; }
  h1 { font-size: clamp(2rem, 4vw, 3rem); line-height:1.1; margin:.2em 0 .4em; letter-spacing:-.02em; }
  header p { color: var(--muted); font-size: 1.1rem; margin: 0; }
  .grid { display:grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); }
  .card { background:var(--card); border:1px solid var(--line); border-radius: 20px; overflow:hidden; display:flex; flex-direction:column; }
  .shot { display:block; aspect-ratio: 16/10; background: linear-gradient(135deg,#ff4f97,#7142b7 60%,#4179d4); overflow:hidden; border-bottom:1px solid var(--line); }
  .shot img { width:100%; height:100%; object-fit:cover; object-position: top; display:block; transition: transform .4s; }
  .shot:hover img { transform: scale(1.02); }
  .body { padding: 22px 24px 26px; }
  .swatch { display:flex; gap:6px; margin-bottom: 12px; } .swatch span { width:22px; height:22px; border-radius:50%; border:1px solid var(--line); }
  h2 { margin:0; font-size:1.6rem; } h2 a { color: inherit; text-decoration:none; }
  .tagline { margin: 2px 0 12px; color: var(--accent); font-weight: 600; }
  .body > p { color: var(--muted); }
  ul { padding-left: 1.1em; color: var(--fg); } li { margin: 4px 0; }
  .links { display:flex; flex-wrap:wrap; gap: 10px 16px; align-items:center; margin-top: 18px; }
  .links a { color: var(--accent); font-weight: 600; }
  .btn { background: var(--accent); color: #fff !important; padding: 10px 16px; border-radius: 999px; text-decoration: none; }
  a:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
</style>
</head>
<body>
<main>
  <header>
    <p>LinuxServer.io · site redesign</p>
    <h1>Three designs to choose from</h1>
    <p>Same content, data and pages, built three ways. Every page exists in every design, and the switcher in the bottom-right corner takes you to the same page in the others.</p>
  </header>
  <div class="grid">${metas.map(card).join('')}</div>
</main>
</body>
</html>
`,
);
console.log(`\nDone. Run \`npm run preview\` and open http://localhost:4321${R}`);

#!/usr/bin/env node
/**
 * Screenshots for visual checks while developing a design.
 *
 *   node scripts/shot.mjs <url> <out.png> [--dark] [--mobile] [--full] [--width=1440] [--height=900] [--theme=light|dark|system]
 *
 * e.g. node scripts/shot.mjs http://localhost:4322/images/ /tmp/raft-images.png --full --dark
 */
import { chromium } from 'playwright';

const [url, out, ...flags] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node scripts/shot.mjs <url> <out.png> [--dark] [--mobile] [--full]');
  process.exit(1);
}
const flag = (n) => flags.includes(`--${n}`);
const num = (n, d) => Number(flags.find((f) => f.startsWith(`--${n}=`))?.split('=')[1] ?? d);
const mobile = flag('mobile');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: num('width', 1440), height: num('height', 900) },
  deviceScaleFactor: mobile ? 2 : 1,
  colorScheme: flag('dark') ? 'dark' : 'light',
  isMobile: mobile,
  hasTouch: mobile,
});
// --theme=light|dark|system stores a theme choice before load, for designs whose default ignores the OS setting.
const theme = flags.find((f) => f.startsWith('--theme='))?.split('=')[1];
if (theme) await page.addInitScript((t) => localStorage.setItem('theme', t), theme);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
if (flag('full')) {
  // Scroll through so lazy images load, then back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
}
await page.addStyleTag({ content: 'nav[aria-label="Design review"]{display:none!important} vite-error-overlay{display:none}' });
await page.waitForTimeout(300);
await page.screenshot({ path: out, fullPage: flag('full') });
await browser.close();
console.log(`saved ${out}${errors.length ? `\nconsole errors:\n  ${errors.join('\n  ')}` : ''}`);

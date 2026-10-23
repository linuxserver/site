#!/usr/bin/env node
/**
 * End-to-end check of the ⌘K search palette: opens by click, shortcut and the mobile icon, filters,
 * navigates with Enter, closes with Escape, and only ever opens one dialog.
 *
 *   node scripts/test-search.mjs http://localhost:4321
 *
 * Exits non-zero if any check fails or the page throws.
 */
import { chromium } from 'playwright';
const base = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
let failed = 0;
const check = (name, ok) => {
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}`);
};

await p.goto(base + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
// 1. click → focus in input, type, results filter, Enter navigates
await p.locator('header button[aria-haspopup="dialog"]').first().click();
await p.waitForSelector('[cmdk-input]');
check('input focused on open', await p.evaluate(() => document.activeElement?.hasAttribute('cmdk-input')));
await p.keyboard.type('jellyfin');
await p.waitForSelector('[cmdk-item][data-value^="image"]', { timeout: 10000 });
const first = await p.locator('[cmdk-item][data-selected="true"]').first().innerText();
check(`top result for "jellyfin" is jellyfin (${first.split('\n')[0]})`, first.toLowerCase().startsWith('jellyfin'));
await Promise.all([p.waitForURL(/images\/jellyfin/), p.keyboard.press('Enter')]);
check('Enter navigates to /images/jellyfin/', p.url().includes('/images/jellyfin/'));
await p.waitForLoadState('networkidle');
await p.waitForTimeout(1000);
// 1b. precise matching and scroll position (regression: fuzzy matches buried the real hit)
await p.keyboard.press('Control+k');
await p.waitForSelector('[cmdk-input]');
await p.keyboard.type('a');
await p.waitForSelector('[cmdk-item][data-value^="image"]');
await p.locator('[cmdk-list]').evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
await p.keyboard.type('udiosilo');
await p.waitForTimeout(300);
const imgs = await p.locator('[cmdk-item][data-value^="image"]').allInnerTexts();
check(`"audiosilo" matches only audiosilo (${imgs.map((t) => t.split('\n')[0].split(' ')[0]).join(', ')})`, imgs.length === 1 && imgs[0].startsWith('audiosilo'));
check('list scrolled back to the top', (await p.locator('[cmdk-list]').evaluate((el) => el.scrollTop)) === 0);
check('best match is highlighted', (await p.locator('[cmdk-item][data-selected="true"]').innerText()).startsWith('audiosilo'));
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
// 2. ⌘K / Ctrl+K opens, Escape closes and trigger is still there
await p.keyboard.press('Control+k');
await p.waitForTimeout(400);
check(`Ctrl+K opens exactly one palette (${await p.locator('[role="dialog"]').count()})`, (await p.locator('[role="dialog"]').count()) === 1);
await p.keyboard.type('selkies');
await p.waitForTimeout(300);
check('posts match "selkies"', (await p.locator('[cmdk-group-heading]', { hasText: 'Blog posts' }).count()) > 0);
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
check('Escape closes it', (await p.locator('[role="dialog"]').count()) === 0);
check('search bar still visible after closing', await p.locator('header button[aria-haspopup="dialog"]').first().isVisible());
// 3. open again by click after closing
await p.locator('header button[aria-haspopup="dialog"]').first().click();
await p.waitForTimeout(400);
check('reopens on second click, one dialog', (await p.locator('[role="dialog"]').count()) === 1);
await p.keyboard.press('Escape');
// 4. mobile icon trigger
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on('pageerror', (e) => errs.push('mobile: ' + e.message));
await m.goto(base + '/', { waitUntil: 'networkidle' });
await m.waitForTimeout(1200);
await m.locator('header button[aria-label^="Search"]').first().tap();
await m.waitForTimeout(500);
check('mobile search icon opens one palette', (await m.locator('[role="dialog"]').count()) === 1);
await m.keyboard.type('plex');
await m.waitForSelector('[cmdk-item][data-value^="image"]', { timeout: 10000 });
check('mobile: typing filters results', (await m.locator('[cmdk-item][data-selected="true"]').first().innerText()).toLowerCase().startsWith('plex'));
console.log(errs.length ? 'page errors:\n  ' + errs.join('\n  ') : 'no page errors');
await b.close();
process.exit(failed || errs.length ? 1 : 0);

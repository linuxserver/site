#!/usr/bin/env node
/**
 * Accessibility check with axe-core (WCAG 2.0/2.1/2.2 A, AA and AAA rules) in light and dark mode.
 *
 *   node scripts/a11y.mjs <baseUrl> [path ...]
 *
 * e.g. node scripts/a11y.mjs http://localhost:4321 / /images/ /images/webtop/ /blog/
 * Exits non-zero when violations are found.
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [base, ...paths] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/a11y.mjs <baseUrl> [path ...]');
  process.exit(1);
}
const list = paths.length
  ? paths
  : ['/', '/images/', '/images/webtop/', '/blog/', '/blog/tags/', '/blog/webtop-5-0-and-selkies-2-0-everything-everywhere-all-in-one-release/', '/support/', '/donate/', '/about/', '/search/', '/404/'];

const browser = await chromium.launch();
let total = 0;
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
  // Store the choice too: the site defaults to dark whatever the OS says.
  await ctx.addInitScript((t) => localStorage.setItem('theme', t), scheme);
  for (const p of list) {
    const page = await ctx.newPage();
    await page.goto(base.replace(/\/$/, '') + p, { waitUntil: 'networkidle' });
    const res = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    const v = res.violations;
    total += v.length;
    console.log(`${v.length ? '✗' : '✓'} [${scheme}] ${p}${v.length ? ` — ${v.length} issue(s)` : ''}`);
    for (const x of v) {
      console.log(`    ${x.impact ?? ''} ${x.id}: ${x.help}`);
      for (const n of x.nodes.slice(0, 4)) console.log(`      ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`);
      if (x.nodes.length > 4) console.log(`      … and ${x.nodes.length - 4} more`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
process.exit(total ? 1 : 0);

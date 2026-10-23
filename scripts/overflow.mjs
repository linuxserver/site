import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto(url, { waitUntil: 'networkidle' });
const r = await p.evaluate(() => {
  const W = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('body *')) {
    const rc = el.getBoundingClientRect();
    if (rc.right > W + 1 && rc.width > 0) {
      const parentOver = el.parentElement && el.parentElement.getBoundingClientRect().right > W + 1;
      if (!parentOver) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 90)} right=${Math.round(rc.right)} w=${Math.round(rc.width)}`);
    }
  }
  return { scrollW: document.documentElement.scrollWidth, out: out.slice(0, 15) };
});
console.log(r.scrollW, '\n' + r.out.join('\n'));
await b.close();

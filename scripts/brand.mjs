#!/usr/bin/env node
/**
 * Generates the brand assets from the two source SVGs exported from Illustrator:
 *
 *   src/assets/brand/source-mark.svg  the otter mark
 *   src/assets/brand/source-logo.svg  mark + "linuxserver.io" wordmark (white text)
 *
 * Outputs
 *   src/assets/brand/mark.svg, wordmark.svg   class-free SVG bodies for inline use by Logo.astro:
 *                                             fills are attributes, ids are prefixed with __ID__ so every
 *                                             instance on a page gets unique gradient ids, and the
 *                                             wordmark text uses currentColor.
 *   public/favicon.svg, favicon.ico-sized PNGs, apple-touch-icon.png, icon-192/512.png, og-default.png
 *
 * Usage: node scripts/brand.mjs   (only needed when the logo changes)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const at = (p) => new URL(`../${p}`, import.meta.url);

function clean(svg, { textFill } = {}) {
  const rules = new Map();
  for (const m of svg.matchAll(/\.([\w-]+)\s*\{\s*fill\s*:\s*([^;}]+);?\s*\}/g)) rules.set(m[1], m[2].trim());
  let out = svg
    .replace(/<\?xml[^>]*>\s*/g, '')
    .replace(/<!--[\s\S]*?-->\s*/g, '')
    .replace(/<style[\s\S]*?<\/style>\s*/g, '')
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/style="stop-color:\s*([^;"]+);?(?:\s*stop-opacity:\s*([^;"]+);?)?"/g, (_, c, o) => `stop-color="${c}"${o ? ` stop-opacity="${o}"` : ''}`)
    .replace(/\s(data-name|xml:space|style|version|x|y|enable-background)="[^"]*"/g, '')
    .replace(/\sid="(Layer_\w+|Your_design)"/g, '')
    .replace(/class="([\w-]+)"/g, (_, c) => {
      let fill = rules.get(c) ?? 'currentColor';
      if (textFill && /^#fff(fff)?$/i.test(fill)) fill = textFill;
      return `fill="${fill}"`;
    })
    .replace(/url\(#([\w-]+)\)/g, 'url(#__ID__$1)')
    .replace(/\sid="([\w-]+)"/g, ' id="__ID__$1"')
    .replace(/xlink:href="#([\w-]+)"/g, 'href="#__ID__$1"')
    .replace(/\sxmlns:xlink="[^"]*"/g, '')
    .replace(/>\s+</g, '><')
    .trim();
  const viewBox = out.match(/viewBox="([^"]+)"/)[1];
  const body = out.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return { viewBox, body };
}

const mark = clean(readFileSync(at('src/assets/brand/source-mark.svg'), 'utf8'));
const word = clean(readFileSync(at('src/assets/brand/source-logo.svg'), 'utf8'), { textFill: 'currentColor' });
writeFileSync(at('src/assets/brand/mark.json'), JSON.stringify(mark));
writeFileSync(at('src/assets/brand/wordmark.json'), JSON.stringify(word));

const standalone = ({ viewBox, body }, id = 'm') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body.replaceAll('__ID__', id)}</svg>`;

const markSvg = standalone(mark);
writeFileSync(at('public/favicon.svg'), markSvg + '\n');

// Raster icons: the mark centred on a soft white disc reads well on any launcher background.
const [, , vw, vh] = mark.viewBox.split(/\s+/).map(Number);
async function icon(size, file, { pad = 0.14, bg = '#ffffff' } = {}) {
  const inner = Math.round(size * (1 - pad * 2));
  const markPng = await sharp(Buffer.from(markSvg), { density: 600 }).resize(inner, Math.round((inner * vh) / vw), { fit: 'contain', background: '#0000' }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: markPng, gravity: 'center' }])
    .png()
    .toFile(at(`public/${file}`).pathname);
}
await icon(180, 'apple-touch-icon.png');
await icon(192, 'icon-192.png');
await icon(512, 'icon-512.png');
await icon(32, 'favicon-32.png', { pad: 0.02, bg: '#0000' });

// Default social card, 1200x630.
const wordSvg = standalone(word, 'w').replace('<svg ', '<svg color="#ffffff" ');
const wordPng = await sharp(Buffer.from(wordSvg), { density: 300 }).resize(760).png().toBuffer();
const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="a" cx="85%" cy="10%" r="80%"><stop offset="0" stop-color="#d93b92" stop-opacity=".55"/><stop offset="1" stop-color="#d93b92" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="5%" cy="100%" r="70%"><stop offset="0" stop-color="#4179d4" stop-opacity=".45"/><stop offset="1" stop-color="#4179d4" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#140a24"/><rect width="1200" height="630" fill="url(#a)"/><rect width="1200" height="630" fill="url(#b)"/>
  <text x="220" y="430" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#e9defa">Community-built Docker images, done properly.</text>
</svg>`;
await sharp(Buffer.from(bg))
  .composite([{ input: wordPng, left: 220, top: 230 }])
  .png()
  .toFile(at('public/og-default.png').pathname);

console.log('brand assets written');

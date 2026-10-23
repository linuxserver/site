#!/usr/bin/env node
/** Splits a tall screenshot into viewport-sized pieces: node scripts/crop.mjs in.png [height=1800] */
import sharp from 'sharp';
const [file, h = 1800] = process.argv.slice(2);
const img = sharp(file);
const { width, height } = await img.metadata();
const out = [];
for (let top = 0, i = 0; top < height; top += Number(h), i++) {
  const name = file.replace(/\.png$/, `.${i}.png`);
  await sharp(file).extract({ left: 0, top, width, height: Math.min(Number(h), height - top) }).toFile(name);
  out.push(name);
}
console.log(out.join('\n'));

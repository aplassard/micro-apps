#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return (~c) >>> 0;
}

function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = u32(data.length);
  const crc = u32(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function png(width, height, rgba) {
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // Build uncompressed scanlines: each row starts with filter 0
  const rowLen = width * 4;
  const raw = Buffer.alloc((rowLen + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[(rowLen + 1) * y] = 0; // filter byte
    rgba.copy(raw, (rowLen + 1) * y + 1, rowLen * y, rowLen * (y + 1));
  }
  const idatData = deflateSync(raw);
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatData),
    chunk('IEND', iend),
  ]);
}

function makeSolidImage(w, h, r, g, b, a = 255) {
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    buf[i * 4 + 0] = r;
    buf[i * 4 + 1] = g;
    buf[i * 4 + 2] = b;
    buf[i * 4 + 3] = a;
  }
  return png(w, h, buf);
}

function writeIcon(file, w, h, color) {
  const [r,g,b] = color;
  const out = makeSolidImage(w, h, r, g, b, 255);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  console.log('wrote', file);
}

const root = resolve(process.cwd());
const pub = resolve(root, 'public');

// Colors: light and dark variants for quick placeholders
const dark = [10,10,10];

writeIcon(resolve(pub, 'icon-192.png'), 192, 192, dark);
writeIcon(resolve(pub, 'icon-512.png'), 512, 512, dark);
writeIcon(resolve(pub, 'apple-touch-icon.png'), 180, 180, dark);

console.log('Done.');


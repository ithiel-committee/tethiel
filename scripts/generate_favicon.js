import fs from "node:fs";
import zlib from "node:zlib";

/**
 * PNG decoder with full unfiltering support (filters 0..4)
 */
function decodePng(buffer) {
  const w = buffer.readUInt32BE(16);
  const h = buffer.readUInt32BE(20);
  let pos = 8;
  const idats = [];
  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString("ascii", pos + 4, pos + 8);
    if (type === "IDAT") idats.push(buffer.slice(pos + 8, pos + 8 + len));
    pos += 8 + len + 4;
  }
  const decomp = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = 1 + w * bpp;
  const rawRgba = Buffer.alloc(w * h * 4);

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < h; y++) {
    const filter = decomp[y * stride];
    const prevRow = y > 0 ? (y - 1) * w * bpp : null;
    const currRow = y * w * bpp;

    for (let x = 0; x < w * bpp; x++) {
      const rawByte = decomp[y * stride + 1 + x];
      const a = x >= bpp ? rawRgba[currRow + x - bpp] : 0;
      const b = prevRow !== null ? rawRgba[prevRow + x] : 0;
      const c =
        prevRow !== null && x >= bpp ? rawRgba[prevRow + x - bpp] : 0;

      let val = 0;
      if (filter === 0) val = rawByte;
      else if (filter === 1) val = (rawByte + a) & 0xff;
      else if (filter === 2) val = (rawByte + b) & 0xff;
      else if (filter === 3)
        val = (rawByte + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) val = (rawByte + paeth(a, b, c)) & 0xff;

      rawRgba[currRow + x] = val;
    }
  }
  return { w, h, rgba: rawRgba };
}

// CRC32 table for PNG chunk generation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function writeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}
function encodePng(width, height, rgbaBuffer) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0;
    rgbaBuffer.copy(
      scanlines,
      y * (1 + width * 4) + 1,
      y * width * 4,
      (y + 1) * width * 4,
    );
  }
  const idatChunk = writeChunk(
    "IDAT",
    zlib.deflateSync(scanlines, { level: 9 }),
  );
  const iendChunk = writeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([
    header,
    writeChunk("IHDR", ihdr),
    idatChunk,
    iendChunk,
  ]);
}

/**
 * Creates a standard Windows/Browser ICO file containing PNG streams
 */
function createIco(pngBuffersWithSizes) {
  const count = pngBuffersWithSizes.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO type
  header.writeUInt16LE(count, 4); // Number of images

  let offset = 6 + count * 16;
  const entries = [];
  const imageBuffers = [];

  for (const item of pngBuffersWithSizes) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // Width
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Offset to image data
    entries.push(entry);
    imageBuffers.push(item.buffer);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

const inputPath = "src/assets/cursor/tethiel_cursor.png";
const orig = decodePng(fs.readFileSync(inputPath));

// Analyze bounds
let minX = orig.w;
let maxX = 0;
let minY = orig.h;
let maxY = 0;
for (let y = 0; y < orig.h; y++) {
  for (let x = 0; x < orig.w; x++) {
    const a = orig.rgba[(y * orig.w + x) * 4 + 3];
    if (a > 10) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const contentW = maxX - minX + 1;
const contentH = maxY - minY + 1;
const contentCenterX = (minX + maxX) / 2;
const contentCenterY = (minY + maxY) / 2;

console.log(
  `Favicon generator source bounds: [${minX}..${maxX}], [${minY}..${maxY}]`,
);

function generateResampled(targetSize, outline = true) {
  // Padding around icon for perfect framing
  const pad =
    targetSize <= 16
      ? 0.5
      : targetSize <= 32
        ? 1.5
        : Math.max(2, Math.round(targetSize * 0.05));
  const maxW = targetSize - pad * 2;
  const maxH = targetSize - pad * 2;
  const scale = Math.min(maxW / contentW, maxH / contentH);

  const outBuf = Buffer.alloc(targetSize * targetSize * 4, 0);
  const targetCenterX = (targetSize - 1) / 2;
  const targetCenterY = (targetSize - 1) / 2;

  // Box filter supersampling for clean anti-aliasing
  for (let ty = 0; ty < targetSize; ty++) {
    for (let tx = 0; tx < targetSize; tx++) {
      const srcX0 = (tx - 0.5 - targetCenterX) / scale + contentCenterX;
      const srcX1 = (tx + 0.5 - targetCenterX) / scale + contentCenterX;
      const srcY0 = (ty - 0.5 - targetCenterY) / scale + contentCenterY;
      const srcY1 = (ty + 0.5 - targetCenterY) / scale + contentCenterY;

      const sxStart = Math.max(0, Math.floor(srcX0));
      const sxEnd = Math.min(orig.w - 1, Math.floor(srcX1));
      const syStart = Math.max(0, Math.floor(srcY0));
      const syEnd = Math.min(orig.h - 1, Math.floor(srcY1));

      let totalWeight = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let aSum = 0;

      for (let sy = syStart; sy <= syEnd; sy++) {
        const yWeight = Math.max(
          0,
          Math.min(sy + 1, srcY1) - Math.max(sy, srcY0),
        );
        if (yWeight <= 0) continue;
        for (let sx = sxStart; sx <= sxEnd; sx++) {
          const xWeight = Math.max(
            0,
            Math.min(sx + 1, srcX1) - Math.max(sx, srcX0),
          );
          if (xWeight <= 0) continue;
          const weight = xWeight * yWeight;

          const sIdx = (sy * orig.w + sx) * 4;
          const sa = orig.rgba[sIdx + 3] / 255;
          const sr = orig.rgba[sIdx];
          const sg = orig.rgba[sIdx + 1];
          const sb = orig.rgba[sIdx + 2];

          rSum += sr * sa * weight;
          gSum += sg * sa * weight;
          bSum += sb * sa * weight;
          aSum += sa * weight;
          totalWeight += weight;
        }
      }

      if (totalWeight > 0 && aSum > 0.05) {
        const avgA = Math.min(1, aSum / totalWeight);
        const avgR = Math.round(Math.min(255, rSum / aSum));
        const avgG = Math.round(Math.min(255, gSum / aSum));
        const avgB = Math.round(Math.min(255, bSum / aSum));

        const outIdx = (ty * targetSize + tx) * 4;
        outBuf[outIdx] = avgR;
        outBuf[outIdx + 1] = avgG;
        outBuf[outIdx + 2] = avgB;
        outBuf[outIdx + 3] = Math.round(avgA * 255);
      }
    }
  }

  // Outline for contrast on dark/light tabs
  if (outline && targetSize <= 64) {
    const copy = Buffer.from(outBuf);
    for (let ty = 0; ty < targetSize; ty++) {
      for (let tx = 0; tx < targetSize; tx++) {
        const idx = (ty * targetSize + tx) * 4;
        const curA = copy[idx + 3];
        if (curA < 180) {
          let maxNeighborA = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const ny = ty + dy;
              const nx = tx + dx;
              if (
                ny >= 0 &&
                ny < targetSize &&
                nx >= 0 &&
                nx < targetSize
              ) {
                const nIdx = (ny * targetSize + nx) * 4;
                if (copy[nIdx + 3] > maxNeighborA)
                  maxNeighborA = copy[nIdx + 3];
              }
            }
          }
          if (maxNeighborA > 140) {
            const outAlpha = Math.min(
              255,
              Math.round(maxNeighborA * 0.85),
            );
            outBuf[idx] = 255;
            outBuf[idx + 1] = 255;
            outBuf[idx + 2] = 255;
            outBuf[idx + 3] = Math.max(outBuf[idx + 3], outAlpha);
          }
        }
      }
    }
  }

  return encodePng(targetSize, targetSize, outBuf);
}

// Generate PNGs
const png16 = generateResampled(16, true);
const png32 = generateResampled(32, true);
const png48 = generateResampled(48, true);
const png180 = generateResampled(180, false);
const png192 = generateResampled(192, false);
const png512 = generateResampled(512, false);

fs.writeFileSync("public/favicon-16x16.png", png16);
fs.writeFileSync("public/favicon-32x32.png", png32);
fs.writeFileSync("public/favicon.png", png32);
fs.writeFileSync("public/apple-touch-icon.png", png180);
fs.writeFileSync("public/android-chrome-192x192.png", png192);
fs.writeFileSync("public/android-chrome-512x512.png", png512);

// Generate multi-size favicon.ico (16, 32, 48)
const ico = createIco([
  { size: 16, buffer: png16 },
  { size: 32, buffer: png32 },
  { size: 48, buffer: png48 },
]);
fs.writeFileSync("public/favicon.ico", ico);

console.log("Successfully generated all favicon variants in public/!");

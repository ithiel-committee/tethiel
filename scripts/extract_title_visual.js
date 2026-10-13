import fs from "node:fs";
import zlib from "node:zlib";

// CRC32 table for PNG chunk generation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
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
    rgbaBuffer.copy(scanlines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatChunk = writeChunk("IDAT", zlib.deflateSync(scanlines, { level: 9 }));
  const iendChunk = writeChunk("IEND", Buffer.alloc(0));
  return Buffer.concat([header, writeChunk("IHDR", ihdr), idatChunk, iendChunk]);
}

/**
 * Decodes 8BPS Photoshop file PackBits/RLE image data
 */
function decodePsd(buffer) {
  const w = buffer.readUInt32BE(18);
  const h = buffer.readUInt32BE(14);
  const channels = buffer.readUInt16BE(12);

  let offset = 26;
  offset += 4 + buffer.readUInt32BE(offset);
  offset += 4 + buffer.readUInt32BE(offset);
  offset += 4 + buffer.readUInt32BE(offset);
  offset += 2; // skip compression

  const lineCounts = [];
  for (let c = 0; c < channels; c++) {
    for (let y = 0; y < h; y++) {
      lineCounts.push(buffer.readUInt16BE(offset));
      offset += 2;
    }
  }

  const chData = Array.from({ length: channels }, () => Buffer.alloc(w * h));
  let curOffset = offset;

  for (let c = 0; c < channels; c++) {
    for (let y = 0; y < h; y++) {
      const len = lineCounts[c * h + y];
      const slice = buffer.slice(curOffset, curOffset + len);
      curOffset += len;

      let sIdx = 0;
      let col = 0;
      const rowStart = y * w;
      while (sIdx < slice.length && col < w) {
        const b = slice.readInt8(sIdx++);
        if (b >= 0 && b <= 127) {
          const count = b + 1;
          for (let k = 0; k < count && col < w; k++) {
            chData[c][rowStart + col++] = slice[sIdx++];
          }
        } else if (b > -128) {
          const count = 1 - b;
          const val = slice[sIdx++];
          for (let k = 0; k < count && col < w; k++) {
            chData[c][rowStart + col++] = val;
          }
        }
      }
    }
  }

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = chData[0][i];
    rgba[i * 4 + 1] = chData[1][i];
    rgba[i * 4 + 2] = chData[2][i];
    rgba[i * 4 + 3] = channels >= 4 ? chData[3][i] : 255;
  }

  return { w, h, rgba };
}

const inputPsd = process.argv[2];
if (!inputPsd || !fs.existsSync(inputPsd)) {
  console.error("Usage: node scripts/extract_title_visual.js <path-to-psd>");
  process.exit(1);
}

const { w, h, rgba } = decodePsd(fs.readFileSync(inputPsd));

// Bounding box: 738..2198, 672..1746
const minX = 738;
const maxX = 2198;
const minY = 672;
const maxY = 1746;
const pad = 20;

const cropX = Math.max(0, minX - pad);
const cropY = Math.max(0, minY - pad);
const cropW = Math.min(w - cropX, maxX - minX + 1 + pad * 2);
const cropH = Math.min(h - cropY, maxY - minY + 1 + pad * 2);

const cropBuf = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  const srcY = cropY + y;
  const srcRowStart = (srcY * w + cropX) * 4;
  rgba.copy(cropBuf, y * cropW * 4, srcRowStart, srcRowStart + cropW * 4);
}

fs.mkdirSync("src/assets/visual", { recursive: true });
const png = encodePng(cropW, cropH, cropBuf);
fs.writeFileSync("src/assets/visual/title_key_visual.png", png);
console.log(`Successfully generated src/assets/visual/title_key_visual.png (${cropW}x${cropH}, ${png.length} bytes)`);

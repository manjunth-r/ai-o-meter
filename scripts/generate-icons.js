const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 calculation for PNG chunks
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generateIconPNG(size) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc(height * (1 + width * 4));

  const center = size / 2;
  const radius = size * 0.44;
  const innerRadius = size * 0.32;

  let rawOffset = 0;
  for (let y = 0; y < height; y++) {
    rawData[rawOffset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - center + 0.5;
      const dy = y - center + 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 26, g = 26, b = 26, a = 0; // default transparent

      // Rounded rectangle badge
      const cornerRadius = size * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (center - cornerRadius));
      const qy = Math.max(0, Math.abs(dy) - (center - cornerRadius));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);

      if (cornerDist <= cornerRadius) {
        const edgeDist = cornerRadius - cornerDist;
        const alphaEdge = Math.min(1, Math.max(0, edgeDist + 0.5));

        // Dark background (#1A1A1A) with slight gradient
        r = 28 + Math.floor((y / height) * 15);
        g = 28 + Math.floor((y / height) * 15);
        b = 32 + Math.floor((y / height) * 15);
        a = Math.floor(alphaEdge * 255);

        // Meter arc or dial indicator
        const angle = Math.atan2(dy, dx);
        if (dist >= innerRadius * 0.65 && dist <= radius * 0.95 && angle > -2.6 && angle < 0.6) {
          const t = (angle + 2.6) / 3.2; // 0 to 1
          if (t < 0.4) {
            r = 46; g = 158; b = 91; // Green
          } else if (t < 0.75) {
            r = 216; g = 154; b = 44; // Amber
          } else {
            r = 194; g = 72; b = 44; // Coral
          }
          a = Math.floor(alphaEdge * 255);
        }

        // Center indicator dot
        if (dist <= innerRadius * 0.35) {
          r = 255; g = 255; b = 255; a = Math.floor(alphaEdge * 255);
        }
      }

      rawData[rawOffset++] = r;
      rawData[rawOffset++] = g;
      rawData[rawOffset++] = b;
      rawData[rawOffset++] = a;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const png = generateIconPNG(size);
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${outPath} (${size}x${size}, ${png.length} bytes)`);
});

// Pure Node.js PNG icon generator — no external dependencies
// Draws the PressLogo (viewBox 0 0 24 24) rasterized at multiple sizes.

import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = (c >>> 8) ^ CRC_TABLE[(c ^ b) & 0xFF]
  return (c ^ 0xFFFFFFFF) >>> 0
}

// ── PNG encoding ───────────────────────────────────────────────────────────
const SIG = Buffer.from([137,80,78,71,13,10,26,10])

function pngChunk(type, data) {
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcVal  = Buffer.alloc(4)
  crcVal.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([lenBuf, typeBuf, data, crcVal])
}

function encodePNG(pixels, W, H) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
  ihdr[8] = 8; ihdr[9] = 2 // 8-bit RGB

  // IDAT: prepend filter byte 0 per row, then deflate
  const raw = Buffer.alloc(H * (W * 3 + 1))
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0 // filter none
    for (let x = 0; x < W; x++) {
      const src = (y * W + x) * 3
      const dst = y * (W * 3 + 1) + 1 + x * 3
      raw[dst] = pixels[src]; raw[dst+1] = pixels[src+1]; raw[dst+2] = pixels[src+2]
    }
  }
  const compressed = deflateSync(raw, { level: 6 })

  return Buffer.concat([SIG, pngChunk('IHDR', ihdr), pngChunk('IDAT', compressed), pngChunk('IEND', Buffer.alloc(0))])
}

// ── Pixel drawing primitives ───────────────────────────────────────────────
function fill(px, W, H, r, g, b) {
  for (let i = 0; i < W * H; i++) { px[i*3]=r; px[i*3+1]=g; px[i*3+2]=b }
}

function fillRect(px, W, H, x, y, w, h, r, g, b) {
  x=Math.round(x); y=Math.round(y); w=Math.round(w); h=Math.round(h)
  for (let py=Math.max(0,y); py<Math.min(H,y+h); py++)
    for (let px2=Math.max(0,x); px2<Math.min(W,x+w); px2++) {
      const i=(py*W+px2)*3; px[i]=r; px[i+1]=g; px[i+2]=b
    }
}

function strokeRect(px, W, H, x, y, w, h, t, r, g, b) {
  fillRect(px,W,H,x,y,w,t,r,g,b)           // top
  fillRect(px,W,H,x,y+h-t,w,t,r,g,b)       // bottom
  fillRect(px,W,H,x,y,t,h,r,g,b)           // left
  fillRect(px,W,H,x+w-t,y,t,h,r,g,b)       // right
}

// ── Logo drawing (viewBox 0 0 24 24) ──────────────────────────────────────
// Elements: lid knob, plunger rod, plunger disc, beaker outline, lid line, liquid mark
function drawLogo(px, S, pad, bg, ink) {
  fill(px, S, S, ...bg)
  const sc = (S - 2 * pad) / 24
  const ox = pad, oy = pad
  const s = Math.max(1, Math.round(1.5 * sc))  // stroke width

  // Beaker outline
  strokeRect(px, S, S, ox+sc*5, oy+sc*5, sc*14, sc*17, s, ...ink)

  // Lid line (top of beaker)
  fillRect(px, S, S, ox+sc*5, oy+sc*5-s, sc*14, s, ...ink)

  // Lid knob
  fillRect(px, S, S, ox+sc*10.5, oy+sc*1.5, sc*3, sc*2, ...ink)

  // Plunger rod
  fillRect(px, S, S, ox+sc*11.25, oy+sc*3.5, sc*1.5, sc*7.5, ...ink)

  // Plunger disc
  fillRect(px, S, S, ox+sc*6.5, oy+sc*10.5, sc*11, sc*1.8, ...ink)

  // Liquid level marker
  fillRect(px, S, S, ox+sc*7, oy+sc*16, sc*4, Math.max(1, Math.round(sc*0.7)), ...ink)
}

// ── Generate icons ──────────────────────────────────────────────────────────
const BG  = [245, 242, 235]  // #F5F2EB
const INK = [21,  20,  18]   // #151412

const configs = [
  { name: 'icon-192.png', size: 192, pad: 0 },
  { name: 'icon-512.png', size: 512, pad: 0 },
  { name: 'apple-touch-icon.png', size: 180, pad: 0 },
]

for (const { name, size, pad } of configs) {
  const px = new Uint8Array(size * size * 3)
  drawLogo(px, size, pad, BG, INK)
  const outPath = name === 'apple-touch-icon.png'
    ? join(OUT, '..', name)
    : join(OUT, name)
  writeFileSync(outPath, encodePNG(px, size, size))
  console.log(`✓ ${name} (${size}×${size})`)
}

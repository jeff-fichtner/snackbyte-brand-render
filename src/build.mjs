/**
 * Compresses the brand guide into the forms code can consume.
 *
 * Every value here comes from `snackbyte-brand` — the guide, which is the authority.
 * Nothing in this file is a decision: if a change needs a judgment call, the judgment
 * belongs in the guide. The wordmark is outlined from the Bricolage Grotesque
 * variable font so the lockups are self-contained wherever they go — a letterhead,
 * a signature, a print shop.
 *
 *   npm run build
 *
 * Every family's files are fetched once, at the commit the guide pins, into .cache/fonts/
 * (gitignored), then subset to Latin and shipped as woff2 beside their licences. dist/ is
 * committed, so a consumer installing this by git tag needs no build step of its own.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as fontkit from 'fontkit';
import { Resvg } from '@resvg/resvg-js';
import subsetFont from 'subset-font';

const require = createRequire(import.meta.url);
/** The guide: the single source of every value below. */
const GUIDE = require('snackbyte-brand/tokens.json');

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = resolve(ROOT, 'dist');

// ---- the fonts, from the one commit the guide pins ------------------------------
const SOURCE = GUIDE.type.source;
/** Every family the guide names, keyed as it keys them: { bricolage: { family, files, … }, … }. */
const FAMILIES = Object.fromEntries(
  Object.entries(GUIDE.type.families).filter(([k]) => k !== '_'),
);
const sourceUrl = (path) =>
  `https://raw.githubusercontent.com/${SOURCE.repo}/${SOURCE.commit}/` +
  path.split('/').map(encodeURIComponent).join('/');
const cachePath = (path) => resolve(ROOT, '.cache/fonts', SOURCE.commit, path);
/** The licence that sits beside a family's files in the source, named as the guide names it. */
const licencePath = (key) =>
  posix.join(posix.dirname(Object.values(FAMILIES[key].files)[0]), `${FAMILIES[key].licence}.txt`);
/** A family's file in the source checkout, by guide key and style (roman, italic). */
const fontPath = (key, style = 'roman') => cachePath(FAMILIES[key].files[style]);
/** What dist/ calls a shipped file: the guide's family key and style. */
const shippedFont = (key, style) => `fonts/${key}-${style}.woff2`;
const shippedLicence = (key) => `fonts/${key}-${FAMILIES[key].licence}.txt`;

/**
 * Google Fonts' `latin` subset, the definition every browser already meets in its
 * unicode-range. "Latin" in the guide means this set; it is not chosen here.
 */
const LATIN = [
  [0x0000, 0x00ff], [0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6], [0x02da],
  [0x02dc], [0x0304], [0x0308], [0x0329], [0x2000, 0x206f], [0x20ac], [0x2122], [0x2191],
  [0x2193], [0x2212], [0x2215], [0xfeff], [0xfffd],
];
const hex = (n) => n.toString(16).toUpperCase().padStart(4, '0');
const LATIN_RANGE = LATIN.map(([a, b]) => (b ? `U+${hex(a)}-${hex(b)}` : `U+${hex(a)}`)).join(', ');
const LATIN_TEXT = LATIN.flatMap(([a, b = a]) =>
  Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)),
).join('');

// ---- the geometry, in one unit ------------------------------------------------
const CELL = GUIDE.geometry.cell;
const RADIUS = GUIDE.geometry.radius;
const GAP = GUIDE.geometry.gap;
const SEAM = GUIDE.geometry.seam;
const BITE_R = GUIDE.geometry.bite.r;
const BITE_C = { x: GUIDE.geometry.bite.cx, y: GUIDE.geometry.bite.cy };

// ---- the palette --------------------------------------------------------------
/** Every colour role the guide names, in source order. */
const ROLES = Object.keys(GUIDE.color).filter((k) => k !== '_');
/** The same roles keyed by theme: { day: { ground, ink, … }, night: { … } }. */
const THEMES = Object.fromEntries(
  ['day', 'night'].map((theme) => [
    theme,
    Object.fromEntries(ROLES.map((role) => [role, GUIDE.color[role][theme]])),
  ]),
);

// ---- the wordmark -------------------------------------------------------------
const WORD = GUIDE.type.wordmark.text;

const r =(n) => Math.round(n * 1000) / 1000;

/** A plain cell as a path (a rounded rect), at (x, y). */
function cellPath(x, y) {
  const c = CELL;
  const k = RADIUS;
  return (
    `M${r(x + k)},${r(y)} h${c - 2 * k} a${k},${k} 0 0 1 ${k},${k} v${c - 2 * k} ` +
    `a${k},${k} 0 0 1 -${k},${k} h-${c - 2 * k} a${k},${k} 0 0 1 -${k},-${k} v-${c - 2 * k} ` +
    `a${k},${k} 0 0 1 ${k},-${k} z`
  );
}

/**
 * The bitten cell as an exact path: the rounded rect with the bite's arc cut in from
 * the top edge to the right edge. Computed, not masked, so it survives any SVG consumer.
 */
function bittenCellPath(x, y) {
  const c = CELL;
  const k = RADIUS;
  // where the bite circle crosses the top edge (y = 0) and the right edge (x = CELL)
  const dx = Math.sqrt(BITE_R ** 2 - BITE_C.y ** 2); // half-chord along the top edge
  const topX = BITE_C.x - dx;
  const dy = Math.sqrt(BITE_R ** 2 - (BITE_C.x - c) ** 2);
  const rightY = BITE_C.y + dy;
  return (
    `M${r(x + topX)},${r(y)} ` + // start where the bite meets the top edge
    `h-${r(topX - k)} a${k},${k} 0 0 0 -${k},${k} v${c - 2 * k} ` + // top-left corner, down the left
    `a${k},${k} 0 0 0 ${k},${k} h${c - 2 * k} a${k},${k} 0 0 0 ${k},-${k} ` + // along the bottom, bottom-right corner
    `v-${r(c - k - rightY)} ` + // up the right edge (it starts after the corner radius) to the bite
    `A${BITE_R},${BITE_R} 0 0 1 ${r(x + topX)},${r(y)} z` // the bite, bowing inward, back to the start
  );
}

/** The row: four ink cells, the seam, four sky cells, the last one bitten. 105 × 10. */
function rowShapes(t) {
  const step = CELL + GAP;
  const xs = [0, 1, 2, 3].map((i) => i * step);
  const off = 3 * step + CELL + SEAM;
  const shapes = [];
  for (const x of xs) shapes.push({ d: cellPath(x, 0), fill: t.ink });
  for (let i = 0; i < 3; i++) shapes.push({ d: cellPath(off + xs[i], 0), fill: t.sky });
  shapes.push({ d: bittenCellPath(off + xs[3], 0), fill: t.sky });
  return { shapes, w: off + 3 * step + CELL, h: CELL };
}

/** The stack: sky over ink, the seam between the rows, the bite top right. 49 × 27. */
function stackShapes(t) {
  const step = CELL + GAP;
  const xs = [0, 1, 2, 3].map((i) => i * step);
  const y2 = CELL + SEAM;
  const shapes = [];
  for (let i = 0; i < 3; i++) shapes.push({ d: cellPath(xs[i], 0), fill: t.sky });
  shapes.push({ d: bittenCellPath(xs[3], 0), fill: t.sky });
  for (const x of xs) shapes.push({ d: cellPath(x, y2), fill: t.ink });
  return { shapes, w: 3 * step + CELL, h: y2 + CELL };
}

const pathsToSvg = (shapes, extra = '') =>
  shapes.map((s) => `  <path d="${s.d}" fill="${s.fill}"${extra}/>`).join('\n');

function svgDoc(w, h, body, { title } = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}"` +
    (title ? ` role="img" aria-label="${title}"` : '') +
    `>\n${body}\n</svg>\n`
  );
}

/** The tile: a square of the ground colour, corner 14, with the stack centred. 64 × 64. */
function tileSvg(t, { rounded = true } = {}) {
  const { shapes, w, h } = stackShapes(t);
  const S = GUIDE.forms.tile.size;
  const tx = (S - w) / 2;
  const ty = (S - h) / 2;
  const corner = rounded ? ` rx="${GUIDE.forms.tile.radius}"` : '';
  return svgDoc(
    S,
    S,
    `  <rect width="${S}" height="${S}"${corner} fill="${t.ground}"/>\n` +
      `  <g transform="translate(${r(tx)} ${r(ty)})">\n${pathsToSvg(shapes)}\n  </g>`,
    { title: GUIDE.copy.name },
  );
}

/** The theme-following tile: one SVG whose colours flip under prefers-color-scheme. */
function tileThemedSvg() {
  const d = THEMES.day;
  const n = THEMES.night;
  const { shapes, w, h } = stackShapes({ ink: 'INK', sky: 'SKY', ground: 'GROUND' });
  const S = GUIDE.forms.tile.size;
  const body =
    `  <style>\n    .t{fill:${d.ground}}.s{fill:${d.sky}}.g{fill:${d.ink}}\n` +
    `    @media (prefers-color-scheme: dark){.t{fill:${n.ground}}.s{fill:${n.sky}}.g{fill:${n.ink}}}\n  </style>\n` +
    `  <rect width="${S}" height="${S}" rx="${GUIDE.forms.tile.radius}" class="t"/>\n` +
    `  <g transform="translate(${r((S - w) / 2)} ${r((S - h) / 2)})">\n` +
    shapes.map((s) => `    <path d="${s.d}" class="${s.fill === 'SKY' ? 's' : 'g'}"/>`).join('\n') +
    `\n  </g>`;
  return svgDoc(S, S, body, { title: GUIDE.copy.name });
}

// ---- the wordmark, outlined ---------------------------------------------------
/** Fetches one file from the source at the pinned commit, once. */
async function ensureSource(path) {
  const dest = cachePath(path);
  if (existsSync(dest)) return;
  mkdirSync(resolve(dest, '..'), { recursive: true });
  const res = await fetch(sourceUrl(path));
  if (!res.ok) throw new Error(`font fetch failed: ${res.status} ${sourceUrl(path)}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function ensureFonts() {
  for (const key of Object.keys(FAMILIES)) {
    for (const path of Object.values(FAMILIES[key].files)) await ensureSource(path);
    await ensureSource(licencePath(key));
  }
}

/**
 * Lays out `text` at `size` px in one of the guide's drawn cuts (wordmark, headline,
 * markText) and returns its glyph paths (y down, origin at the baseline's left advance
 * origin) plus the ink bounds and the font's vertical metrics. The wordmark is one call of
 * this; the social card's headline is another.
 */
function outline(text, size, cut = GUIDE.type.wordmark) {
  const font = fontkit
    .openSync(fontPath(cut.family))
    .getVariation({ wght: cut.weight, opsz: cut.opsz, wdth: cut.width });
  const scale = size / font.unitsPerEm;
  const tracking = cut.tracking * size;
  const run = font.layout(text);
  let x = 0;
  const paths = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  run.glyphs.forEach((g, i) => {
    const p = run.positions[i];
    const gx = x + p.xOffset * scale;
    const gy = -p.yOffset * scale;
    const path = g.path.scale(scale, -scale).translate(gx, gy);
    const b = path.bbox;
    if (b.width > 0) {
      minX = Math.min(minX, b.minX);
      maxX = Math.max(maxX, b.maxX);
      minY = Math.min(minY, b.minY);
      maxY = Math.max(maxY, b.maxY);
    }
    paths.push(path.toSVG());
    x += p.xAdvance * scale + tracking;
  });
  return {
    d: paths.join(' '),
    ink: { minX, maxX, minY, maxY, width: maxX - minX },
    xHeight: (font.xHeight / font.unitsPerEm) * size,
    capHeight: (font.capHeight / font.unitsPerEm) * size,
    ascent: (font.ascent / font.unitsPerEm) * size,
    descent: (font.descent / font.unitsPerEm) * size,
  };
}

/** The wordmark: the name, in the display cut, tracked tight. */
const wordmark = (size) => outline(WORD, size);

/** The name alone, outlined, cropped to its ink. */
function wordmarkSvg(t, size = 100) {
  const w = wordmark(size);
  const pad = size * 0.02;
  const W = w.ink.width + 2 * pad;
  const H = w.ink.maxY - w.ink.minY + 2 * pad;
  return svgDoc(
    W,
    H,
    `  <path transform="translate(${r(-w.ink.minX + pad)} ${r(-w.ink.minY + pad)})" d="${w.d}" fill="${t.ink}"/>`,
    { title: GUIDE.copy.name },
  );
}

/**
 * Above: the row over the name, left edges aligned on ink, the row three quarters of
 * the name's width, the gap between them one seam.
 */
function lockupAboveSvg(t, size = 100) {
  const w = wordmark(size);
  const row = rowShapes(t);
  const unit = (0.75 * w.ink.width) / row.w;
  const rowH = row.h * unit;
  const gap = SEAM * unit;
  const pad = size * 0.04;
  const W = w.ink.width + 2 * pad;
  const H = rowH + gap + (w.ink.maxY - w.ink.minY) + 2 * pad;
  const wordY = pad + rowH + gap - w.ink.minY;
  return svgDoc(
    W,
    H,
    `  <g transform="translate(${r(pad)} ${r(pad)}) scale(${r(unit)})">\n${pathsToSvg(row.shapes)}\n  </g>\n` +
      `  <path transform="translate(${r(pad - w.ink.minX)} ${r(wordY)})" d="${w.d}" fill="${t.ink}"/>`,
    { title: GUIDE.copy.name },
  );
}

/**
 * Beside: the row to the left of the name, standing on the baseline as tall as the
 * lowercase letters, one seam between them.
 */
function lockupBesideSvg(t, size = 100) {
  const w = wordmark(size);
  const row = rowShapes(t);
  const unit = w.xHeight / row.h;
  const rowW = row.w * unit;
  const gap = SEAM * unit;
  const pad = size * 0.04;
  const W = rowW + gap + w.ink.width + 2 * pad;
  const H = w.ink.maxY - w.ink.minY + 2 * pad;
  const baseline = pad - w.ink.minY;
  return svgDoc(
    W,
    H,
    `  <g transform="translate(${r(pad)} ${r(baseline - w.xHeight)}) scale(${r(unit)})">\n${pathsToSvg(row.shapes)}\n  </g>\n` +
      `  <path transform="translate(${r(pad + rowW + gap - w.ink.minX)} ${r(baseline)})" d="${w.d}" fill="${t.ink}"/>`,
    { title: GUIDE.copy.name },
  );
}

/**
 * The social card, 1200 × 630, for link previews (Open Graph): the lockup, the headline on
 * two lines, the place. Everything is outlined so it renders anywhere.
 */
function socialSvg(t) {
  const W = 1200;
  const H = 630;
  const pad = 80;
  const w = wordmark(150);
  const row = rowShapes(t);
  const unit = (0.75 * w.ink.width) / row.w;
  const rowH = row.h * unit;
  const gap = SEAM * unit;
  const wordTop = pad + rowH + gap;
  const wordBottom = wordTop + (w.ink.maxY - w.ink.minY);
  const lines = GUIDE.copy.headlineLines.map((s) => outline(s, 64, GUIDE.type.headline));
  const lineH = 64 * GUIDE.type.headline.lineHeight;
  const headTop = wordBottom + 60;
  const place = outline(GUIDE.copy.place, 26, GUIDE.type.markText);
  const placeBaseline = H - pad + 6;
  const text = (o, y, fill) =>
    `  <path transform="translate(${r(pad - o.ink.minX)} ${r(y)})" d="${o.d}" fill="${fill}"/>`;
  return svgDoc(
    W,
    H,
    `  <rect width="${W}" height="${H}" fill="${t.ground}"/>\n` +
      `  <g transform="translate(${pad} ${pad}) scale(${r(unit)})">\n${pathsToSvg(row.shapes)}\n  </g>\n` +
      text(w, wordTop - w.ink.minY, t.ink) +
      '\n' +
      lines.map((o, i) => text(o, headTop - o.ink.minY + i * lineH, t.ink)).join('\n') +
      '\n' +
      text(place, placeBaseline, t.muted),
    { title: `${GUIDE.copy.name}. ${GUIDE.copy.headline}` },
  );
}

/**
 * The square card, 800 × 800, for link previews that lay out compactly (iMessage shows a
 * square image as a thumbnail beside the title rather than a banner above it): the lockup
 * alone, centred, the name at four fifths of the width.
 */
function squareSvg(t) {
  const S = 800;
  const pad = 80;
  const size = r((S - 2 * pad - 40) / 4.31); // the name's ink is 4.31em wide
  const w = wordmark(size);
  const row = rowShapes(t);
  const unit = (0.75 * w.ink.width) / row.w;
  const rowH = row.h * unit;
  const gap = SEAM * unit;
  const wordH = w.ink.maxY - w.ink.minY;
  const lines = GUIDE.copy.headlineLines.map((s) => outline(s, 52, GUIDE.type.headline));
  const lineH = 52 * GUIDE.type.headline.lineHeight;
  const headGap = 52;
  const total = rowH + gap + wordH + headGap + lineH * lines.length;
  const top = (S - total) / 2;
  const headTop = top + rowH + gap + wordH + headGap;
  const text = (o, y) =>
    `  <path transform="translate(${r(pad - o.ink.minX)} ${r(y)})" d="${o.d}" fill="${t.ink}"/>`;
  return svgDoc(
    S,
    S,
    `  <rect width="${S}" height="${S}" fill="${t.ground}"/>\n` +
      `  <g transform="translate(${pad} ${r(top)}) scale(${r(unit)})">\n${pathsToSvg(row.shapes)}\n  </g>\n` +
      text(w, top + rowH + gap - w.ink.minY) +
      '\n' +
      lines.map((o, i) => text(o, headTop - o.ink.minY + i * lineH)).join('\n'),
    { title: `${GUIDE.copy.name}. ${GUIDE.copy.headline}` },
  );
}

// ---- raster -------------------------------------------------------------------
function png(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
}

/** An .ico holding PNG-encoded images (every browser since IE has read these). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

// ---- write everything ---------------------------------------------------------
await ensureFonts();
mkdirSync(OUT, { recursive: true });
const write = (rel, data) => {
  const p = join(OUT, rel);
  mkdirSync(resolve(p, '..'), { recursive: true });
  writeFileSync(p, data);
  console.log(`  ${rel}`);
};

for (const [name, t] of Object.entries(THEMES)) {
  const row = rowShapes(t);
  const stack = stackShapes(t);
  write(
    `mark-row-${name}.svg`,
    svgDoc(row.w, row.h, pathsToSvg(row.shapes), { title: GUIDE.copy.name }),
  );
  write(
    `icon-stack-${name}.svg`,
    svgDoc(stack.w, stack.h, pathsToSvg(stack.shapes), { title: GUIDE.copy.name }),
  );
  write(`tile-${name}.svg`, tileSvg(t));
  write(`wordmark-${name}.svg`, wordmarkSvg(t));
  const above = lockupAboveSvg(t);
  const beside = lockupBesideSvg(t);
  write(`lockup-above-${name}.svg`, above);
  write(`lockup-beside-${name}.svg`, beside);
  write(`png/lockup-above-${name}-1200.png`, png(above, 1200));
  write(`png/lockup-above-${name}-2400.png`, png(above, 2400));
  write(`png/lockup-beside-${name}-1200.png`, png(beside, 1200));
  write(`png/lockup-beside-${name}-2400.png`, png(beside, 2400));
  write(`png/mark-row-${name}-1200.png`, png(svgDoc(row.w, row.h, pathsToSvg(row.shapes)), 1200));
  write(`png/social-${name}.png`, png(socialSvg(t), 1200));
  write(`png/social-square-${name}.png`, png(squareSvg(t), 800));

  // favicons and app icons from the tile
  const tile = tileSvg(t);
  const sizes = [16, 32, 48, 180, 192, 512];
  const rendered = Object.fromEntries(sizes.map((s) => [s, png(tile, s)]));
  write(`favicon/${name}/favicon-16.png`, rendered[16]);
  write(`favicon/${name}/favicon-32.png`, rendered[32]);
  write(`favicon/${name}/favicon-48.png`, rendered[48]);
  write(`favicon/${name}/apple-touch-icon-180.png`, rendered[180]);
  write(`favicon/${name}/icon-192.png`, rendered[192]);
  write(`favicon/${name}/icon-512.png`, rendered[512]);
  write(`favicon/${name}/icon-maskable-512.png`, png(tileSvg(t, { rounded: false }), 512));
  write(
    `favicon/${name}/favicon.ico`,
    ico([16, 32, 48].map((s) => ({ size: s, data: rendered[s] }))),
  );
}
write('tile.svg', tileThemedSvg());

// ---- the guide, compressed for code -------------------------------------------

/** Every cut the guide names a face for, in its order: wordmark, markText, … code. */
const CUTS = Object.keys(GUIDE.type).filter((k) => GUIDE.type[k].family || GUIDE.type[k].fallback);
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
/** A cut's font stack: its family and that family's fallbacks, or the fallbacks alone (code). */
const stackOf = (cut) => {
  const c = GUIDE.type[cut];
  if (!c.family) return c.fallback.join(', ');
  return [`'${FAMILIES[c.family].family}'`, ...FAMILIES[c.family].fallback].join(', ');
};

/**
 * The text face's weights and line heights. The legal face states its own, so a legal
 * document swaps all of them with the family rather than assuming they agree.
 */
const faceVars = (cut) => [
  ...Object.entries(GUIDE.type[cut].weights).map(([k, v]) => `  --weight-${k}: ${v};`),
  ...Object.entries(GUIDE.type[cut].lineHeight).map(([k, v]) => `  --leading-${k}: ${v};`),
];

/** `--role: value;` lines for one theme, plus the scales (which do not change by theme). */
const varsFor = (theme, { scales = false } = {}) => {
  const lines = ROLES.map((role) => `  --${role}: ${GUIDE.color[role][theme]};`);
  if (scales) {
    lines.push('');
    lines.push(`  --unit: ${GUIDE.space.unit}px;`);
    for (const [name, px] of Object.entries(GUIDE.space.steps)) lines.push(`  --${name}: ${px}px;`);
    lines.push('');
    GUIDE.type.scale.steps.forEach((px, i) =>
      lines.push(`  --type-${i}: ${r(px / GUIDE.type.scale.base)}rem;`),
    );
    lines.push(`  --type-small: ${r(GUIDE.type.scale.small.px / GUIDE.type.scale.base)}rem;`);
    lines.push(`  --leading-small: ${GUIDE.type.scale.small.lineHeight};`);
    lines.push('');
    for (const cut of CUTS) lines.push(`  --font-${kebab(cut)}: ${stackOf(cut)};`);
    lines.push('');
    lines.push(...faceVars('text'));
  }
  return lines.join('\n');
};

/** The palette and the scales as custom properties, with the theme rule the guide states. */
function tokensCss() {
  return (
    `/* Generated from the snackbyte brand guide v${GUIDE.version}. Do not edit. */\n\n` +
    `:root {\n${varsFor('day', { scales: true })}\n}\n\n` +
    `@media (prefers-color-scheme: dark) {\n` +
    `  :root:not([data-theme='light']) {\n` +
    varsFor('night')
      .split('\n')
      .map((l) => `  ${l}`)
      .join('\n') +
    `\n  }\n}\n\n` +
    `:root[data-theme='dark'] {\n${varsFor('night')}\n}\n\n` +
    `/* A legal or financial document: below its title, ${FAMILIES[GUIDE.type.legal.family].family} replaces the text face.\n` +
    `   Set data-face='legal' on <html>, or on the element that holds the document. */\n` +
    `[data-face='legal'] {\n  --font-text: var(--font-legal);\n${faceVars('legal').join('\n')}\n}\n`
  );
}

/** The CSS for one of the guide's Bricolage cuts: weight, optical size, width, tracking. */
const cutCss = (cut) => {
  const c = GUIDE.type[cut];
  return (
    `  font-family: var(--font-${kebab(cut)});\n  font-weight: ${c.weight};\n` +
    `  font-variation-settings: 'opsz' ${c.opsz}, 'wdth' ${c.width};\n` +
    `  letter-spacing: ${c.tracking}em;\n` +
    (c.lineHeight === undefined ? '' : `  line-height: ${c.lineHeight};\n`)
  );
};

/**
 * One @font-face per file the guide names, served from beside this stylesheet. The weight
 * and width ranges are read from each file's own axes.
 */
function fontFace(key, style, axes) {
  const range = (axis, unit = '') => `${axes[axis].min}${unit} ${axes[axis].max}${unit}`;
  return (
    `@font-face {\n  font-family: '${FAMILIES[key].family}';\n` +
    `  font-style: ${style === 'roman' ? 'normal' : style};\n` +
    `  font-weight: ${range('wght')};\n` +
    (axes.wdth ? `  font-stretch: ${range('wdth', '%')};\n` : '') +
    // swap: text shows in the fallback while the face loads, rather than not at all
    `  font-display: swap;\n` +
    `  src: url('./${shippedFont(key, style)}') format('woff2');\n` +
    `  unicode-range: ${LATIN_RANGE};\n}\n`
  );
}

/** Each family's files, subset to Latin, as woff2, with its licence; and fonts.css to load them. */
async function writeFonts() {
  const faces = [];
  for (const key of Object.keys(FAMILIES)) {
    for (const [style, path] of Object.entries(FAMILIES[key].files)) {
      const source = readFileSync(cachePath(path));
      // Name IDs 0–6 are harfbuzz's default; 13 and 14 are the licence and its URL; 16 and 17
      // the typographic family, which a variable font's ID 1 (its default instance) is not.
      const woff2 = await subsetFont(source, LATIN_TEXT, {
        targetFormat: 'woff2',
        preserveNameIds: [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17],
      });
      write(shippedFont(key, style), woff2);
      faces.push(fontFace(key, style, fontkit.create(source).variationAxes));
    }
    write(shippedLicence(key), readFileSync(cachePath(licencePath(key))));
  }
  write(
    'fonts.css',
    `/* Generated from the snackbyte brand guide v${GUIDE.version}. Do not edit.\n` +
      `   The faces, from ${SOURCE.repo} at ${SOURCE.commit}, subset to Latin.\n` +
      `   Serve fonts/ beside this file; nothing loads from a third party. */\n\n` +
      faces.join('\n'),
  );
}

/**
 * The rules that are the guide rather than a page's taste: the page ground and ink, the
 * text face and its two weights, h1 in Bricolage, the panel's edge, the wordmark's cut,
 * and the lockup's proportions. A consumer may skip this file.
 */
function baseCss() {
  const size = 100;
  const w = wordmark(size);
  const bearing = w.ink.minX / size; // the name's left side bearing, in ems
  const rowEm = 0.75 * (w.ink.width / size); // the row is three quarters of the name's ink width
  const seamEm = (rowEm / rowShapes(THEMES.day).w) * SEAM; // one seam, at the row's rendered scale
  // At the wordmark's line height its box is shorter than the font's content box, so its
  // top sits a little above the ink. That inset is already vertical space; the seam is
  // measured from the ink, so the gap set in CSS is the seam less the inset.
  const halfLeading = (GUIDE.type.wordmark.lineHeight * size - (w.ascent - w.descent)) / 2;
  const inset = (w.ascent + halfLeading - -w.ink.minY) / size;
  return (
    `/* Generated from the snackbyte brand guide v${GUIDE.version}. Do not edit. */\n\n` +
    `html,\nbody {\n  margin: 0;\n}\n\n` +
    `body {\n  background: var(--ground);\n  color: var(--ink);\n  font-size: var(--type-0);\n` +
    `  font-optical-sizing: auto;\n  font-synthesis: ${GUIDE.type.rules.fontSynthesis};\n` +
    `  -webkit-font-smoothing: antialiased;\n}\n\n` +
    `/* The text face, everywhere below h1. A legal document (data-face='legal') swaps it\n` +
    `   where it is set, so its children inherit the serif rather than the page's face. */\n` +
    `body,\n[data-face] {\n  font-family: var(--font-text);\n  font-weight: var(--weight-regular);\n` +
    `  line-height: var(--leading-body);\n}\n\n` +
    `/* Form controls take the system face unless told otherwise: that would be a third. */\n` +
    `button,\ninput,\nselect,\ntextarea {\n  font-family: inherit;\n}\n\n` +
    `h2,\nh3,\nth,\nb,\nstrong,\nbutton {\n  font-weight: var(--weight-strong);\n}\n\n` +
    `h2,\nh3 {\n  line-height: var(--leading-heading);\n}\n\n` +
    `/* Bricolage takes h1 and nothing else: the title cut, or the headline on the home page. */\n` +
    `h1 {\n${cutCss('title')}}\n\n` +
    `.headline {\n${cutCss('headline')}}\n\n` +
    `table {\n  font-variant-numeric: ${GUIDE.type.rules.columnFigures};\n}\n\n` +
    `code,\nkbd,\nsamp,\npre {\n  font-family: var(--font-code);\n}\n\n` +
    `/* A block set apart from the page. Always edged; never nested. */\n` +
    `.panel {\n  background: var(--panel);\n  border: 1px solid var(--rule);\n}\n\n` +
    `a {\n  color: var(--sky);\n}\na:focus-visible {\n  outline: 2px solid var(--sky);\n` +
    `  outline-offset: 3px;\n  border-radius: 3px;\n}\n\n` +
    `/* The wordmark: the name, always lowercase, in its own cut. */\n` +
    `.wordmark {\n${cutCss('wordmark')}}\n\n` +
    `/* Words drawn with the mark, such as the place line under a lockup. */\n` +
    `.mark-text {\n${cutCss('markText')}}\n\n` +
    `/* The primary lockup: the row above the name, one seam apart, left edges aligned\n` +
    `   on ink. The proportions come from the font's metrics. */\n` +
    `.lockup {\n  display: inline-flex;\n  flex-direction: column;\n  align-items: flex-start;\n` +
    `  font-size: var(--lockup-size, 6rem);\n}\n` +
    `.lockup > .mark {\n  display: block;\n  width: ${r(rowEm)}em;\n  height: auto;\n` +
    `  margin-bottom: ${r(seamEm - inset)}em;\n}\n` +
    `.lockup > .wordmark {\n  font-size: 1em;\n  margin-left: ${r(-bearing)}em;\n}\n`
  );
}

/** The whole guide, plus the marks as path data, for JavaScript and TypeScript consumers. */
/** Every block the guide states, in its order. Each one ships; none is chosen here. */
const BLOCKS = Object.keys(GUIDE).filter((k) => k !== '_' && k !== 'version');

/**
 * A TypeScript type for a JSON value, derived from the value itself. Declarations are
 * generated rather than written, because a hand-written one silently omits whatever the
 * guide adds next — which is how copy.based once reached the values but not the types.
 */
function typeOf(v) {
  if (Array.isArray(v)) return v.length ? `${typeOf(v[0])}[]` : 'unknown[]';
  if (v === null) return 'null';
  if (typeof v === 'object')
    return `{ ${Object.entries(v)
      .map(([k, x]) => `${JSON.stringify(k)}: ${typeOf(x)}`)
      .join('; ')} }`;
  return typeof v;
}

/** The whole guide, plus the marks as path data, for JavaScript and TypeScript consumers. */
function indexJs(forms) {
  return (
    `// Generated from the snackbyte brand guide v${GUIDE.version}. Do not edit.\n` +
    `export const version = ${JSON.stringify(GUIDE.version)};\n` +
    BLOCKS.map((k) => `export const ${k} = ${JSON.stringify(GUIDE[k], null, 2)};\n`).join('') +
    `export const marks = ${JSON.stringify(forms, null, 2)};\n`
  );
}

function indexDts() {
  return (
    `// Generated from the snackbyte brand guide v${GUIDE.version}. Do not edit.\n` +
    `export type Theme = 'day' | 'night';\n` +
    `export type Role = ${ROLES.map((x) => `'${x}'`).join(' | ')};\n` +
    `export type Shape = { d: string; role: 'ink' | 'sky' };\n` +
    `export type Mark = { viewBox: string; width: number; height: number; shapes: Shape[] };\n\n` +
    `export declare const version: string;\n` +
    BLOCKS.map((k) => `export declare const ${k}: ${typeOf(GUIDE[k])};\n`).join('') +
    `export declare const marks: { row: Mark; stack: Mark };\n`
  );
}

const ROLE_SENTINEL = { ink: 'INK', sky: 'SKY', ground: 'GROUND' };
const asMark = ({ shapes, w, h }) => ({
  viewBox: `0 0 ${r(w)} ${r(h)}`,
  width: r(w),
  height: r(h),
  shapes: shapes.map((s) => ({ d: s.d, role: s.fill === ROLE_SENTINEL.sky ? 'sky' : 'ink' })),
});
const FORMS = { row: asMark(rowShapes(ROLE_SENTINEL)), stack: asMark(stackShapes(ROLE_SENTINEL)) };

await writeFonts();
write('tokens.css', tokensCss());
write('base.css', baseCss());
write('index.js', indexJs(FORMS));
write('index.d.ts', indexDts());
write('marks.json', JSON.stringify(FORMS, null, 2) + '\n');
console.log(`compressed from snackbyte-brand v${GUIDE.version}`);

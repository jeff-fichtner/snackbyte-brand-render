/**
 * The check gate. Two things must hold, against the guide version package.json pins:
 *
 *   1. dist/ is what the guide currently produces. It is committed, so a consumer
 *      installing by git tag gets it without building; a stale dist/ would ship values
 *      the guide no longer states.
 *   2. Nothing was decided here. Every value in the output traces to the guide.
 *
 *   npm run check:all
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as fontkit from 'fontkit';

const require = createRequire(import.meta.url);
const GUIDE = require('snackbyte-brand/tokens.json');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(resolve(ROOT, 'dist', p), 'utf8');

const fail = [];
const check = (ok, what) => {
  if (!ok) fail.push(what);
};

// 0. the installed guide is the one package.json pins. npm can keep a cached copy of the git
// dependency (see the README), and then dist/ would match a guide nobody asked for. The guide's
// tokens.json carries the version its tag names.
const pinned = require('../package.json').devDependencies['snackbyte-brand'].split('#')[1];
check(
  pinned === `v${GUIDE.version}`,
  `the installed guide is v${GUIDE.version} but package.json pins ${pinned}: npm reused a stale ` +
    'copy. Remove node_modules/snackbyte-brand and install the pinned tag explicitly (README).',
);

// 1. dist/ is current
execFileSync('node', ['src/build.mjs'], { cwd: ROOT, stdio: 'ignore' });
const dirty = execFileSync('git', ['status', '--porcelain', 'dist'], { cwd: ROOT, encoding: 'utf8' });
check(dirty.trim() === '', `dist/ is stale — rebuild and commit:\n${dirty}`);

// 2. every value traces to the guide
const css = read('tokens.css');
for (const role of Object.keys(GUIDE.color).filter((k) => k !== '_')) {
  check(css.includes(`--${role}: ${GUIDE.color[role].day};`), `tokens.css missing day ${role}`);
  check(css.includes(`--${role}: ${GUIDE.color[role].night};`), `tokens.css missing night ${role}`);
}
for (const [name, px] of Object.entries(GUIDE.space.steps)) {
  check(css.includes(`--${name}: ${px}px;`), `tokens.css missing space ${name}`);
}
check(css.includes(`v${GUIDE.version}`), 'tokens.css does not name the guide version it came from');
check(
  css.includes(`--type-small: ${GUIDE.type.scale.small.px / GUIDE.type.scale.base}rem;`) &&
    css.includes(`--leading-small: ${GUIDE.type.scale.small.lineHeight};`),
  'tokens.css missing the small step',
);

// Every line height comes from the guide: the text face's and the legal face's, each in its rule.
const legal = css.slice(css.indexOf("[data-face='legal']"));
for (const [cut, where] of [
  ['text', css.slice(0, css.indexOf('@media'))],
  ['legal', legal],
]) {
  for (const [k, v] of Object.entries(GUIDE.type[cut].lineHeight))
    check(where.includes(`--leading-${k}: ${v};`), `tokens.css missing ${cut} line height ${k}`);
  for (const [k, v] of Object.entries(GUIDE.type[cut].weights))
    check(where.includes(`--weight-${k}: ${v};`), `tokens.css missing ${cut} weight ${k}`);
}
check(legal.includes('--font-text: var(--font-legal);'), 'a legal document does not swap the text face');

// Each cut's font stack names the guide's family and its fallbacks.
const families = GUIDE.type.families;
for (const cut of Object.keys(GUIDE.type).filter((k) => GUIDE.type[k].family)) {
  const f = families[GUIDE.type[cut].family];
  check(
    css.includes(`: '${f.family}', ${f.fallback.join(', ')};`),
    `tokens.css does not set ${cut} in ${f.family}`,
  );
}

const base = read('base.css');
const stated = new Set(
  Object.values(GUIDE.type).flatMap((c) =>
    typeof c.lineHeight === 'number' ? [c.lineHeight] : Object.values(c.lineHeight ?? {}),
  ),
);
for (const [, v] of base.matchAll(/line-height: ([\d.]+);/g))
  check(stated.has(Number(v)), `base.css sets line height ${v}, which the guide does not state`);
for (const cut of ['title', 'headline', 'wordmark']) {
  const c = GUIDE.type[cut];
  check(
    base.includes(`font-weight: ${c.weight};`) &&
      base.includes(`letter-spacing: ${c.tracking}em;`) &&
      base.includes(`line-height: ${c.lineHeight};`),
    `base.css does not set the ${cut} cut`,
  );
}
check(base.includes(`font-synthesis: ${GUIDE.type.rules.fontSynthesis};`), 'base.css lets the browser fake faces');
check(base.includes(`font-variant-numeric: ${GUIDE.type.rules.columnFigures};`), 'base.css columns are not tabular');

// The fonts: every file the guide names ships, from the commit it pins, subset to Latin, with
// its licence, declared in fonts.css, and nothing in dist/'s CSS reaches a third party.
const fonts = read('fonts.css');
check(fonts.includes(GUIDE.type.source.commit), 'fonts.css does not name the commit its files came from');
// The subset is exactly what fonts.css tells the browser each file covers.
const declared = fonts
  .match(/unicode-range: ([^;]+);/)[1]
  .split(', ')
  .map((u) => u.slice(2).split('-').map((h) => parseInt(h, 16)));
const inLatin = (cp) => declared.some(([a, b = a]) => cp >= a && cp <= b);
for (const [key, f] of Object.entries(families).filter(([k]) => k !== '_')) {
  readFileSync(resolve(ROOT, 'dist/fonts', `${key}-${f.licence}.txt`));
  for (const style of Object.keys(f.files)) {
    const file = `fonts/${key}-${style}.woff2`;
    const bytes = readFileSync(resolve(ROOT, 'dist', file));
    check(bytes.subarray(0, 4).toString('latin1') === 'wOF2', `${file} is not woff2`);
    const font = fontkit.create(bytes);
    const family = font.name.records.preferredFamily?.en ?? font.familyName;
    check(family === f.family, `${file} is ${family}, guide says ${f.family}`);
    check('wght' in font.variationAxes, `${file} lost its weight axis`);
    // U+FFFF is the end marker cmap format 4 requires, not a character.
    check(
      font.characterSet.every((cp) => cp === 0xffff || inLatin(cp)),
      `${file} carries more than its unicode-range`,
    );
    check(
      [...'AZaz09€'].every((c) => font.characterSet.includes(c.codePointAt(0))),
      `${file} lost part of Latin`,
    );
    check(font.hasGlyphForCodePoint(0x30) && font.availableFeatures.includes('tnum'), `${file} lost tabular figures`);
    check(
      fonts.includes(`font-family: '${f.family}';\n  font-style: ${style === 'roman' ? 'normal' : style};`) &&
        fonts.includes(`url('./${file}')`),
      `fonts.css does not declare ${file}`,
    );
  }
}
for (const sheet of ['tokens.css', 'base.css', 'fonts.css'])
  check(!/https?:\/\//.test(read(sheet)), `${sheet} loads something from a third party`);

const marks = JSON.parse(read('marks.json'));
for (const [form, spec] of [
  ['row', GUIDE.forms.row],
  ['stack', GUIDE.forms.stack],
]) {
  check(marks[form]?.shapes?.length === 8, `${form} is not eight cells`);
  const roles = marks[form].shapes.map((s) => s.role);
  const expected = [...Array(4).fill(spec.nibbles[0]), ...Array(4).fill(spec.nibbles[1])];
  check(
    JSON.stringify(roles) === JSON.stringify(expected),
    `${form} nibbles are ${roles.join(',')}, guide says ${expected.join(',')}`,
  );
}

// the bite: exactly one cell per form carries an arc of the guide's radius
for (const form of ['row', 'stack']) {
  const bitten = marks[form].shapes.filter((s) => s.d.includes(`A${GUIDE.geometry.bite.r},`));
  check(bitten.length === 1, `${form} has ${bitten.length} bitten cells, expected 1`);
}

const dts = read('index.d.ts');
check(dts.includes("'day' | 'night'"), 'index.d.ts lost the theme union');

// Every block the guide states ships, in the values and in the declarations. A block the
// renderer forgets to export is a value the guide decided that no consumer can reach.
for (const block of Object.keys(GUIDE).filter((k) => k !== '_' && k !== 'version')) {
  check(read('index.js').includes(`export const ${block} =`), `index.js does not export ${block}`);
  check(dts.includes(`export declare const ${block}:`), `index.d.ts does not declare ${block}`);
}

// Types are generated, not written: every key the guide states must appear in them, or a
// consumer's typecheck rejects a value that is really there.
for (const key of Object.keys(GUIDE.copy).filter((k) => k !== '_')) {
  check(dts.includes(`"${key}"`), `index.d.ts does not declare copy.${key}`);
  check(read('index.js').includes(`"${key}"`), `index.js does not carry copy.${key}`);
}

if (fail.length) {
  console.error('FAILED\n' + fail.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`ok — dist/ matches snackbyte-brand v${GUIDE.version}`);

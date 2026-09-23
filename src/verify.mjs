/**
 * The check gate. Two things must hold:
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

const require = createRequire(import.meta.url);
const GUIDE = require('snackbyte-brand/tokens.json');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(resolve(ROOT, 'dist', p), 'utf8');

const fail = [];
const check = (ok, what) => {
  if (!ok) fail.push(what);
};

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

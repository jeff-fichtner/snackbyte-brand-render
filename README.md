# snackbyte-brand-render

Compresses the [snackbyte brand guide](https://github.com/jeff-fichtner/snackbyte-brand)
into the forms code can consume, and publishes them as `@snackbyte/brand`.

**It holds no values and makes no decisions.** Every colour, number and word comes
from the guide, which is the authority. If a change here needs a judgment call, the
judgment belongs in the guide.

## What it produces

| Output                                   | For                                                          |
| ---------------------------------------- | ------------------------------------------------------------ |
| `tokens.css`                             | The palette, both scales and each cut's font stack as custom properties, day and night; the legal switch. |
| `base.css`                               | The page ground, the text face and its two weights, h1 in Bricolage, the panel's edge, the wordmark's cut, the lockup's proportions. |
| `fonts.css`, `fonts/`                    | Bricolage Grotesque, Inter and Source Serif 4, from the commit the guide pins, subset to Latin, as woff2 with their OFL licences. |
| `index.js`, `index.d.ts`, `marks.json`   | The same values, plus the marks as path data, for JS and TS.    |
| `mark-row-*.svg`, `icon-stack-*.svg`, `tile-*.svg`, `tile.svg` | The marks. `tile.svg` follows the OS theme.  |
| `lockup-above-*.svg`, `lockup-beside-*.svg`, `wordmark-*.svg`  | The lockups, wordmark outlined.              |
| `png/`                                   | The lockups, the row, and the link-preview cards.             |
| `favicon/{day,night}/`                   | `.ico`, Apple touch, 192, 512 and maskable.                    |

`dist/` is committed, so a consumer installing this by git tag needs no build.

## Using it

```bash
npm i github:jeff-fichtner/snackbyte-brand-render#v2.0.0
```

```js
import '@snackbyte/brand/fonts.css';
import '@snackbyte/brand/tokens.css';
import '@snackbyte/brand/base.css';
import { marks, copy, color } from '@snackbyte/brand';
```

The marks carry a role per shape — `ink` or `sky` — rather than a colour, so one SVG
serves both themes when filled from the tokens.

**The faces are served by the page, never fetched from a third party.** `fonts.css` loads
`./fonts/*.woff2` relative to itself: a bundler that resolves CSS `url()`s (Vite does) copies
them; anything else serves `dist/fonts/` beside wherever it serves `fonts.css`.

**Type.** `base.css` sets everything in the text face (`--font-text`, Inter) at
`--weight-regular`, with h2, h3, table headers, `b`, `strong` and buttons at
`--weight-strong`, and h1 in Bricolage's title cut. Give the home page's h1 the class
`headline`. Words drawn with the mark take `.mark-text`. Dense data takes `--type-small`
at `--leading-small`.

**A legal or financial document** sets `data-face="legal"` on `<html>`, or on the element
that holds it: Source Serif 4 then replaces the text face below the title, h2 included.

**A block set apart from the page** takes the class `panel`: the panel colour with its 1px
rule edge.

From 1.x: `--font`, `--font-display-opsz` and `--font-text-opsz` are gone, as the guide's
`type.family`, `type.display` and `type.text.opsz` are. Bricolage below h1 becomes
`--font-text`; a headline's display cut becomes h1 or `.headline`; the wordmark keeps `.wordmark`.

## Working on it

`npm install` fetches the guide as a git dependency, pinned to a tag. `npm run build`
regenerates `dist/`, fetching each font file once from the repository and commit the guide's
`type.source` names into `.cache/fonts/<commit>/`. `npm run check:all` asserts that the installed guide is the version
`package.json` pins, that `dist/` is current, and that every value traces to the guide:

```bash
npm install
npm run build
npm run check:all
```

CI (`.github/workflows/check.yml`) runs the same on every push, tag and pull request, from a
fresh install with no npm cache, and fails if the build changed anything in `dist/`.

### Releasing

A release is a tag on `main`, and `package.json`'s `version` is the tag without its `v`. npm
records that version in every consumer's lockfile, so a mismatch misreports which release a
consumer has. Set it in the commit you tag. CI fails a tag whose `package.json` says otherwise,
so wait for the tag's check to go green before installing it in a consumer. Tags up to `v1.2.0`
predate this rule and carry `1.0.0`.

### Taking a new version of the guide

Set `GUIDE` to the guide tag you are taking (for example `v1.3.1`) and `VERSION` to this
repository's next version, without the `v` (for example `1.3.0`). The block is one chain, so it
stops at the first step that fails, and does nothing if either variable is unset:

```bash
: "${GUIDE:?set GUIDE first}" "${VERSION:?set VERSION first}" &&
npm pkg set devDependencies.snackbyte-brand="github:jeff-fichtner/snackbyte-brand#$GUIDE" &&
npm pkg set version="$VERSION" &&
npm install &&
npm run build &&
npm run check:all &&
git add package.json package-lock.json dist &&
git commit -m "take guide $GUIDE" &&
git tag "v$VERSION" &&
git push origin main "v$VERSION"
```

If `check:all` reports that the installed guide is not the pinned one, npm reused a cached copy
of the git dependency: `rm -rf node_modules/snackbyte-brand` and install the tag explicitly.
For the same reason, never move a published tag: cut a new one.

Then install the new tag in each consumer. The full loop, from deciding a value to
recording where it landed, is in the
[guide's README](https://github.com/jeff-fichtner/snackbyte-brand#changing-a-value).

Nothing here decides anything, so there is never a reason to edit a value in this
repository: `check:all` compares every one of them against the guide and fails.

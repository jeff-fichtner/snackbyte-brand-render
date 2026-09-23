# snackbyte-brand-render

Compresses the [snackbyte brand guide](https://github.com/jeff-fichtner/snackbyte-brand)
into the forms code can consume, and publishes them as `@snackbyte/brand`.

**It holds no values and makes no decisions.** Every colour, number and word comes
from the guide, which is the authority. If a change here needs a judgment call, the
judgment belongs in the guide.

## What it produces

| Output                                   | For                                                          |
| ---------------------------------------- | ------------------------------------------------------------ |
| `tokens.css`                             | The palette and both scales as custom properties, day and night. |
| `base.css`                               | The page ground, the wordmark's cut, the lockup's proportions.  |
| `index.js`, `index.d.ts`, `marks.json`   | The same values, plus the marks as path data, for JS and TS.    |
| `mark-row-*.svg`, `icon-stack-*.svg`, `tile-*.svg`, `tile.svg` | The marks. `tile.svg` follows the OS theme.  |
| `lockup-above-*.svg`, `lockup-beside-*.svg`, `wordmark-*.svg`  | The lockups, wordmark outlined.              |
| `png/`                                   | The lockups, the row, and the link-preview cards.             |
| `favicon/{day,night}/`                   | `.ico`, Apple touch, 192, 512 and maskable.                    |

`dist/` is committed, so a consumer installing this by git tag needs no build.

## Using it

```bash
npm i github:jeff-fichtner/snackbyte-brand-render#v1.0.0
```

```js
import '@snackbyte/brand/tokens.css';
import '@snackbyte/brand/base.css';
import { marks, copy, color } from '@snackbyte/brand';
```

The marks carry a role per shape — `ink` or `sky` — rather than a colour, so one SVG
serves both themes when filled from the tokens.

## Working on it

```bash
npm install        # fetches the guide as a git dependency, pinned to a tag
npm run build      # regenerates dist/
npm run check:all  # asserts dist/ is current and every value traces to the guide
```

To take a new version of the guide: bump the `snackbyte-brand` tag in `package.json`,
install, build, commit `dist/`, tag.

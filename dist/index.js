// Generated from the snackbyte brand guide v2.1.0. Do not edit.
export const version = "2.1.0";
export const color = {
  "_": "Nine roles. Each has a day value and a night value; nothing else changes between themes. Ground and ink swap; the accents lift enough to read. Every text role passes 4.5:1 on its ground and on the panel in both themes.",
  "ground": {
    "day": "#ECEDEA",
    "night": "#2A2724",
    "name": {
      "day": "Alkali",
      "night": "Basalt"
    },
    "use": "Page and surface background; the tile."
  },
  "ink": {
    "day": "#45423E",
    "night": "#ECEDEA",
    "name": {
      "day": "Granite",
      "night": "Alkali"
    },
    "use": "Text; the first nibble."
  },
  "muted": {
    "day": "#6B6762",
    "night": "#A8A49D",
    "name": {
      "day": "Shale",
      "night": "Ash"
    },
    "use": "Secondary text, captions."
  },
  "sky": {
    "day": "#38639A",
    "night": "#7FA7D3",
    "name": {
      "day": "Sky",
      "night": "Sky"
    },
    "use": "Accent; the second nibble. Links, statuses, focus."
  },
  "sage": {
    "day": "#8B9B86",
    "night": "#9DAE98",
    "name": {
      "day": "Sage",
      "night": "Sage"
    },
    "use": "Marks and surfaces only. 2.5:1 on Alkali — never text."
  },
  "sage-text": {
    "day": "#5F6E5A",
    "night": "#9DAE98",
    "name": {
      "day": "Sagebrush",
      "night": "Sage"
    },
    "use": "Sage where it must carry words."
  },
  "bitterbrush": {
    "day": "#D2A93A",
    "night": "#DDB447",
    "name": {
      "day": "Bitterbrush",
      "night": "Bitterbrush"
    },
    "use": "Held in reserve. Never text."
  },
  "rule": {
    "day": "#cfd1cb",
    "night": "#4a4642",
    "name": {
      "day": "Rule",
      "night": "Rule"
    },
    "use": "Hairlines and borders."
  },
  "panel": {
    "day": "#FAFBF8",
    "night": "#36332F",
    "name": {
      "day": "Tuff",
      "night": "Tuff"
    },
    "use": "One colour for a block set apart from the page, such as a card, a callout or an exhibit's frame. Raised, never sunk; always with a 1px rule edge; never nested; never a table's header row."
  }
};
export const geometry = {
  "_": "Both forms of the mark are built from these numbers and nothing else, in one unit. The bite's centre is given in the bitten cell's own coordinates.",
  "cell": 10,
  "radius": 2,
  "gap": 3,
  "seam": 7,
  "bite": {
    "r": 8,
    "cx": 11,
    "cy": -1
  }
};
export const forms = {
  "_": "How the numbers compose. Coordinates are derived from geometry, not stated here.",
  "row": {
    "nibbles": [
      "ink",
      "sky"
    ],
    "direction": "horizontal",
    "bitten": "last"
  },
  "stack": {
    "nibbles": [
      "sky",
      "ink"
    ],
    "direction": "vertical",
    "bitten": "last-of-first-row"
  },
  "tile": {
    "size": 64,
    "radius": 14,
    "holds": "stack",
    "fill": "ground"
  }
};
export const type = {
  "_": "Two faces on any page: Bricolage Grotesque, and one text face. The mark is all Bricolage. On a page, Bricolage takes h1 and nothing else; the text face takes everything below it. Legal and financial paper swaps Inter for Source Serif 4 below its title.",
  "source": {
    "_": "Where every family's files come from: one repository, at one commit.",
    "repo": "google/fonts",
    "commit": "5e8a3ba899557829a76cfdac30fa512bda91d7ca"
  },
  "families": {
    "_": "Each family and where its files come from. Every surface serves the files itself, from type.source; nothing is fetched from a third party. None declares a Reserved Font Name, so a subset keeps its name.",
    "bricolage": {
      "family": "Bricolage Grotesque",
      "fallback": [
        "system-ui",
        "sans-serif"
      ],
      "licence": "OFL",
      "files": {
        "roman": "ofl/bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf"
      }
    },
    "inter": {
      "family": "Inter",
      "fallback": [
        "system-ui",
        "sans-serif"
      ],
      "licence": "OFL",
      "files": {
        "roman": "ofl/inter/Inter[opsz,wght].ttf",
        "italic": "ofl/inter/Inter-Italic[opsz,wght].ttf"
      }
    },
    "sourceSerif": {
      "family": "Source Serif 4",
      "fallback": [
        "Georgia",
        "serif"
      ],
      "licence": "OFL",
      "files": {
        "roman": "ofl/sourceserif4/SourceSerif4[opsz,wght].ttf",
        "italic": "ofl/sourceserif4/SourceSerif4-Italic[opsz,wght].ttf"
      }
    }
  },
  "wordmark": {
    "family": "bricolage",
    "text": "snackbyte",
    "weight": 800,
    "opsz": 96,
    "width": 100,
    "tracking": -0.045,
    "lineHeight": 1
  },
  "markText": {
    "_": "Words drawn with the mark, such as the place line under a lockup.",
    "family": "bricolage",
    "weight": 400,
    "opsz": 14,
    "width": 100,
    "tracking": 0
  },
  "headline": {
    "_": "The home page's headline: the brand's one loud line.",
    "family": "bricolage",
    "weight": 800,
    "opsz": 96,
    "width": 100,
    "tracking": -0.03,
    "lineHeight": 1.06
  },
  "title": {
    "_": "h1 on every other page. Nothing on a page is set in Bricolage smaller than this.",
    "family": "bricolage",
    "weight": 700,
    "opsz": 96,
    "width": 100,
    "tracking": -0.02,
    "lineHeight": 1.05
  },
  "text": {
    "_": "Everything on a page below h1. strong is for h2, h3, labels, table headers, buttons and bold lead-ins. No opsz: optical size follows the set size.",
    "family": "inter",
    "weights": {
      "regular": 400,
      "strong": 600
    },
    "tracking": 0,
    "lineHeight": {
      "body": 1.5,
      "heading": 1.2
    }
  },
  "legal": {
    "_": "Replaces text below the title of a legal or financial document: privacy policy, terms, contracts, invoices, receipts. The test is the kind of document. A document never mixes it with text. No opsz: optical size follows the set size.",
    "family": "sourceSerif",
    "weights": {
      "regular": 400,
      "strong": 600
    },
    "tracking": 0,
    "lineHeight": {
      "body": 1.5,
      "heading": 1.2
    }
  },
  "code": {
    "_": "Code sets in the system's monospace: the one third face a page may carry, because code is not text.",
    "fallback": [
      "ui-monospace",
      "monospace"
    ]
  },
  "rules": {
    "_": "How every surface sets the faces.",
    "fontSynthesis": "none",
    "columnFigures": "tabular-nums",
    "italic": "The text face's own, for emphasis and the titles of works. Bricolage takes none."
  },
  "scale": {
    "_": "Ratio 10/7 — cell to seam — from a 16px base.",
    "base": 16,
    "ratio": 1.4286,
    "steps": [
      16,
      23,
      33,
      47,
      67,
      95
    ],
    "small": {
      "_": "One step below the scale, for dense data: table cells, captions, small labels. Two seams.",
      "px": 14,
      "lineHeight": 1.45
    }
  }
};
export const space = {
  "_": "The seam unit at 4px. Every step is one of the mark's own numbers.",
  "unit": 4,
  "steps": {
    "gap": 12,
    "seam": 28,
    "cell": 40,
    "cell-seam": 68,
    "stack": 108
  }
};
export const motion = {
  "_": "How the mark arrives. The sequence is derived from the name — each letter's code, most significant bit first — so only the timings are stated here.",
  "arrival": {
    "letterMs": 140,
    "holdMs": 160,
    "biteMs": 320,
    "offOpacity": 0.16,
    "biteEasing": "cubic-bezier(.3,1.6,.5,1)"
  }
};
export const copy = {
  "_": "The words the brand ships with. The voice rules that produced them are in GUIDE.md.",
  "name": "snackbyte",
  "headline": "Software that knows where it ends.",
  "headlineLines": [
    "Software that knows",
    "where it ends."
  ],
  "subhead": "snackbyte builds tools for people who need something that does not exist yet. Each one does one job, knows only what it needs, and stops there.",
  "based": "Based in Bishop, California.",
  "place": "Bishop, California."
};
export const theme = {
  "_": "How an implementation selects between day and night.",
  "default": "day",
  "dark": "prefers-color-scheme: dark, unless html[data-theme=\"light\"]; always under html[data-theme=\"dark\"]"
};
export const marks = {
  "row": {
    "viewBox": "0 0 105 10",
    "width": 105,
    "height": 10,
    "shapes": [
      {
        "d": "M2,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M15,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M28,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M41,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M58,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "sky"
      },
      {
        "d": "M71,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "sky"
      },
      {
        "d": "M84,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "sky"
      },
      {
        "d": "M98.063,0 h-1.063 a2,2 0 0 0 -2,2 v6 a2,2 0 0 0 2,2 h6 a2,2 0 0 0 2,-2 v-1.063 A8,8 0 0 1 98.063,0 z",
        "role": "sky"
      }
    ]
  },
  "stack": {
    "viewBox": "0 0 49 27",
    "width": 49,
    "height": 27,
    "shapes": [
      {
        "d": "M2,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "sky"
      },
      {
        "d": "M15,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "sky"
      },
      {
        "d": "M28,0 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "sky"
      },
      {
        "d": "M42.063,0 h-1.063 a2,2 0 0 0 -2,2 v6 a2,2 0 0 0 2,2 h6 a2,2 0 0 0 2,-2 v-1.063 A8,8 0 0 1 42.063,0 z",
        "role": "sky"
      },
      {
        "d": "M2,17 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M15,17 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M28,17 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      },
      {
        "d": "M41,17 h6 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z",
        "role": "ink"
      }
    ]
  }
};

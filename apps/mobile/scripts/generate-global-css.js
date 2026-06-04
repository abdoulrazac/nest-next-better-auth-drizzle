#!/usr/bin/env node
/**
 * generate-global-css.js
 *
 * Reads apps/frontend/src/app/globals.css, extracts CSS custom properties
 * from :root and .dark blocks, converts oklch() values to HSL (space-separated,
 * no wrapper — the format NativeWind / Tailwind v3 expects), then writes
 * apps/mobile/src/global.css.
 */

const fs = require('fs');
const path = require('path');

// culori lives at the monorepo root
const culoriPath = path.resolve(__dirname, '../../../node_modules/culori');
const { converter } = require(culoriPath);
const toHsl = converter('hsl');

const FRONTEND_CSS = path.resolve(__dirname, '../../frontend/src/app/globals.css');
const MOBILE_CSS = path.resolve(__dirname, '../src/global.css');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Round a number to `dec` decimal places, stripping trailing zeros. */
function round(n, dec = 4) {
  return parseFloat(n.toFixed(dec));
}

/**
 * Convert any CSS color string that culori understands (oklch, hsl, hex, …)
 * into the "H S% L%" format used by Tailwind v3 CSS variables.
 * If alpha < 1, appends " / A%" so it still works with Tailwind's opacity
 * modifier syntax.
 * Returns null when culori cannot parse the value (pass-through).
 */
function toNativeWindHsl(value) {
  let hsl;
  try {
    hsl = toHsl(value.trim());
  } catch (_) {
    return null;
  }
  if (!hsl) return null;

  const h = round(hsl.h ?? 0, 1);
  const s = round((hsl.s ?? 0) * 100, 1);
  const l = round((hsl.l ?? 0) * 100, 1);

  if (hsl.alpha !== undefined && Math.abs(hsl.alpha - 1) > 0.0001) {
    const a = round(hsl.alpha * 100, 1);
    return `${h} ${s}% ${l}% / ${a}%`;
  }

  return `${h} ${s}% ${l}%`;
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/**
 * Extract custom properties (--foo: value) from a CSS block string.
 * Returns a Map<name, rawValue>.
 */
function extractVars(block) {
  const vars = new Map();
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    vars.set(m[1].trim(), m[2].trim());
  }
  return vars;
}

/**
 * Find the first occurrence of `selector {` (with optional whitespace before
 * the brace) in `css`, handling nested braces.
 * Returns the inner content (without the outer braces).
 */
function extractBlock(css, selector) {
  // Match `selector` followed by optional whitespace and `{`
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{');
  const match = re.exec(css);
  if (!match) return '';
  const idx = match.index;

  let depth = 0;
  let start = -1;
  for (let i = idx; i < css.length; i++) {
    if (css[i] === '{') {
      depth++;
      if (depth === 1) start = i + 1;
    } else if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(start, i);
    }
  }
  return '';
}

// ─── Format output ───────────────────────────────────────────────────────────

function formatBlock(vars) {
  const lines = [];
  for (const [name, raw] of vars) {
    const converted = toNativeWindHsl(raw);
    lines.push(`    ${name}: ${converted ?? raw};`);
  }
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

const src = fs.readFileSync(FRONTEND_CSS, 'utf8');

const rootVars = extractVars(extractBlock(src, ':root'));
const darkVars = extractVars(extractBlock(src, '.dark'));

const output = `\
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${formatBlock(rootVars)}
  }

  .dark {
${formatBlock(darkVars)}
  }
}
`;

fs.writeFileSync(MOBILE_CSS, output, 'utf8');
console.log(
  `✓ global.css generated from frontend globals.css (${rootVars.size} :root vars, ${darkVars.size} .dark vars)`
);

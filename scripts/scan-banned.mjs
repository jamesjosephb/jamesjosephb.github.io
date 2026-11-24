#!/usr/bin/env node
// Fails the build if a banned term appears in any page, component, content or public text file.
//
// The term list is private and is NOT committed. It is read from:
//   1. .banned-terms.local (gitignored), one term per line, and/or
//   2. the BANNED_TERMS environment variable (GitHub Actions secret), newline- or comma-separated.
//
// Line syntax:
//   term          case-insensitive, whole word
//   cs:Term       case-sensitive, whole word
//   re:pattern    JavaScript regular expression (case-insensitive)
//   # comment     ignored
//
// Built-in generic checks (safe to publish): US phone numbers and ticket-key-shaped strings.
//
// Usage: node scripts/scan-banned.mjs [--strict] [paths...]
//   --strict  fail when no private term list is configured (use in CI once the secret exists).

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const targets = args.filter((a) => !a.startsWith('--'));
const scanRoots = targets.length ? targets : ['src', 'public', 'resume-src', 'README.md'];

const TEXT_EXT = new Set([
  '.astro', '.md', '.mdx', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.css',
  '.html', '.svg', '.txt', '.xml', '.yml', '.yaml', '',
]);
const SKIP_DIRS = new Set(['node_modules', '.git', '.astro', 'dist']);

function readTerms() {
  const lines = [];
  const file = join(root, '.banned-terms.local');
  if (existsSync(file)) lines.push(...readFileSync(file, 'utf8').split(/\r?\n/));
  if (process.env.BANNED_TERMS) lines.push(...process.env.BANNED_TERMS.split(/\r?\n|,/));
  return lines.map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Word boundary that also works for terms with symbols, e.g. "R&D".
const word = (s) => `(?<![\\p{L}\\p{N}])${esc(s)}(?![\\p{L}\\p{N}])`;

function compile(term) {
  if (term.startsWith('re:')) return { label: '(private pattern)', re: new RegExp(term.slice(3), 'giu') };
  if (term.startsWith('cs:')) return { label: '(private term)', re: new RegExp(word(term.slice(3)), 'gu') };
  return { label: '(private term)', re: new RegExp(word(term), 'giu') };
}

const privateTerms = readTerms();
const rules = [
  ...privateTerms.map(compile),
  { label: 'phone number', re: /(?<![\d.])(?:\+?1[-. ]?)?\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}(?!\d)/g },
  // Ticket keys like ABC-1234. Common technical tokens are allowed below.
  { label: 'ticket key', re: /\b[A-Z][A-Z0-9]{1,9}-\d{2,6}\b/g, allow: /^(UTF|ISO|SHA|AES|RFC|CVE|OWASP|WCAG|ES|TLS|IPV|H|VP|A|AA|AAA)-/ },
  // Public copy describes the employer's platform only as "several types of money movement": no named transaction
  // types. ("check" stays allowed: it is a common verb on this site.)
  { label: 'named money-movement type', re: /\bwires\b|\bwire transfers?\b|\bjournals?\b|\bposition transfers?\b|\bcash transfers?\b|\blot-level\b|\bstanding authori[sz]ations?\b/giu },
];

function* walk(path) {
  if (!existsSync(path)) return;
  const st = statSync(path);
  if (st.isFile()) {
    if (TEXT_EXT.has(extname(path).toLowerCase())) yield path;
    return;
  }
  for (const name of readdirSync(path)) {
    if (SKIP_DIRS.has(name)) continue;
    yield* walk(join(path, name));
  }
}

const hits = [];
let files = 0;
for (const r of scanRoots) {
  for (const file of walk(join(root, r))) {
    files++;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const rule of rules) {
        rule.re.lastIndex = 0;
        for (const m of line.matchAll(rule.re)) {
          if (rule.allow && rule.allow.test(m[0])) continue;
          // Never echo private terms into CI logs; show the location and rule only.
          hits.push(`${relative(root, file)}:${i + 1}  ${rule.label}${rule.label.startsWith('(') ? '' : `: ${m[0]}`}`);
        }
      }
    });
  }
}

if (!privateTerms.length) {
  const msg = 'scan-banned: no private term list (.banned-terms.local or BANNED_TERMS); only generic checks ran.';
  if (strict) {
    console.error(`✖ ${msg}`);
    process.exit(1);
  }
  console.warn(`⚠ ${msg}`);
}

if (hits.length) {
  console.error(`✖ scan-banned: ${hits.length} match(es) in ${files} files:\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ scan-banned: ${files} files clean (${privateTerms.length} private terms + generic checks).`);

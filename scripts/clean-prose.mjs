#!/usr/bin/env node
/**
 * Strip em dashes and a small set of AI-cliché phrases from prose / data files.
 * Conservative on purpose: it only rewrites dash punctuation and a fixed phrase
 * list, and tidies commas the dash pass may double up. It never collapses
 * indentation and never touches "., ..." sequences, so it is safe on JSON and
 * on source that contains spread operators. En dashes are left alone so numeric
 * ranges like 60-70% survive.
 * Usage: node clean-prose.mjs <file> [<file> ...]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PHRASES = [
  ['The loaf that launched a thousand home bakeries. ', ''],
  ['that launched a thousand home bakeries', 'that started countless home kitchens'],
  ['a whisper of ', 'a little '],
  ['whisper of ', 'a little '],
  ['The long ferment, not the toppings, is the real craft.', 'The long ferment matters more than the toppings.'],
  ['the real craft', 'the craft'],
  ['unmistakably itself', 'distinctive'],
  ['a testament to ', 'a sign of '],
  ['Unassumingly ', 'Quietly '],
  ['unassumingly ', 'quietly '],
  [' boasts ', ' has '],
  [' boasting ', ' with '],
  ['At its heart, ', ''],
  ['at its heart', 'at its core'],
];

function cleanText(s) {
  for (const [a, b] of PHRASES) s = s.split(a).join(b);
  // em dash (U+2014) / horizontal bar (U+2015), spaced or not -> comma
  s = s.replace(/\s*[—―]\s*/g, ', ');
  // tidy only the doubling the dash pass can create; nothing structural
  s = s.replace(/,\s*,/g, ',');
  s = s.replace(/,[ \t]{2,}/g, ', ');
  s = s.replace(/:\s*,\s*/g, ': ');
  s = s.replace(/;\s*,\s*/g, '; ');
  s = s.replace(/\(\s*,\s*/g, '(');
  return s;
}

let changed = 0;
for (const f of process.argv.slice(2)) {
  const before = readFileSync(f, 'utf8');
  const after = cleanText(before);
  if (after !== before) {
    writeFileSync(f, after);
    changed++;
  }
}
console.log(`clean-prose: ${changed} files changed`);

import fs from 'node:fs';
import path from 'node:path';

const visibleFiles = ['src/index.html', 'src/app.js', 'src/scenarios.js'];
const forbidden = [
  'localStorage',
  'sessionStorage',
  'backend',
  'database',
  'schema',
  'payload',
  'reducer',
  'enum',
  'fixture',
  'NaN',
  'persistence disabled',
  'calculation object',
  'hard fail'
];
let failed = false;
for (const file of visibleFiles) {
  const text = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  for (const word of forbidden) {
    if (text.includes(word)) {
      console.error(`Forbidden user-facing/internal language found in ${file}: ${word}`);
      failed = true;
    }
  }
}
const appText = visibleFiles.map((file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8')).join('\n');
const required = [
  'Founder Dilution Dashboard by West Peek',
  'West Peek logo',
  'Educational scenario simulator only.',
  'Your saved scenarios are temporary.',
  'Founder Walks Away With $0',
  'Payment order',
  'Investor gets paid twice',
  'Who gets paid first'
];
for (const phrase of required) {
  if (!appText.includes(phrase)) {
    console.error(`Required founder-facing phrase missing: ${phrase}`);
    failed = true;
  }
}
const logoPath = path.join(process.cwd(), 'public/brand/wp-logo.png');
if (!fs.existsSync(logoPath)) {
  console.error('Required West Peek logo asset missing: public/brand/wp-logo.png');
  failed = true;
}
if (failed) process.exit(1);
console.log('UI copy validation passed.');

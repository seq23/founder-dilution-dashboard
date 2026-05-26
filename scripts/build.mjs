import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'src');
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(source, target);
    else fs.copyFileSync(source, target);
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const name of fs.readdirSync(src)) {
  const source = path.join(src, name);
  const target = path.join(dist, name);
  const stat = fs.statSync(source);
  if (stat.isDirectory()) copyDir(source, target);
  else fs.copyFileSync(source, target);
}
copyDir(publicDir, dist);
console.log('Build complete: dist/');

import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync('react-app/src/index.css', 'utf-8');
const definedClasses = new Set();
const classRegex = /\.([a-zA-Z0-9_\-]+)/g;
let m;
while ((m = classRegex.exec(css)) !== null) {
  definedClasses.add(m[1]);
}

// Add embedded styles from Header.tsx
definedClasses.add('desktop-nav');
definedClasses.add('mobile-nav-toggle');

function getFiles(dir) {
  let res = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory() && f.name !== 'node_modules' && f.name !== 'dist') {
      res = res.concat(getFiles(p));
    } else if (f.name.endsWith('.tsx')) {
      res.push(p);
    }
  }
  return res;
}

const files = getFiles('react-app/src');
const missing = new Map();

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.matchAll(/className=(?:["']([^"']+)["']|\{`([^`]+)`\})/g);
  for (const match of matches) {
    const raw = match[1] || match[2] || '';
    const parts = raw.split(/\s+/).filter(Boolean);
    for (const p of parts) {
      if (!p.includes('$') && !p.includes('{') && !p.includes('}') && !definedClasses.has(p)) {
        if (!missing.has(p)) missing.set(p, []);
        missing.get(p).push(path.relative('react-app', file));
      }
    }
  }
}

console.log('--- Undefined classes in JSX ---');
if (missing.size === 0) {
  console.log('None! All classes match defined CSS.');
} else {
  for (const [cls, list] of missing.entries()) {
    console.log(` - "${cls}" in ${[...new Set(list)].join(', ')}`);
  }
}

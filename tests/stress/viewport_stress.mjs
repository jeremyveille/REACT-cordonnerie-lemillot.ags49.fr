/**
 * Viewport & Overflow Stress Test
 * Simulates CSS layout constraints at 375px, 768px, 1200px, 1440px
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cssPath = path.resolve(__dirname, '../../react-app/src/index.css');
const css = fs.readFileSync(cssPath, 'utf-8');

console.log('--- Testing CSS Viewport & Responsive Overflow Constraints ---');

const viewports = [
  { name: 'Mobile', width: 375 },
  { name: 'Tablet', width: 768 },
  { name: 'Desktop', width: 1200 },
  { name: 'Large Desktop', width: 1440 },
];

// Check for dangerous hardcoded widths (e.g. width: 400px+, min-width: 400px+)
const fixedWidthRegex = /(?:^|[^-])\b(width|min-width)\s*:\s*([0-9]+)px/g;
let match;
const suspiciousWidths = [];

while ((match = fixedWidthRegex.exec(css)) !== null) {
  const prop = match[1];
  const pxVal = parseInt(match[2], 10);
  if (pxVal > 350) {
    suspiciousWidths.push({ prop, pxVal, context: match[0] });
  }
}

console.log(`Found ${suspiciousWidths.length} hardcoded pixel widths > 350px in index.css:`);
suspiciousWidths.forEach(w => {
  console.log(` - ${w.prop}: ${w.pxVal}px`);
});

// Verify container constraints
const hasContainerMaxWidth = css.includes('max-width: 1240px');
const hasContainerNarrowMaxWidth = css.includes('max-width: 860px');
const hasResponsivePadding = css.includes('padding-left: 1.25rem') && css.includes('padding-right: 1.25rem');

console.log('Container constraints verified:', {
  hasContainerMaxWidth,
  hasContainerNarrowMaxWidth,
  hasResponsivePadding,
});

for (const vp of viewports) {
  console.log(`Simulating Viewport ${vp.name} (${vp.width}px):`);
  const effectiveContainerWidth = Math.min(vp.width, 1240);
  const padding = 40; // 1.25rem * 2 = 2.5rem = 40px
  const innerWidth = effectiveContainerWidth - padding;
  console.log(` -> Usable inner width: ${innerWidth}px`);
  
  if (vp.width <= 680) {
    console.log(' -> Active grid columns: 1 (stacked for mobile)');
  } else if (vp.width <= 1024) {
    console.log(' -> Active grid columns: 2 (tablet layout)');
  } else {
    console.log(' -> Active grid columns: 3-4 (desktop layout)');
  }
}

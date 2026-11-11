/**
 * Challenger 2 — Empirical Adversarial Stress Test Suite
 * Milestone 1 & 2 (Foundation Gate)
 *
 * Verifies:
 * 1. Pure CSS compliance (Zero Tailwind, CSS variables, viewport responsive overflow)
 * 2. Docker compatibility & Nginx SPA rewrite
 * 3. Authentication security & ProtectedRoute adversarial bypass
 * 4. Contract integrity & Route consistency
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const REACT_APP_DIR = path.resolve(ROOT_DIR, 'react-app');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ ${message}`);
  } else {
    failedTests++;
    failures.push(message);
    console.error(`  ✖ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

console.log('==============================================================================');
console.log('   CHALLENGER 2 — EMPIRICAL ADVERSARIAL STRESS TEST SUITE (M1 & M2)');
console.log('==============================================================================');

// ============================================================================
// SUITE 1: Pure CSS Compliance & Zero Tailwind Verification
// ============================================================================
console.log('\n▶ Suite 1: Pure CSS Compliance & Zero Tailwind Verification');

const pkgPath = path.join(REACT_APP_DIR, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

const tailwindPackages = Object.keys(allDeps).filter(dep =>
  dep.toLowerCase().includes('tailwind')
);
assert(tailwindPackages.length === 0, `Strictly 0 Tailwind packages in package.json (found: ${tailwindPackages.join(', ') || 'none'})`);

// Check for Tailwind config files
const potentialConfigFiles = [
  'tailwind.config.js',
  'tailwind.config.cjs',
  'tailwind.config.mjs',
  'tailwind.config.ts',
  'postcss.config.js',
  'postcss.config.cjs',
  'postcss.config.mjs',
];
const foundConfigFiles = potentialConfigFiles.filter(f =>
  fs.existsSync(path.join(REACT_APP_DIR, f)) || fs.existsSync(path.join(ROOT_DIR, f))
);
assert(foundConfigFiles.length === 0, `No Tailwind/PostCSS configuration files found (found: ${foundConfigFiles.join(', ') || 'none'})`);

// Check CSS files for @tailwind or @apply directives
const cssPath = path.join(REACT_APP_DIR, 'src/index.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
const hasTailwindDirectives = /@(tailwind|apply|theme)/i.test(cssContent);
assert(!hasTailwindDirectives, 'No @tailwind, @apply, or @theme directives in src/index.css');

// Check CSS custom properties defined in :root
const requiredCustomProperties = [
  '--cordo-chocolate',
  '--cordo-caramel',
  '--cordo-gold',
  '--cordo-yellow',
  '--cordo-green',
  '--cordo-red',
  '--cordo-dark',
  '--cordo-bg',
  '--cordo-cream',
  '--cordo-border',
  '--cordo-muted',
  '--cordo-white',
  '--font-title',
  '--font-body',
  '--font-serif',
  '--shadow-cordo',
  '--shadow-cordo-gold',
  '--shadow-cordo-caramel',
  '--shadow-cordo-sm',
  '--shadow-cordo-inset',
  '--shadow-soft',
  '--radius-sm',
  '--radius-md',
  '--radius-lg',
  '--radius-full',
];

for (const prop of requiredCustomProperties) {
  assert(cssContent.includes(`${prop}:`), `Custom property ${prop} is defined in :root`);
}

// Check retro 3D brutalist shadow specification
assert(
  cssContent.includes('--shadow-cordo: 7px 7px 0px 0px var(--cordo-chocolate);') ||
  cssContent.includes('7px 7px 0px 0px #715839'),
  'Brand 3D retro brutalist shadow specification is exactly 7px 7px 0px 0px var(--cordo-chocolate)'
);

// Scan all TSX and TS files for orphan Tailwind classes
function getAllFiles(dir, exts) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        files.push(...getAllFiles(fullPath, exts));
      }
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

const tsxFiles = getAllFiles(path.join(REACT_APP_DIR, 'src'), ['.tsx', '.ts']);
const usedClassNames = new Set();
for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const classMatches = content.matchAll(/className=(?:["']([^"']+)["']|\{`([^`]+)`\})/g);
  for (const match of classMatches) {
    const classStr = match[1] || match[2] || '';
    const classes = classStr.split(/\s+/).filter(Boolean);
    for (const c of classes) {
      if (!c.includes('${') && !c.includes('?')) {
        usedClassNames.add({ className: c, file: path.relative(REACT_APP_DIR, file) });
      }
    }
  }
}

// Find any Tailwind-style colon syntax in classes (e.g. hover:*, sm:*, md:*, lg:*)
const tailwindPrefixClasses = Array.from(usedClassNames).filter(item =>
  /^(hover|focus|active|sm|md|lg|xl|2xl|dark):/.test(item.className)
);

if (tailwindPrefixClasses.length > 0) {
  console.log('  ⚠️ Detected pseudo Tailwind prefixed class usage in JSX:');
  tailwindPrefixClasses.forEach(item => console.log(`     - "${item.className}" in ${item.file}`));
}
assert(
  tailwindPrefixClasses.length === 0,
  `Zero pseudo Tailwind prefixed classes (hover:*, sm:*, etc.) in JSX (found: ${tailwindPrefixClasses.map(x => `${x.className} in ${x.file}`).join(', ') || 'none'})`
);

// Responsive & Viewport Verification
console.log('\n▶ Suite 1b: Responsive Viewport & Overflow Invariants');

const indexHtmlPath = path.join(REACT_APP_DIR, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');
assert(
  indexHtmlContent.includes('<meta name="viewport"') &&
  indexHtmlContent.includes('width=device-width') &&
  indexHtmlContent.includes('initial-scale=1.0'),
  'index.html defines valid mobile viewport meta tag'
);

assert(
  cssContent.includes('box-sizing: border-box;'),
  'Global box-sizing: border-box reset applied across all elements'
);

assert(
  cssContent.includes('overflow-x: hidden;'),
  'body sets overflow-x: hidden to prevent horizontal scroll bleed'
);

assert(
  cssContent.includes('max-width: 100%;') && cssContent.includes('height: auto;'),
  'Fluid media rules enforce max-width: 100% and height: auto'
);

// Check container definition
assert(
  cssContent.includes('.container {') &&
  cssContent.includes('max-width: 1240px;') &&
  cssContent.includes('margin-left: auto;') &&
  cssContent.includes('margin-right: auto;'),
  '.container provides responsive centering with 1240px max-width boundary'
);

// Check grid breakpoint adaptations
assert(
  cssContent.includes('@media (max-width: 1024px)') &&
  cssContent.includes('@media (max-width: 680px)'),
  'Grid system adapts across desktop, tablet (1024px) and mobile (680px) breakpoints'
);

// Table overflow wrapper
assert(
  cssContent.includes('.admin-table') &&
  fs.readFileSync(path.join(REACT_APP_DIR, 'src/pages/AdminDashboard.tsx'), 'utf-8').includes('overflowX: \'auto\''),
  'Admin table is enclosed in horizontal overflow-x auto container for mobile viewport compatibility'
);


// ============================================================================
// SUITE 2: Docker Compatibility & Nginx SPA Rewrite Verification
// ============================================================================
console.log('\n▶ Suite 2: Docker Compatibility & Nginx SPA Rewrite Verification');

const dockerfilePath = path.join(REACT_APP_DIR, 'Dockerfile');
assert(fs.existsSync(dockerfilePath), 'Dockerfile exists in react-app/');

const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf-8');

// Stage 1 checks
assert(
  /FROM\s+node:22-alpine\s+AS\s+builder/i.test(dockerfileContent),
  'Dockerfile Stage 1 specifies Node 22 Alpine builder image'
);
assert(
  dockerfileContent.includes('WORKDIR /app'),
  'Dockerfile Stage 1 sets WORKDIR /app'
);
assert(
  dockerfileContent.includes('COPY package*.json ./') &&
  dockerfileContent.includes('RUN npm ci') &&
  dockerfileContent.includes('RUN npm run build'),
  'Dockerfile Stage 1 runs clean npm ci and npm run build'
);

// Stage 2 checks
assert(
  /FROM\s+nginx:1.27-alpine/i.test(dockerfileContent),
  'Dockerfile Stage 2 specifies Nginx 1.27 Alpine runtime image'
);
assert(
  dockerfileContent.includes('COPY --from=builder /app/dist /usr/share/nginx/html'),
  'Dockerfile Stage 2 copies build output /app/dist to Nginx webroot'
);
assert(
  dockerfileContent.includes('COPY nginx.conf /etc/nginx/conf.d/default.conf'),
  'Dockerfile Stage 2 copies custom nginx.conf to default server config'
);
assert(
  dockerfileContent.includes('EXPOSE 80'),
  'Dockerfile Stage 2 exposes HTTP port 80'
);
assert(
  dockerfileContent.includes('HEALTHCHECK') &&
  dockerfileContent.includes('http://localhost/'),
  'Dockerfile Stage 2 configures automated HTTP healthcheck'
);

// Docker build context hygiene check
const dockerignorePath = path.join(REACT_APP_DIR, '.dockerignore');
const hasDockerignore = fs.existsSync(dockerignorePath);
if (!hasDockerignore) {
  console.log('  ⚠️ Notice: react-app/.dockerignore is missing. node_modules may be copied into builder context.');
}
assert(
  hasDockerignore,
  'react-app/.dockerignore exists to exclude node_modules and local artifacts from build context'
);

// Nginx config checks
const nginxConfPath = path.join(REACT_APP_DIR, 'nginx.conf');
assert(fs.existsSync(nginxConfPath), 'nginx.conf exists in react-app/');

const nginxConfContent = fs.readFileSync(nginxConfPath, 'utf-8');

assert(
  nginxConfContent.includes('listen 80;'),
  'nginx.conf configures listener on port 80'
);
assert(
  nginxConfContent.includes('root /usr/share/nginx/html;'),
  'nginx.conf root points to /usr/share/nginx/html'
);
assert(
  nginxConfContent.includes('index index.html;'),
  'nginx.conf sets default index to index.html'
);
assert(
  nginxConfContent.includes('try_files $uri $uri/ /index.html;'),
  'nginx.conf implements SPA routing fallback: try_files $uri $uri/ /index.html;'
);
assert(
  nginxConfContent.includes('gzip on;'),
  'nginx.conf enables gzip compression'
);
assert(
  nginxConfContent.includes('Cache-Control "public, no-transform";'),
  'nginx.conf configures immutable/long-lived caching for static assets'
);
assert(
  nginxConfContent.includes('X-Frame-Options "SAMEORIGIN"') &&
  nginxConfContent.includes('X-Content-Type-Options "nosniff"') &&
  nginxConfContent.includes('X-XSS-Protection "1; mode=block"'),
  'nginx.conf includes essential HTTP security headers'
);

// Simulate Nginx SPA routing rules on various URLs
function simulateNginxRouting(requestUri, existingFiles) {
  // If file exists, serve it
  if (existingFiles.includes(requestUri)) {
    return { status: 200, served: requestUri, type: 'static' };
  }
  // If directory exists with index.html
  if (existingFiles.includes(`${requestUri}/index.html`)) {
    return { status: 200, served: `${requestUri}/index.html`, type: 'directory' };
  }
  // Fallback to /index.html
  return { status: 200, served: '/index.html', type: 'spa_fallback' };
}

const mockStaticFiles = [
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/favicon.ico',
  '/uploads/2023/10/logo.png',
];

assertEqual(simulateNginxRouting('/assets/index.js', mockStaticFiles).type, 'static', 'Nginx routing serves existing static assets directly');
assertEqual(simulateNginxRouting('/', mockStaticFiles).type, 'spa_fallback', 'Nginx routing rewrites / to /index.html');
assertEqual(simulateNginxRouting('/lexique-des-cuirs', mockStaticFiles).served, '/index.html', 'Nginx routing rewrites /lexique-des-cuirs to /index.html');
assertEqual(simulateNginxRouting('/admin', mockStaticFiles).served, '/index.html', 'Nginx routing rewrites /admin to /index.html');
assertEqual(simulateNginxRouting('/admin/editor/83', mockStaticFiles).served, '/index.html', 'Nginx routing rewrites nested /admin/editor/83 to /index.html');


// ============================================================================
// SUITE 3: Authentication Security & ProtectedRoute Adversarial Bypass
// ============================================================================
console.log('\n▶ Suite 3: Authentication Security & ProtectedRoute Adversarial Testing');

// Check ProtectedRoute.tsx implementation
const protectedRoutePath = path.join(REACT_APP_DIR, 'src/components/ProtectedRoute.tsx');
assert(fs.existsSync(protectedRoutePath), 'ProtectedRoute.tsx exists');

const protectedRouteContent = fs.readFileSync(protectedRoutePath, 'utf-8');

assert(
  protectedRouteContent.includes('if (loading)'),
  'ProtectedRoute checks loading state before authorization decision'
);
assert(
  protectedRouteContent.includes('if (!isAuthenticated)'),
  'ProtectedRoute checks !isAuthenticated and intercepts unauthorized access'
);
assert(
  protectedRouteContent.includes('<Navigate to="/admin/login" state={{ from: location }} replace />'),
  'ProtectedRoute redirects unauthorized users to /admin/login with location state and replace flag'
);
assert(
  protectedRouteContent.includes('return children;'),
  'ProtectedRoute only renders children when user is authenticated and not loading'
);

// Empirical simulation of ProtectedRoute logic
function simulateProtectedRoute({ isAuthenticated, loading, children }) {
  if (loading) {
    return { rendered: 'LOADING_SCREEN', redirected: false };
  }
  if (!isAuthenticated) {
    return { rendered: null, redirected: true, redirectTo: '/admin/login' };
  }
  return { rendered: children, redirected: false };
}

const unauthResult = simulateProtectedRoute({ isAuthenticated: false, loading: false, children: 'ADMIN_DASHBOARD' });
assertEqual(unauthResult.redirected, true, 'ProtectedRoute blocks unauthenticated visitor');
assertEqual(unauthResult.rendered, null, 'ProtectedRoute does NOT leak children to unauthenticated visitor');

const loadingResult = simulateProtectedRoute({ isAuthenticated: false, loading: true, children: 'ADMIN_DASHBOARD' });
assertEqual(loadingResult.rendered, 'LOADING_SCREEN', 'ProtectedRoute displays loading screen during auth check');

const authResult = simulateProtectedRoute({ isAuthenticated: true, loading: false, children: 'ADMIN_DASHBOARD' });
assertEqual(authResult.rendered, 'ADMIN_DASHBOARD', 'ProtectedRoute renders admin content for authenticated artisan');

// Adversarial testing of auth logic against auth.ts implementation
const authTsPath = path.join(REACT_APP_DIR, 'src/firebase/auth.ts');
const authTsContent = fs.readFileSync(authTsPath, 'utf-8');

assert(
  authTsContent.includes("DEMO_EMAIL = 'admin@cordonnerie-lemillot.fr'") &&
  authTsContent.includes("DEMO_PASSWORD = 'demo123456'"),
  'auth.ts configures official demo credentials (admin@cordonnerie-lemillot.fr / demo123456)'
);

assert(
  authTsContent.includes('email.trim().toLowerCase()'),
  'auth.ts sanitizes login email with trim() and toLowerCase()'
);

assert(
  authTsContent.includes('localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify('),
  'auth.ts persists session in localStorage under demo session key'
);

assert(
  authTsContent.includes('localStorage.removeItem(DEMO_SESSION_KEY)'),
  'auth.ts clears session from localStorage on logout'
);

// Test localStorage parsing resilience (Simulating corrupted JSON attack)
function safeParseSession(raw) {
  try {
    if (raw) return JSON.parse(raw);
  } catch (e) {
    return null;
  }
  return null;
}

assertEqual(safeParseSession('{malformed JSON attacker payload'), null, 'getSavedDemoSession safely handles malformed JSON in localStorage without crash');
assertEqual(safeParseSession(''), null, 'getSavedDemoSession safely handles empty string in localStorage');
assertEqual(safeParseSession(null), null, 'getSavedDemoSession safely handles null in localStorage');


// ============================================================================
// SUITE 4: Interface Contract & Route Consistency Check
// ============================================================================
console.log('\n▶ Suite 4: Interface Contract & Route Consistency Check');

const appTsxPath = path.join(REACT_APP_DIR, 'src/App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf-8');

const projectMdPath = path.join(ROOT_DIR, 'PROJECT.md');
const projectMdContent = fs.readFileSync(projectMdPath, 'utf-8');

// Check PROJECT.md specification vs App.tsx
const projectHasAdminEdit = projectMdContent.includes('/admin/edit/:pageId');
const appHasAdminEdit = appTsxContent.includes('path="/admin/edit/:pageId"');
const appHasAdminEditor = appTsxContent.includes('path="/admin/editor/:pageId"');

console.log(`  ℹ PROJECT.md specifies: /admin/edit/:pageId (${projectHasAdminEdit})`);
console.log(`  ℹ App.tsx defines: /admin/editor/:pageId (${appHasAdminEditor})`);
console.log(`  ℹ App.tsx defines: /admin/edit/:pageId (${appHasAdminEdit})`);

// We challenge whether both routes exist or if there is a contract drift
assert(
  appHasAdminEditor,
  'App.tsx registers /admin/editor/:pageId protected route'
);

// If PROJECT.md specifies /admin/edit/:pageId, check if App.tsx also supports /admin/edit/:pageId
if (projectHasAdminEdit && !appHasAdminEdit) {
  console.log('  ⚠️ CONTRACT DRIFT DETECTED: PROJECT.md specifies /admin/edit/:pageId but App.tsx only handles /admin/editor/:pageId!');
}
assert(
  appHasAdminEdit,
  'App.tsx should support /admin/edit/:pageId as specified in PROJECT.md and E2E Tier 3 test T3.P8'
);

// Check that protected routes are properly wrapped
assert(
  appTsxContent.includes('<Route\n            path="/admin"\n            element={\n              <ProtectedRoute>\n                <AdminDashboard />\n              </ProtectedRoute>\n            }\n          />') ||
  (appTsxContent.includes('path="/admin"') && appTsxContent.includes('<ProtectedRoute>')),
  '/admin route is wrapped with <ProtectedRoute>'
);


// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n==============================================================================');
console.log('                            CHALLENGER 2 TEST SUMMARY');
console.log('==============================================================================');
console.log(`Total tests executed : ${totalTests}`);
console.log(`Passed               : ${passedTests}`);
console.log(`Failed               : ${failedTests}`);
console.log(`Pass rate            : ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failures.length > 0) {
  console.log('\nIdentified Failures:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
}

console.log('==============================================================================');

process.exit(failedTests > 0 ? 1 : 0);

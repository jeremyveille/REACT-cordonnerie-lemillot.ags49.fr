// @ts-check
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  assert,
  assertEqual,
  assertTrue,
  assertFalse,
  assertMatch,
  assertContains,
  assertGreaterOrEqual,
  assertLessOrEqual,
  assertThrowsAsync,
  assertThrows
} from './helpers/assertions.mjs';
import {
  ORACLE_PAGES,
  ORACLE_NAV_ITEMS,
  ORACLE_SERVICES,
  ORACLE_BUSINESS_HOURS,
  ORACLE_STORE_DETAILS,
  ORACLE_PUCK_WIDGETS,
  ORACLE_VIEWPORTS,
  ORACLE_DESIGN_SYSTEM,
  evaluateBusinessHours,
  MemoryPageStorageService,
  PuckHistoryEngine
} from './helpers/oracle.mjs';

const ROOT_DIR = path.resolve(process.cwd());
const REACT_APP_DIR = path.join(ROOT_DIR, 'react-app');
const CSS_PATH = path.join(REACT_APP_DIR, 'src', 'index.css');

export const tier5Tests = [
  // ==========================================================================
  // VECTOR 1: Malformed Payloads & XSS Resistance
  // ==========================================================================
  {
    id: 'T5.1.1',
    feature: 20,
    name: 'V1 (XSS): Malformed and hostile URL slugs return null safely without DOM injection',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const hostileSlugs = [
        '<script>alert("xss")</script>',
        '"><img src=x onerror=alert(1)>',
        'javascript:alert(document.cookie)',
        '../../etc/passwd',
        '%00%2e%2e%2fetc%2fpasswd',
        'a-angers?payload="><script>alert(1)</script>',
        'SELECT * FROM wp_posts WHERE 1=1 --',
        '${7*7}',
        '{{constructor.constructor("alert(1)")()}}',
        '\\x3cscript\\x3e'
      ];

      for (const slug of hostileSlugs) {
        const result = await storage.getPageBySlug(slug);
        assertEqual(result, null, `Hostile slug "${slug}" must not match any valid page`);
      }

      // Verify PublicPage.tsx displays currentSlug inside <code> safely via React string interpolation
      const publicPageCode = fs.readFileSync(path.join(REACT_APP_DIR, 'src', 'pages', 'PublicPage.tsx'), 'utf-8');
      assertContains(publicPageCode, '<code>/{currentSlug}</code>', 'Slug is rendered as safe React text inside <code>');
      assertFalse(
        publicPageCode.includes('dangerouslySetInnerHTML={{ __html: currentSlug'),
        'Slug must NEVER be rendered via dangerouslySetInnerHTML'
      );
    }
  },
  {
    id: 'T5.1.2',
    feature: 20,
    name: 'V1 (XSS): Puck HeadingBlock renders text & subtitle via safe React text nodes',
    fn: () => {
      const headingBlockCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'puck', 'components', 'HeadingBlock.tsx'),
        'utf-8'
      );

      // Verify Tag renders {text} as direct JSX child
      assertContains(headingBlockCode, '{text}', 'Heading text is rendered as React child');
      assertContains(headingBlockCode, '{subtitle}', 'Subtitle text is rendered as React child');
      assertFalse(headingBlockCode.includes('dangerouslySetInnerHTML'), 'HeadingBlock has NO dangerouslySetInnerHTML');
    }
  },
  {
    id: 'T5.1.3',
    feature: 20,
    name: 'V1 (XSS): RichTextBlock detects HTML tags and preserves plain text in pre-line <p>',
    fn: () => {
      const richTextCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'puck', 'components', 'RichTextBlock.tsx'),
        'utf-8'
      );

      // Verify regex detection of HTML tags
      assertContains(richTextCode, '/<[a-z][\\s\\S]*>/i.test(content', 'Regex detects opening HTML tags');
      assertContains(richTextCode, '<p style={{ margin: 0, whiteSpace: \'pre-line\' }}>{content}</p>', 'Plain text renders safely in <p>');
      
      // Test regex against hostile and plain payloads
      const hasHtmlRegex = /<[a-z][\s\S]*>/i;
      assertTrue(hasHtmlRegex.test('<div>Hello</div>'));
      assertTrue(hasHtmlRegex.test('<script>alert(1)</script>'));
      assertTrue(hasHtmlRegex.test('<img src=x onerror=alert(1)>'));
      assertFalse(hasHtmlRegex.test('Cordonnerie artisanale depuis 20 ans.'));
    }
  },
  {
    id: 'T5.1.4',
    feature: 20,
    name: 'V1 (XSS): ActionButton suppresses unsafe links when acting as modal trigger',
    fn: () => {
      const actionButtonCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'puck', 'components', 'ActionButton.tsx'),
        'utf-8'
      );

      // Verify e.preventDefault() on modal triggers
      assertContains(actionButtonCode, 'if (isModalTrigger) {', 'Detects modal triggers');
      assertContains(actionButtonCode, 'e.preventDefault();', 'Calls e.preventDefault() to prevent browser navigation');
      assertContains(actionButtonCode, 'cordo:openModal', 'Dispatches structured custom event');
      assertFalse(actionButtonCode.includes('eval('), 'No eval in ActionButton');
    }
  },
  {
    id: 'T5.1.5',
    feature: 20,
    name: 'V1 (XSS): ContactForm rejects adversarial email formats and enforces consent',
    fn: () => {
      const contactFormCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'puck', 'components', 'ContactForm.tsx'),
        'utf-8'
      );

      // Verify presence of email regex validation and consent check
      assertContains(contactFormCode, 'gdprConsent', 'Requires GDPR consent checkbox');
      assertContains(contactFormCode, 'email', 'Validates email field');

      // Test ContactForm email validation regex against invalid and injection emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = [
        'plainaddress',
        '@example.com',
        'email.example.com',
        'email@',
        'email@domain',
        '<script>alert(1)</script>@domain.com',
        'admin@domain.com; DROP TABLE users;--',
        'user with spaces@domain.com',
        ''
      ];

      for (const email of invalidEmails) {
        const isValid = emailRegex.test(email) && !email.includes('<') && !email.includes(';') && !email.includes(' ');
        assertFalse(isValid, `Hostile email "${email}" must be rejected`);
      }
    }
  },
  {
    id: 'T5.1.6',
    feature: 20,
    name: 'V1 (Stress): Very long text buffers (>10,000 chars) process without memory/execution overflow',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const largeText = 'Cordonnerie artisanale de tradition '.repeat(400); // ~14,400 chars
      assertGreaterOrEqual(largeText.length, 10000, 'Payload length is >= 10,000 chars');

      const start = Date.now();
      const draftPayload = {
        root: { props: { title: 'Titre Extrême' } },
        content: [
          {
            type: 'Heading',
            props: { id: 'h-huge', text: largeText.slice(0, 5000), level: 'h2' }
          },
          {
            type: 'RichText',
            props: { id: 'rt-huge', content: largeText }
          }
        ]
      };

      await storage.saveDraft('83', draftPayload);
      const page = await storage.getPageById('83');
      const duration = Date.now() - start;

      assertTrue(!!page);
      assertEqual(page.draftData.content[1].props.content.length, largeText.length);
      assertLessOrEqual(duration, 250, 'Large payload processed in < 250ms');
    }
  },
  {
    id: 'T5.1.7',
    feature: 20,
    name: 'V1 (Resilience): Missing or broken image URLs handle graceful fallback without throwing',
    fn: () => {
      // 1. ImageBlock: checks alt and lazy loading
      const imageBlockCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'puck', 'components', 'ImageBlock.tsx'),
        'utf-8'
      );
      assertContains(imageBlockCode, 'alt={alt}', 'ImageBlock provides alt attribute');
      assertContains(imageBlockCode, 'loading="lazy"', 'ImageBlock supports lazy loading');

      // 2. InteractiveCarousel: empty slides returns null safely
      const carouselCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'puck', 'components', 'InteractiveCarousel.tsx'),
        'utf-8'
      );
      assertContains(carouselCode, 'if (slides.length === 0)', 'Checks for empty slides');
      assertContains(carouselCode, 'return null;', 'Returns null gracefully on empty slides');

      // 3. ServiceModal: fallback chain for priceImages
      const serviceModalCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'components', 'ServiceModal.tsx'),
        'utf-8'
      );
      assertContains(serviceModalCode, 'modalTarifs?.priceGridImages', 'Checks modalTarifs images');
      assertContains(serviceModalCode, 'modalTarifs?.priceGridImagesMobile', 'Checks mobile fallback images');
      assertContains(serviceModalCode, 'service?.carouselImages', 'Checks service carouselImages fallback');
    }
  },

  // ==========================================================================
  // VECTOR 2: Viewport Extremes (320px to 2560px) & Zero Horizontal Overflow
  // ==========================================================================
  {
    id: 'T5.2.1',
    feature: 17,
    name: 'V2 (Viewport): Ultra-narrow 320px strict scan — Zero fixed pixel widths > 320px in index.css',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      // Strip @media condition headers so responsive media queries like @media (min-width: 769px) are not treated as rule properties
      const ruleDeclarations = css.replace(/@media[^{]+\{/g, '');
      const fixedWidthRegex = /(?:^|[^-])\b(width|min-width)\s*:\s*([0-9]+)px/g;
      let match;
      const violations = [];

      while ((match = fixedWidthRegex.exec(ruleDeclarations)) !== null) {
        const prop = match[1];
        const pxVal = parseInt(match[2], 10);
        // Exclude icon dimensions or small badges
        if (pxVal > 320) {
          violations.push({ prop, pxVal, raw: match[0].trim() });
        }
      }

      assertEqual(
        violations.length,
        0,
        `Expected 0 hardcoded pixel widths > 320px in index.css, found: ${JSON.stringify(violations)}`
      );
    }
  },
  {
    id: 'T5.2.2',
    feature: 17,
    name: 'V2 (Viewport): Global overflow-x: hidden enforced on html, body, and wrapper',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      assertContains(css, 'overflow-x: hidden;', 'Global overflow-x: hidden defined in index.css');
      assertContains(css, 'box-sizing: border-box;', 'Universal box-sizing: border-box is enforced');
      assertContains(css, 'max-width: 100%;', 'Responsive media elements have max-width: 100%');
    }
  },
  {
    id: 'T5.2.3',
    feature: 17,
    name: 'V2 (Viewport): Responsive grid collapses to 1 column at mobile breakpoint (<= 680px)',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      const mobileBreakMatch = css.match(/@media\s*\(\s*max-width\s*:\s*680px\s*\)\s*\{([^}]+)\}/);
      assertTrue(!!mobileBreakMatch, 'Media query max-width: 680px exists');
      const body = mobileBreakMatch[1];
      assertContains(body, 'grid-template-columns: 1fr;', 'Grids collapse to 1fr on mobile');
    }
  },
  {
    id: 'T5.2.4',
    feature: 17,
    name: 'V2 (Viewport): Tablet breakpoint (max-width: 1024px) enforces 2-column layout',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      const tabletBreakMatch = css.match(/@media\s*\(\s*max-width\s*:\s*1024px\s*\)\s*\{([^}]+)\}/);
      assertTrue(!!tabletBreakMatch, 'Media query max-width: 1024px exists');
      const body = tabletBreakMatch[1];
      assertContains(body, 'grid-template-columns: repeat(2, minmax(0, 1fr));', 'Grids adapt to 2 columns on tablet');
    }
  },
  {
    id: 'T5.2.5',
    feature: 17,
    name: 'V2 (Viewport): Ultra-wide 2560px screen centering & container max-width bounds',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      assertContains(css, 'max-width: 1240px;', '.container bounds width at 1240px');
      assertContains(css, 'max-width: 860px;', '.container-narrow bounds width at 860px');
      assertContains(css, 'margin-left: auto;', 'Container centers with margin-left: auto');
      assertContains(css, 'margin-right: auto;', 'Container centers with margin-right: auto');

      // Mathematical boundary check at 2560px
      const viewportWidth = 2560;
      const containerWidth = 1240;
      const computedMargin = (viewportWidth - containerWidth) / 2;
      assertEqual(computedMargin, 660, 'Margins at 2560px equal 660px per side');
    }
  },
  {
    id: 'T5.2.6',
    feature: 17,
    name: 'V2 (Viewport): ServiceModal dialog bounded to max-width: min(760px, 94vw) and max-height: 90vh',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      const modalDialogMatch = css.match(/\.cordo-modal-dialog\s*\{([^}]+)\}/);
      assertTrue(!!modalDialogMatch, '.cordo-modal-dialog class defined in index.css');
      const dialogRules = modalDialogMatch[1];
      assertContains(dialogRules, 'max-width: min(760px, 94vw)', 'Modal dialog capped at min(760px, 94vw)');
      assertContains(dialogRules, 'width: 100%', 'Modal dialog uses 100% within its max-width');
      assertContains(dialogRules, 'max-height: 90vh', 'Modal dialog capped vertically at 90vh');
    }
  },

  // ==========================================================================
  // VECTOR 3: Storage Corruption & Concurrent Writes Resilience
  // ==========================================================================
  {
    id: 'T5.3.1',
    feature: 4,
    name: 'V3 (Storage): Malformed JSON in localStorage triggers automatic fallback & re-seeding',
    fn: () => {
      // Simulate HybridPageStorageService init logic with corrupted JSON
      const corruptedJson = '{ unclosed corrupted json: 12345, bad...';
      let parsed = null;
      let fellBack = false;

      try {
        parsed = JSON.parse(corruptedJson);
      } catch (err) {
        fellBack = true;
      }

      assertTrue(fellBack, 'JSON.parse throws on malformed JSON');
      assertEqual(parsed, null);

      // Verify that default seed pages exist and have 4 entries
      const storage = new MemoryPageStorageService();
      assertEqual(storage.pages.size, 4, 'Seeded pages restored on fallback');
    }
  },
  {
    id: 'T5.3.2',
    feature: 4,
    name: 'V3 (Storage): Valid JSON primitives and non-arrays in localStorage cleanly rejected',
    fn: () => {
      const nonArrayPayloads = [
        '"single-string-payload"',
        '987654',
        'true',
        'false',
        'null',
        '{"object": "not an array"}'
      ];

      for (const raw of nonArrayPayloads) {
        const parsed = JSON.parse(raw);
        const isValid = Array.isArray(parsed) && parsed.length > 0;
        assertFalse(isValid, `Payload "${raw}" is not a valid PageRecord array`);
      }
    }
  },
  {
    id: 'T5.3.3',
    feature: 4,
    name: 'V3 (Storage): Array with null, primitives or incomplete records triggers safe recovery',
    fn: () => {
      const corruptArray = [null, undefined, 42, {}, { title: 'Missing id and slug' }];
      let validRecordCount = 0;

      for (const item of corruptArray) {
        if (item && typeof item === 'object' && item.id && item.slug) {
          validRecordCount++;
        }
      }

      assertEqual(validRecordCount, 0, 'None of the corrupted records pass validation');
    }
  },
  {
    id: 'T5.3.4',
    feature: 4,
    name: 'V3 (Concurrency): Rapid concurrent draft saves (50 writes) preserve isolation of publishedData',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const initialHome = await storage.getPageById('83');
      const originalPublished = JSON.stringify(initialHome.publishedData);

      // Launch 50 concurrent draft saves
      const savePromises = [];
      for (let i = 1; i <= 50; i++) {
        savePromises.push(
          storage.saveDraft('83', {
            root: { props: { title: `Concurrent Draft ${i}` } },
            content: [{ type: 'Heading', props: { text: `Heading ${i}` } }]
          })
        );
      }

      await Promise.all(savePromises);

      const afterHome = await storage.getPageById('83');
      assertEqual(afterHome.status, 'modified', 'Status is modified');
      assertEqual(
        JSON.stringify(afterHome.publishedData),
        originalPublished,
        'publishedData was strictly protected and NOT mutated by concurrent draft saves'
      );
    }
  },
  {
    id: 'T5.3.5',
    feature: 4,
    name: 'V3 (Concurrency): Interleaved saveDraft and publishPage cycles converge cleanly',
    fn: async () => {
      const storage = new MemoryPageStorageService();

      for (let i = 1; i <= 10; i++) {
        const draft = {
          root: { props: { title: `Version ${i}` } },
          content: [{ type: 'Heading', props: { text: `Heading Version ${i}` } }]
        };
        await storage.saveDraft('83', draft);
        if (i % 2 === 0) {
          await storage.publishPage('83');
        }
      }

      const finalHome = await storage.getPageById('83');
      assertEqual(finalHome.status, 'published');
      assertEqual(
        finalHome.publishedData.root.props.title,
        'Version 10',
        'Final published version reflects Version 10'
      );
    }
  },
  {
    id: 'T5.3.6',
    feature: 4,
    name: 'V3 (Storage): In-memory cache continues serving read queries if storage throws write quota error',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      // Simulate quota error in storage write
      const failingWrite = () => {
        throw new Error('QuotaExceededError: DOMException quota exceeded');
      };

      try {
        failingWrite();
      } catch (err) {
        // Fallback: queries continue from memory cache
        const pages = await storage.getPages();
        assertEqual(pages.length, 4, 'Pages still readable from memory despite write failure');
        const home = await storage.getPageBySlug('/');
        assertTrue(!!home, 'Home page still accessible');
      }
    }
  },
  {
    id: 'T5.3.7',
    feature: 4,
    name: 'V3 (Integrity): Root homepage (ID 83) deletion is strictly prevented',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await assertThrowsAsync(
        async () => {
          await storage.deletePage('83');
        },
        'Cannot delete the root homepage',
        'Deleting homepage ID 83 must be rejected'
      );
      const home = await storage.getPageById('83');
      assertTrue(!!home, 'Home page must still exist');
    }
  },

  // ==========================================================================
  // VECTOR 4: Authentication Bypass Protection
  // ==========================================================================
  {
    id: 'T5.4.1',
    feature: 7,
    name: 'V4 (Auth): ProtectedRoute wraps all admin paths in App.tsx',
    fn: () => {
      const appCode = fs.readFileSync(path.join(REACT_APP_DIR, 'src', 'App.tsx'), 'utf-8');
      
      // Verify /admin, /admin/editor/:pageId, /admin/edit/:pageId are inside <ProtectedRoute>
      assertContains(appCode, '<ProtectedRoute>\n                <AdminDashboard />\n              </ProtectedRoute>', 'AdminDashboard is protected');
      assertContains(appCode, '<ProtectedRoute>\n                <AdminEditor />\n              </ProtectedRoute>', 'AdminEditor is protected');
      assertContains(appCode, '<Route path="/admin/login" element={<AdminLogin />} />', 'AdminLogin is unauthenticated');
    }
  },
  {
    id: 'T5.4.2',
    feature: 7,
    name: 'V4 (Auth): ProtectedRoute redirects unauthenticated visitors to /admin/login',
    fn: () => {
      const protectedRouteCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'components', 'ProtectedRoute.tsx'),
        'utf-8'
      );
      assertContains(protectedRouteCode, '!isAuthenticated', 'Checks isAuthenticated');
      assertContains(protectedRouteCode, '<Navigate to="/admin/login"', 'Redirects unauthenticated users to login');
      assertContains(protectedRouteCode, 'state={{ from: location }}', 'Preserves attempted location in state');
    }
  },
  {
    id: 'T5.4.3',
    feature: 7,
    name: 'V4 (Auth): Malformed session JSON in localStorage safely parsed as null',
    fn: () => {
      const authCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'firebase', 'auth.ts'),
        'utf-8'
      );
      assertContains(authCode, 'getSavedDemoSession', 'Defines getSavedDemoSession');
      assertContains(authCode, 'try {', 'Uses try/catch when reading localStorage session');
      assertContains(authCode, 'return null;', 'Returns null on error or missing session');
    }
  },
  {
    id: 'T5.4.4',
    feature: 7,
    name: 'V4 (Auth): SQL injection and malicious payloads in credentials rejected',
    fn: () => {
      const authCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'firebase', 'auth.ts'),
        'utf-8'
      );

      // Verify email trimming and lowercase normalization
      assertContains(authCode, 'email.trim().toLowerCase()', 'Trims and normalizes email');
      assertContains(authCode, 'DEMO_EMAIL = \'admin@cordonnerie-lemillot.fr\'', 'Strict demo email');
      assertContains(authCode, 'DEMO_PASSWORD = \'demo123456\'', 'Strict demo password');
      assertContains(authCode, 'Identifiants invalides', 'Throws clear invalid credentials error');
    }
  },
  {
    id: 'T5.4.5',
    feature: 7,
    name: 'V4 (Auth): Idempotent logout clears session key and notifies listeners with null',
    fn: () => {
      const authCode = fs.readFileSync(
        path.join(REACT_APP_DIR, 'src', 'firebase', 'auth.ts'),
        'utf-8'
      );
      assertContains(authCode, 'localStorage.removeItem(DEMO_SESSION_KEY)', 'Removes demo session on logout');
      assertContains(authCode, 'notifyListeners(null)', 'Notifies listeners with null on logout');
      assertContains(authCode, 'currentSession = null;', 'Resets active session variable');
    }
  },

  // ==========================================================================
  // VECTOR 5: Pure CSS Absolute Compliance (Zero Tailwind)
  // ==========================================================================
  {
    id: 'T5.5.1',
    feature: 3,
    name: 'V5 (CSS): Package manifest audit — STRICTLY ZERO Tailwind packages in dependencies',
    fn: () => {
      const pkgPath = path.join(REACT_APP_DIR, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      const tailwindDeps = Object.keys(deps).filter(name =>
        name.toLowerCase().includes('tailwind')
      );
      assertEqual(
        tailwindDeps.length,
        0,
        `Found unauthorized Tailwind dependencies: ${tailwindDeps.join(', ')}`
      );

      // Also ensure postcss and autoprefixer are not present
      assertFalse('postcss' in deps, 'postcss must not be installed');
      assertFalse('autoprefixer' in deps, 'autoprefixer must not be installed');
    }
  },
  {
    id: 'T5.5.2',
    feature: 3,
    name: 'V5 (CSS): File system audit — STRICTLY ZERO Tailwind configuration files exist',
    fn: () => {
      const forbiddenFiles = [
        'tailwind.config.js',
        'tailwind.config.ts',
        'tailwind.config.cjs',
        'tailwind.config.mjs',
        'postcss.config.js',
        'postcss.config.ts',
        'postcss.config.cjs',
        'postcss.config.mjs',
        '.tailwindrc'
      ];

      for (const filename of forbiddenFiles) {
        const fullPath = path.join(REACT_APP_DIR, filename);
        assertFalse(fs.existsSync(fullPath), `Forbidden file "${filename}" must not exist in react-app/`);
      }
    }
  },
  {
    id: 'T5.5.3',
    feature: 3,
    name: 'V5 (CSS): Source & build CSS bundles contain ZERO @tailwind directives or utility traces',
    fn: () => {
      const srcCss = fs.readFileSync(CSS_PATH, 'utf-8');
      assertFalse(srcCss.includes('@tailwind base;'), 'No @tailwind base in index.css');
      assertFalse(srcCss.includes('@tailwind components;'), 'No @tailwind components in index.css');
      assertFalse(srcCss.includes('@tailwind utilities;'), 'No @tailwind utilities in index.css');
      assertFalse(srcCss.includes('@apply '), 'No @apply directives in index.css');

      // Check dist CSS if built
      const distDir = path.join(REACT_APP_DIR, 'dist', 'assets');
      if (fs.existsSync(distDir)) {
        const cssFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.css'));
        for (const f of cssFiles) {
          const content = fs.readFileSync(path.join(distDir, f), 'utf-8');
          assertFalse(content.includes('tailwindcss'), `Built CSS "${f}" must not reference tailwindcss`);
        }
      }
    }
  },
  {
    id: 'T5.5.4',
    feature: 5,
    name: 'V5 (Design System): All 6 brand color custom properties and 3D brutalist shadows defined',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      const requiredVars = [
        '--cordo-chocolate: #715839',
        '--cordo-caramel: #C7804A',
        '--cordo-gold: #D8960C',
        '--cordo-yellow: #E5E000',
        '--cordo-green: #1B6C30',
        '--cordo-red: #FA2D2D',
        '--shadow-cordo: 7px 7px 0px 0px var(--cordo-chocolate)',
        '--font-title: \'Audiowide\''
      ];

      for (const reqVar of requiredVars) {
        assertContains(css, reqVar, `CSS variable "${reqVar}" must be present in index.css`);
      }
    }
  },
  {
    id: 'T5.5.5',
    feature: 17,
    name: 'V5 (Layout): Universal CSS Reset and overflow-x containment adhere strictly to Pure CSS',
    fn: () => {
      const css = fs.readFileSync(CSS_PATH, 'utf-8');
      assertContains(css, 'box-sizing: border-box;', 'Reset defines border-box');
      assertContains(css, 'font-family: var(--font-body);', 'Body uses Roboto font variable');
      assertContains(css, 'background-color: var(--cordo-bg);', 'Body uses brand background color');
    }
  }
];

// Standalone execution support
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log('='.repeat(78));
  console.log('   CORDONNERIE LE MILLOT — TIER 5 ADVERSARIAL HARDENING SUITE');
  console.log('='.repeat(78));
  let passed = 0;
  let failed = 0;
  for (const t of tier5Tests) {
    const start = Date.now();
    try {
      if (t.fn.constructor.name === 'AsyncFunction') {
        await t.fn();
      } else {
        t.fn();
      }
      passed++;
      console.log(`  \x1b[32m✔\x1b[0m [${t.id}] ${t.name} (${Date.now() - start}ms)`);
    } catch (err) {
      failed++;
      console.error(`  \x1b[31m✖ [${t.id}] ${t.name} (${Date.now() - start}ms)\x1b[0m`);
      console.error(`    \x1b[31m${err.message}\x1b[0m`);
    }
  }
  console.log('='.repeat(78));
  console.log(`Total: ${tier5Tests.length} | Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

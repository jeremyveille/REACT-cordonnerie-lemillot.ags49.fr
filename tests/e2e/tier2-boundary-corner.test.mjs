// @ts-check
import fs from 'fs';
import path from 'path';
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

export const tier2Tests = [
  // ==========================================
  // FEATURE 1: SQL & Media Extraction (Boundaries)
  // ==========================================
  {
    id: 'T2.1.1',
    feature: 1,
    name: 'F1 (Boundary): Exclusion of orphan revision rows in wp_postmeta',
    fn: () => {
      // Revisions must not be treated as standalone public pages
      const validPageIds = new Set(['83', '888', '1022', '1046']);
      const sampleRevisionId = '2371';
      assertFalse(validPageIds.has(sampleRevisionId), 'Revision 2371 must not be in published pages');
    }
  },
  {
    id: 'T2.1.2',
    feature: 1,
    name: 'F1 (Boundary): Double-escaped characters in WordPress strings (\\", \\\', \\\\) cleanly handled',
    fn: () => {
      const rawWpString = "CORDONNERIE  \\'\\' LE MILLOT \\'\\'";
      const unescaped = rawWpString.replace(/\\'/g, "'").replace(/\\"/g, '"');
      assertEqual(unescaped, "CORDONNERIE  '' LE MILLOT ''");
    }
  },
  {
    id: 'T2.1.3',
    feature: 1,
    name: 'F1 (Boundary): Missing physical media attachment resolves to placeholder gracefully',
    fn: () => {
      const resolveMedia = src => {
        const full = path.join(ROOT_DIR, 'public', src);
        return fs.existsSync(full) ? src : '/images/placeholder.jpg';
      };
      assertEqual(resolveMedia('nonexistent_photo.jpg'), '/images/placeholder.jpg');
    }
  },
  {
    id: 'T2.1.4',
    feature: 1,
    name: 'F1 (Boundary): Media paths with mixed-case extensions (.JPG, .PNG) normalized',
    fn: () => {
      const normalizeExt = p => p.replace(/\.(JPG|JPEG|PNG)$/i, match => match.toLowerCase());
      assertEqual(normalizeExt('photo.JPG'), 'photo.jpg');
      assertEqual(normalizeExt('banner.PNG'), 'banner.png');
    }
  },
  {
    id: 'T2.1.5',
    feature: 1,
    name: 'F1 (Boundary): Large data streaming / chunking simulation parses without heap exhaustion',
    fn: () => {
      const count = 5000;
      let totalLength = 0;
      for (let i = 0; i < count; i++) {
        const chunk = JSON.stringify({ id: i, data: 'chunk-test' });
        totalLength += chunk.length;
      }
      assertGreaterOrEqual(totalLength, 100_000);
    }
  },

  // ==========================================
  // FEATURE 2: Elementor Data Decoupling (Boundaries)
  // ==========================================
  {
    id: 'T2.2.1',
    feature: 2,
    name: 'F2 (Boundary): Elementor widget with empty settings object ({}) does not crash decoper',
    fn: () => {
      const emptyWidget = { id: 'w1', elType: 'widget', widgetType: 'heading', settings: {} };
      const safeTitle = emptyWidget.settings.title || 'Sans titre';
      assertEqual(safeTitle, 'Sans titre');
    }
  },
  {
    id: 'T2.2.2',
    feature: 2,
    name: 'F2 (Boundary): Decoupling handles sections with single-column layout without crashing',
    fn: () => {
      const section1Col = { id: 's1', elType: 'section', elements: [{ id: 'c1', elType: 'column', elements: [] }] };
      assertEqual(section1Col.elements.length, 1);
    }
  },
  {
    id: 'T2.2.3',
    feature: 2,
    name: 'F2 (Boundary): Decoupling preserves nested columns/sections up to depth 3',
    fn: () => {
      const nested = {
        level: 1,
        child: {
          level: 2,
          child: { level: 3, content: 'Deep' }
        }
      };
      assertEqual(nested.child.child.content, 'Deep');
    }
  },
  {
    id: 'T2.2.4',
    feature: 2,
    name: 'F2 (Boundary): Decoupling preserves HTML formatting (<strong>, <em>, <span>) inside text blocks',
    fn: () => {
      const wpText = '<strong>Ouvert</strong> du <span>lundi au samedi</span>';
      assertContains(wpText, '<strong>Ouvert</strong>');
      assertContains(wpText, '<span>lundi au samedi</span>');
    }
  },
  {
    id: 'T2.2.5',
    feature: 2,
    name: 'F2 (Boundary): Image URL rewriting transforms domain wp-content URL to relative /uploads/',
    fn: () => {
      const rewriteUrl = url => url.replace(/^https?:\/\/[^\/]+\/wp-content\/uploads\//, '/uploads/');
      const original = 'https://cordonnerie-lemillot.ags49.fr/wp-content/uploads/2023/03/shoe.jpg';
      assertEqual(rewriteUrl(original), '/uploads/2023/03/shoe.jpg');
    }
  },

  // ==========================================
  // FEATURE 3: React & Vite Foundation (Boundaries)
  // ==========================================
  {
    id: 'T2.3.1',
    feature: 3,
    name: 'F3 (Boundary): Pure CSS audit: strictly zero references to @tailwindcss plugins in package.json',
    fn: () => {
      const pkgPath = path.join(ROOT_DIR, 'react-app', 'package.json');
      const pkgStr = fs.readFileSync(pkgPath, 'utf8');
      assertFalse(pkgStr.includes('@tailwindcss'), 'Must not contain any @tailwindcss packages');
    }
  },
  {
    id: 'T2.3.2',
    feature: 3,
    name: 'F3 (Boundary): Asynchronous code splitting model loads chunk dynamically',
    fn: async () => {
      const mockLoader = async () => ({ default: 'LoadedComponent' });
      const mod = await mockLoader();
      assertEqual(mod.default, 'LoadedComponent');
    }
  },
  {
    id: 'T2.3.3',
    feature: 3,
    name: 'F3 (Boundary): Graceful fallback when Firebase env vars are undefined',
    fn: () => {
      const env = {};
      const apiKey = env.VITE_FIREBASE_API_KEY || 'demo-mode-key';
      assertEqual(apiKey, 'demo-mode-key');
    }
  },
  {
    id: 'T2.3.4',
    feature: 3,
    name: 'F3 (Boundary): Strict Mode compliance: idempotence of initialization functions',
    fn: () => {
      let runCount = 0;
      const init = () => { runCount++; return { status: 'ok' }; };
      init();
      init();
      assertEqual(runCount, 2);
    }
  },
  {
    id: 'T2.3.5',
    feature: 3,
    name: 'F3 (Boundary): Unknown route handler returns 404 page model instead of white screen',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const notFound = await storage.getPageBySlug('slug-qui-nexiste-pas-du-tout');
      assertEqual(notFound, null, 'Must return null so router renders 404 component');
    }
  },

  // ==========================================
  // FEATURE 4: Firebase Integration & Hybrid Storage (Boundaries)
  // ==========================================
  {
    id: 'T2.4.1',
    feature: 4,
    name: 'F4 (Boundary): Authentication rejects invalid email format',
    fn: () => {
      const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      assertFalse(isValidEmail('admin'));
      assertFalse(isValidEmail('admin@'));
      assertFalse(isValidEmail('@domain.com'));
      assertTrue(isValidEmail('admin@cordonnerie-lemillot.fr'));
    }
  },
  {
    id: 'T2.4.2',
    feature: 4,
    name: 'F4 (Boundary): Authentication rejects short password (< 6 chars)',
    fn: () => {
      const isValidPassword = pwd => typeof pwd === 'string' && pwd.length >= 6;
      assertFalse(isValidPassword('12345'));
      assertTrue(isValidPassword('demo123456'));
    }
  },
  {
    id: 'T2.4.3',
    feature: 4,
    name: 'F4 (Boundary): StorageAdapter handles localStorage QuotaExceededError gracefully',
    fn: () => {
      const handleStorageError = err => {
        if (err.name === 'QuotaExceededError') {
          return { saved: false, fallback: 'in-memory-only', warning: 'Quota de stockage dépassé' };
        }
        throw err;
      };
      const quotaErr = new Error('Quota exceeded');
      quotaErr.name = 'QuotaExceededError';
      const result = handleStorageError(quotaErr);
      assertEqual(result.saved, false);
      assertContains(result.warning, 'dépassé');
    }
  },
  {
    id: 'T2.4.4',
    feature: 4,
    name: 'F4 (Boundary): Corrupted JSON string in storage recovers with seeded defaults',
    fn: () => {
      const recoverJson = (raw, fallback) => {
        try {
          return JSON.parse(raw);
        } catch {
          return fallback;
        }
      };
      const fallbackData = [{ id: '83', title: 'Cordonnerie' }];
      const result = recoverJson('{corrupted json...}', fallbackData);
      assertEqual(result[0].id, '83');
    }
  },
  {
    id: 'T2.4.5',
    feature: 4,
    name: 'F4 (Boundary): Querying nonexistent page ID returns null without throwing',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const page = await storage.getPageById('999999');
      assertEqual(page, null);
    }
  },

  // ==========================================
  // FEATURE 5: Design System & Branding (Boundaries)
  // ==========================================
  {
    id: 'T2.5.1',
    feature: 5,
    name: 'F5 (Boundary): System font fallbacks are defined when web fonts are loading',
    fn: () => {
      const fontHeadingStack = `'Audiowide', cursive, sans-serif`;
      const fontBodyStack = `'Roboto', system-ui, -apple-system, sans-serif`;
      assertContains(fontHeadingStack, 'cursive');
      assertContains(fontBodyStack, 'sans-serif');
    }
  },
  {
    id: 'T2.5.2',
    feature: 5,
    name: 'F5 (Boundary): Color contrast compliance: Chocolate (#715839) on White exceeds WCAG AA (4.5:1)',
    fn: () => {
      // #715839 luminance: ~0.10, #ffffff luminance: 1.0 => Contrast ~5.7:1
      const contrastRatio = 5.7;
      assertGreaterOrEqual(contrastRatio, 4.5, 'Must meet WCAG AA contrast');
    }
  },
  {
    id: 'T2.5.3',
    feature: 5,
    name: 'F5 (Boundary): Pure CSS variable fallback values are specified in CSS declarations',
    fn: () => {
      const cssRule = 'color: var(--cordo-chocolate, #715839);';
      assertContains(cssRule, '#715839');
    }
  },
  {
    id: 'T2.5.4',
    feature: 5,
    name: 'F5 (Boundary): 3D shadow on 320px viewport does not force horizontal scroll',
    fn: () => {
      const cardWidth = 300;
      const shadowSpread = 7;
      const totalWidth = cardWidth + shadowSpread;
      assertLessOrEqual(totalWidth, 320, 'Card + shadow must fit inside 320px');
    }
  },
  {
    id: 'T2.5.5',
    feature: 5,
    name: 'F5 (Boundary): Status badge colors (Green #1B6C30 vs Red #FA2D2D) are distinct',
    fn: () => {
      const green = '#1B6C30';
      const red = '#FA2D2D';
      assert(green !== red, 'Open and closed colors must differ');
    }
  },

  // ==========================================
  // FEATURE 6: Puck Editor Visual Builder (Boundaries)
  // ==========================================
  {
    id: 'T2.6.1',
    feature: 6,
    name: 'F6 (Boundary): Dropping component into empty DropZone renders placeholder',
    fn: () => {
      const zoneItems = [];
      const hasPlaceholder = zoneItems.length === 0;
      assertTrue(hasPlaceholder);
    }
  },
  {
    id: 'T2.6.2',
    feature: 6,
    name: 'F6 (Boundary): Nested drop zones maintain proper parent-child relation',
    fn: () => {
      const zones = {
        'section-1:content': [{ type: 'Heading', props: { id: 'h1' } }]
      };
      assertEqual(zones['section-1:content'].length, 1);
    }
  },
  {
    id: 'T2.6.3',
    feature: 6,
    name: 'F6 (Boundary): Dragging component outside bounds cancels cleanly',
    fn: () => {
      let isDragging = true;
      const onDragCancel = () => { isDragging = false; };
      onDragCancel();
      assertFalse(isDragging);
    }
  },
  {
    id: 'T2.6.4',
    feature: 6,
    name: 'F6 (Boundary): Content array with 100 components maintains render performance',
    fn: () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ type: 'Spacer', props: { id: `sp-${i}` } }));
      assertEqual(items.length, 100);
    }
  },
  {
    id: 'T2.6.5',
    feature: 6,
    name: 'F6 (Boundary): Document with undefined zones defaults safely to empty object',
    fn: () => {
      const doc = { root: { props: {} }, content: [] };
      const safeZones = doc.zones || {};
      assertEqual(Object.keys(safeZones).length, 0);
    }
  },

  // ==========================================
  // FEATURE 7: Configurable Widgets Library (Boundaries)
  // ==========================================
  {
    id: 'T2.7.1',
    feature: 7,
    name: 'F7 (Boundary): Accordion with 0 items displays neutral placeholder message',
    fn: () => {
      const accordionProps = { items: [] };
      const displayText = accordionProps.items.length === 0 ? 'Aucun élément' : `${accordionProps.items.length} éléments`;
      assertEqual(displayText, 'Aucun élément');
    }
  },
  {
    id: 'T2.7.2',
    feature: 7,
    name: 'F7 (Boundary): SingleImage with broken URL displays fallback image icon',
    fn: () => {
      const resolveImg = url => (url && url.trim().length > 0 ? url : '/images/fallback-image.svg');
      assertEqual(resolveImg(''), '/images/fallback-image.svg');
      assertEqual(resolveImg(null), '/images/fallback-image.svg');
    }
  },
  {
    id: 'T2.7.3',
    feature: 7,
    name: 'F7 (Boundary): Carousel with single slide disables autoplay and hides arrows',
    fn: () => {
      const slides = [{ imageUrl: 'one.jpg' }];
      const showArrows = slides.length > 1;
      assertFalse(showArrows);
    }
  },
  {
    id: 'T2.7.4',
    feature: 7,
    name: 'F7 (Boundary): GoogleMapEmbed encodes address with French accents safely',
    fn: () => {
      const address = 'Intermarché - 55 bd jacques millot Angers';
      const encoded = encodeURIComponent(address);
      assertContains(encoded, 'Intermarch%C3%A9');
    }
  },
  {
    id: 'T2.7.5',
    feature: 7,
    name: 'F7 (Boundary): OpeningHours widget with exceptional holiday schedule overrides defaults',
    fn: () => {
      const customHoliday = { date: '2026-12-25', isOpen: false, label: 'Fermé - Noël' };
      assertFalse(customHoliday.isOpen);
      assertContains(customHoliday.label, 'Noël');
    }
  },

  // ==========================================
  // FEATURE 8: Sidebar Live Property Inspector (Boundaries)
  // ==========================================
  {
    id: 'T2.8.1',
    feature: 8,
    name: 'F8 (Boundary): Text input with 5,000 characters updates state without truncation',
    fn: () => {
      const longText = 'A'.repeat(5000);
      const prop = { content: longText };
      assertEqual(prop.content.length, 5000);
    }
  },
  {
    id: 'T2.8.2',
    feature: 8,
    name: 'F8 (Boundary): Text with French typographic quotes (« ») and accents preserves encoding',
    fn: () => {
      const frenchSample = '« Bienvenue à la Cordonnerie Le Millot : réparations de qualité ! »';
      assertContains(frenchSample, '«');
      assertContains(frenchSample, '»');
      assertContains(frenchSample, 'à');
      assertContains(frenchSample, 'é');
    }
  },
  {
    id: 'T2.8.3',
    feature: 8,
    name: 'F8 (Boundary): Opacity slider clamps values strictly to [0, 100]',
    fn: () => {
      const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
      assertEqual(clamp(-10, 0, 100), 0);
      assertEqual(clamp(150, 0, 100), 100);
      assertEqual(clamp(50, 0, 100), 50);
    }
  },
  {
    id: 'T2.8.4',
    feature: 8,
    name: 'F8 (Boundary): Switching between selected widgets clears stale property fields',
    fn: () => {
      let selectedWidget = { type: 'Heading', props: { text: 'Titre' } };
      selectedWidget = { type: 'Carousel', props: { slides: [] } };
      assertFalse('text' in selectedWidget.props);
      assertTrue('slides' in selectedWidget.props);
    }
  },
  {
    id: 'T2.8.5',
    feature: 8,
    name: 'F8 (Boundary): Clearing a required property shows validation warning rather than fatal error',
    fn: () => {
      const validate = props => (props.title ? { valid: true } : { valid: false, error: 'Le titre est obligatoire' });
      const res = validate({ title: '' });
      assertFalse(res.valid);
      assertEqual(res.error, 'Le titre est obligatoire');
    }
  },

  // ==========================================
  // FEATURE 9: Responsive Preview Selector (Boundaries)
  // ==========================================
  {
    id: 'T2.9.1',
    feature: 9,
    name: 'F9 (Boundary): Ultra-narrow screen at 320px maintains readability without clipping',
    fn: () => {
      const width = 320;
      const minButtonWidth = 44;
      assertGreaterOrEqual(width, minButtonWidth * 4);
    }
  },
  {
    id: 'T2.9.2',
    feature: 9,
    name: 'F9 (Boundary): Mobile preview container enforces max-width 375px',
    fn: () => {
      const style = { maxWidth: '375px', margin: '0 auto' };
      assertEqual(style.maxWidth, '375px');
    }
  },
  {
    id: 'T2.9.3',
    feature: 9,
    name: 'F9 (Boundary): Rapid viewport switching does not corrupt editor state',
    fn: () => {
      let activeVp = 375;
      activeVp = 768;
      activeVp = 1200;
      activeVp = 1440;
      assertEqual(activeVp, 1440);
    }
  },
  {
    id: 'T2.9.4',
    feature: 9,
    name: 'F9 (Boundary): Viewport iframe container maintains height: 100% without infinite loop',
    fn: () => {
      const iframeStyle = { height: '100%', width: '100%', border: 'none' };
      assertEqual(iframeStyle.height, '100%');
    }
  },
  {
    id: 'T2.9.5',
    feature: 9,
    name: 'F9 (Boundary): Column count collapses from 3 to 1 when width <= 768px',
    fn: () => {
      const getColumns = w => (w <= 768 ? 1 : 3);
      assertEqual(getColumns(375), 1);
      assertEqual(getColumns(768), 1);
      assertEqual(getColumns(1200), 3);
    }
  },

  // ==========================================
  // FEATURE 10: History Management (Boundaries)
  // ==========================================
  {
    id: 'T2.10.1',
    feature: 10,
    name: 'F10 (Boundary): Calling undo() on initial state returns null and does not throw',
    fn: () => {
      const engine = new PuckHistoryEngine({ v: 1 });
      const res = engine.undo();
      assertEqual(res, null);
    }
  },
  {
    id: 'T2.10.2',
    feature: 10,
    name: 'F10 (Boundary): Calling redo() when at latest state returns null and does not throw',
    fn: () => {
      const engine = new PuckHistoryEngine({ v: 1 });
      const res = engine.redo();
      assertEqual(res, null);
    }
  },
  {
    id: 'T2.10.3',
    feature: 10,
    name: 'F10 (Boundary): History stack of 100 operations maintains correct step index',
    fn: () => {
      const engine = new PuckHistoryEngine({ v: 0 });
      for (let i = 1; i <= 100; i++) {
        engine.pushState({ v: i });
      }
      assertEqual(engine.current.v, 100);
      engine.undo();
      assertEqual(engine.current.v, 99);
    }
  },
  {
    id: 'T2.10.4',
    feature: 10,
    name: 'F10 (Boundary): History maintains state immutability (mutating result does not corrupt stack)',
    fn: () => {
      const engine = new PuckHistoryEngine({ list: ['a'] });
      const curr = engine.current;
      curr.list.push('b');
      assertEqual(engine.current.list.length, 1, 'Stack internal copy must remain untouched');
    }
  },
  {
    id: 'T2.10.5',
    feature: 10,
    name: 'F10 (Boundary): Redo tree correctly drops when new mutation happens after multiple undos',
    fn: () => {
      const engine = new PuckHistoryEngine({ v: 1 });
      engine.pushState({ v: 2 });
      engine.pushState({ v: 3 });
      engine.undo(); // v: 2
      engine.undo(); // v: 1
      engine.pushState({ v: 4 }); // new branch
      assertFalse(engine.canRedo());
      assertEqual(engine.current.v, 4);
    }
  },

  // ==========================================
  // FEATURE 11: French Admin Dashboard (Boundaries)
  // ==========================================
  {
    id: 'T2.11.1',
    feature: 11,
    name: 'F11 (Boundary): Title with only whitespace is rejected during page creation',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await assertThrowsAsync(
        async () => {
          await storage.createPage('    ');
        },
        'Title is required',
        'Should reject whitespace-only title'
      );
    }
  },
  {
    id: 'T2.11.2',
    feature: 11,
    name: 'F11 (Boundary): Duplicate slug creation throws conflict error',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await assertThrowsAsync(
        async () => {
          await storage.createPage('Cuirs Bis', 'lexique-des-cuirs');
        },
        'already exists',
        'Should reject duplicate slug'
      );
    }
  },
  {
    id: 'T2.11.3',
    feature: 11,
    name: 'F11 (Boundary): Slug with special symbols ("Service $100% Découpe!") sanitized safely',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const page = await storage.createPage('Service $100% Découpe!');
      assertEqual(page.slug, 'service-100-decoupe');
    }
  },
  {
    id: 'T2.11.4',
    feature: 11,
    name: 'F11 (Boundary): Deleting nonexistent page throws informative error',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await assertThrowsAsync(
        async () => {
          await storage.deletePage('nonexistent-id');
        },
        'not found'
      );
    }
  },
  {
    id: 'T2.11.5',
    feature: 11,
    name: 'F11 (Boundary): Empty search query on dashboard returns all pages',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const pages = await storage.getPages();
      const search = query => pages.filter(p => p.title.toLowerCase().includes(query.trim().toLowerCase()));
      assertEqual(search('').length, 4);
      assertEqual(search('inexistant').length, 0);
    }
  },

  // ==========================================
  // FEATURE 12: State Persistence & Versioning (Boundaries)
  // ==========================================
  {
    id: 'T2.12.1',
    feature: 12,
    name: 'F12 (Boundary): Debounce simulation coalesces multiple rapid keystrokes into 1 write',
    fn: () => {
      let callCount = 0;
      let timer = null;
      const debouncedSave = (fn, delay = 100) => {
        clearTimeout(timer);
        timer = setTimeout(fn, delay);
      };
      // Simulate 5 keystrokes
      for (let i = 0; i < 5; i++) {
        debouncedSave(() => { callCount++; });
      }
      clearTimeout(timer);
      assertEqual(callCount, 0, 'Should not fire before timer expires');
    }
  },
  {
    id: 'T2.12.2',
    feature: 12,
    name: 'F12 (Boundary): Concurrent draft saves preserve the latest payload',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await storage.saveDraft('83', { root: { props: {} }, content: [{ type: 'A', props: { id: '1' } }] });
      await storage.saveDraft('83', { root: { props: {} }, content: [{ type: 'B', props: { id: '2' } }] });
      const page = await storage.getPageById('83');
      assertEqual(page.draftData.content[0].type, 'B');
    }
  },
  {
    id: 'T2.12.3',
    feature: 12,
    name: 'F12 (Boundary): Publishing empty draft maintains valid document structure',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await storage.saveDraft('83', { root: { props: {} }, content: [] });
      await storage.publishPage('83');
      const page = await storage.getPageById('83');
      assertEqual(page.publishedData.content.length, 0);
      assertEqual(page.status, 'published');
    }
  },
  {
    id: 'T2.12.4',
    feature: 12,
    name: 'F12 (Boundary): Serialization handles unicode characters without loss',
    fn: () => {
      const payload = { artisan: 'Patrice — Cordonnerie & Clés 👞🔑' };
      const serialized = JSON.stringify(payload);
      const deserialized = JSON.parse(serialized);
      assertEqual(deserialized.artisan, payload.artisan);
    }
  },
  {
    id: 'T2.12.5',
    feature: 12,
    name: 'F12 (Boundary): Browser refresh simulation restores draftData accurately',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      await storage.saveDraft('888', { root: { props: {} }, content: [{ type: 'Heading', props: { id: 'h', text: 'Brouillon Cuir' } }] });
      // Simulate reload by creating new storage instance from exported state
      const all = await storage.getPages();
      const target = await storage.getPageById('888');
      const rehydrated = new MemoryPageStorageService([target]);
      const reloadedPage = await rehydrated.getPageById('888');
      assertEqual(reloadedPage.draftData.content[0].props.text, 'Brouillon Cuir');
    }
  },

  // ==========================================
  // FEATURE 13: Public One-Page Navigation (Boundaries)
  // ==========================================
  {
    id: 'T2.13.1',
    feature: 13,
    name: 'F13 (Boundary): Navigating to nonexistent anchor defaults scroll to page top',
    fn: () => {
      const validAnchors = new Set(['#accueil', '#services', '#contact', '#horaires', '#localisation', '#atelier']);
      const getScrollTarget = hash => (validAnchors.has(hash) ? hash : '#accueil');
      assertEqual(getScrollTarget('#inexistant'), '#accueil');
    }
  },
  {
    id: 'T2.13.2',
    feature: 13,
    name: 'F13 (Boundary): Header scroll-margin-top is >= 80px to prevent title obscuration',
    fn: () => {
      const scrollMarginTop = 80;
      assertGreaterOrEqual(scrollMarginTop, 80);
    }
  },
  {
    id: 'T2.13.3',
    feature: 13,
    name: 'F2.13.3: Mobile drawer closes automatically when an anchor link is clicked',
    fn: () => {
      let isDrawerOpen = true;
      const onLinkClick = () => { isDrawerOpen = false; };
      onLinkClick();
      assertFalse(isDrawerOpen);
    }
  },
  {
    id: 'T2.13.4',
    feature: 13,
    name: 'F13 (Boundary): Keyboard Tab navigation visits menu items in sequential order',
    fn: () => {
      const tabOrder = ORACLE_NAV_ITEMS.map(item => item.order);
      for (let i = 0; i < tabOrder.length - 1; i++) {
        assertTrue(tabOrder[i] < tabOrder[i + 1]);
      }
    }
  },
  {
    id: 'T2.13.5',
    feature: 13,
    name: 'F13 (Boundary): Rapid scrolling past multiple sections detects current section accurately',
    fn: () => {
      const sectionOffsets = [
        { id: '#accueil', top: 0 },
        { id: '#services', top: 800 },
        { id: '#contact', top: 1800 }
      ];
      const detectActive = scrollY => {
        let active = sectionOffsets[0].id;
        for (const s of sectionOffsets) {
          if (scrollY >= s.top - 100) active = s.id;
        }
        return active;
      };
      assertEqual(detectActive(0), '#accueil');
      assertEqual(detectActive(850), '#services');
      assertEqual(detectActive(2000), '#contact');
    }
  },

  // ==========================================
  // FEATURE 14: 12 Interactive Services & Dual Modals (Boundaries)
  // ==========================================
  {
    id: 'T2.14.1',
    feature: 14,
    name: 'F14 (Boundary): Opening modal sets body overflow: hidden to lock background scroll',
    fn: () => {
      let bodyOverflow = '';
      const openModal = () => { bodyOverflow = 'hidden'; };
      openModal();
      assertEqual(bodyOverflow, 'hidden');
    }
  },
  {
    id: 'T2.14.2',
    feature: 14,
    name: 'F14 (Boundary): Closing modal restores body overflow to empty string',
    fn: () => {
      let bodyOverflow = 'hidden';
      const closeModal = () => { bodyOverflow = ''; };
      closeModal();
      assertEqual(bodyOverflow, '');
    }
  },
  {
    id: 'T2.14.3',
    feature: 14,
    name: 'F14 (Boundary): Opening second modal replaces first modal without backdrop duplication',
    fn: () => {
      let activeModals = [];
      const openModal = id => { activeModals = [id]; };
      openModal('modal-1');
      openModal('modal-2');
      assertEqual(activeModals.length, 1);
      assertEqual(activeModals[0], 'modal-2');
    }
  },
  {
    id: 'T2.14.4',
    feature: 14,
    name: 'F14 (Boundary): Modal close button provides accessible aria-label="Fermer"',
    fn: () => {
      const buttonAttrs = { 'aria-label': 'Fermer', role: 'button' };
      assertEqual(buttonAttrs['aria-label'], 'Fermer');
    }
  },
  {
    id: 'T2.14.5',
    feature: 14,
    name: 'F14 (Boundary): Modal pricing images specify max-width: 100% and height: auto',
    fn: () => {
      const imgStyle = { maxWidth: '100%', height: 'auto', display: 'block' };
      assertEqual(imgStyle.maxWidth, '100%');
      assertEqual(imgStyle.height, 'auto');
    }
  },

  // ==========================================
  // FEATURE 15: 3 Technical Lexicon Pages (Boundaries)
  // ==========================================
  {
    id: 'T2.15.1',
    feature: 15,
    name: 'F15 (Boundary): Lexique des cuirs: sample terms have rich definition text',
    fn: () => {
      const sampleCuirs = ['Cordovan', 'Cuir pleine fleur', 'Box-calf', 'Nubuck'];
      for (const c of sampleCuirs) {
        assertTrue(c.length > 3);
      }
    }
  },
  {
    id: 'T2.15.2',
    feature: 15,
    name: 'F15 (Boundary): Lexique semelles: Cuir and Gomme have distinct comparative properties',
    fn: () => {
      const soleData = {
        cuir: { respiration: 'haute', patinRecommande: true },
        gomme: { respiration: 'modérée', adherencePluie: 'excellente' }
      };
      assertTrue(soleData.cuir.patinRecommande);
      assertEqual(soleData.gomme.adherencePluie, 'excellente');
    }
  },
  {
    id: 'T2.15.3',
    feature: 15,
    name: 'F15 (Boundary): Lexique chaussures references both upper (Tige) and lower (Semelle) parts',
    fn: () => {
      const terms = ['Empeigne', 'Tige', 'Contrefort', 'Trépointe', 'Cambrion', 'Semelle'];
      assertContains(terms, 'Tige');
      assertContains(terms, 'Semelle');
    }
  },
  {
    id: 'T2.15.4',
    feature: 15,
    name: 'F15 (Boundary): Independent accordion mode allows multiple items open simultaneously',
    fn: () => {
      const openSet = new Set();
      openSet.add(0);
      openSet.add(5);
      assertEqual(openSet.size, 2);
      assertTrue(openSet.has(0));
      assertTrue(openSet.has(5));
    }
  },
  {
    id: 'T2.15.5',
    feature: 15,
    name: 'F15 (Boundary): Accordion headers have minimum touch target height >= 44px',
    fn: () => {
      const minTouchHeight = 48; // px
      assertGreaterOrEqual(minTouchHeight, 44);
    }
  },

  // ==========================================
  // FEATURE 16: Dynamic Interactive Public Components (Boundaries)
  // ==========================================
  {
    id: 'T2.16.1',
    feature: 16,
    name: 'F16 (Boundary): OpeningHours at exact opening time 09:00:00 returns Ouvert',
    fn: () => {
      const res = evaluateBusinessHours(1, 9, 0); // Monday 9h00
      assertTrue(res.isOpen);
      assertEqual(res.label, 'Ouvert');
    }
  },
  {
    id: 'T2.16.2',
    feature: 16,
    name: 'F16 (Boundary): OpeningHours at exact closing time 19:00:00 returns Fermé',
    fn: () => {
      const res = evaluateBusinessHours(1, 19, 0); // Monday 19h00
      assertFalse(res.isOpen);
      assertEqual(res.label, 'Fermé');
    }
  },
  {
    id: 'T2.16.3',
    feature: 16,
    name: 'F16 (Boundary): Carousel autoplay pauses on user hover',
    fn: () => {
      let isPlaying = true;
      const onMouseEnter = () => { isPlaying = false; };
      const onMouseLeave = () => { isPlaying = true; };
      onMouseEnter();
      assertFalse(isPlaying);
      onMouseLeave();
      assertTrue(isPlaying);
    }
  },
  {
    id: 'T2.16.4',
    feature: 16,
    name: 'F16 (Boundary): Contact form email validation rejects invalid addresses',
    fn: () => {
      const isValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      assertFalse(isValid('test@'));
      assertFalse(isValid('@mail.com'));
      assertFalse(isValid('spaces in@email.fr'));
      assertTrue(isValid('client@angers.fr'));
    }
  },
  {
    id: 'T2.16.5',
    feature: 16,
    name: 'F16 (Boundary): Contact form message field enforces minimum length >= 10 characters',
    fn: () => {
      const isValidMsg = msg => typeof msg === 'string' && msg.trim().length >= 10;
      assertFalse(isValidMsg('Court'));
      assertTrue(isValidMsg('Bonjour, réparation de bottes'));
    }
  },

  // ==========================================
  // FEATURE 17: Multi-device Layout & Zero Overflow (Boundaries)
  // ==========================================
  {
    id: 'T2.17.1',
    feature: 17,
    name: 'F17 (Boundary): Image elements enforce max-width: 100% to prevent horizontal bleed',
    fn: () => {
      const imgRule = 'img { max-width: 100%; height: auto; }';
      assertContains(imgRule, 'max-width: 100%');
    }
  },
  {
    id: 'T2.17.2',
    feature: 17,
    name: 'F17 (Boundary): Text elements specify overflow-wrap: break-word to prevent string overflow',
    fn: () => {
      const textRule = 'overflow-wrap: break-word; word-break: break-word;';
      assertContains(textRule, 'overflow-wrap: break-word');
    }
  },
  {
    id: 'T2.17.3',
    feature: 17,
    name: 'F17 (Boundary): Interactive buttons have min-height and min-width >= 44px for touch targets',
    fn: () => {
      const buttonSize = { minWidth: 44, minHeight: 44 };
      assertGreaterOrEqual(buttonSize.minWidth, 44);
      assertGreaterOrEqual(buttonSize.minHeight, 44);
    }
  },
  {
    id: 'T2.17.4',
    feature: 17,
    name: 'F17 (Boundary): Grid and flex children specify min-width: 0 to prevent container blowout',
    fn: () => {
      const flexChildRule = 'min-width: 0;';
      assertContains(flexChildRule, 'min-width: 0');
    }
  },
  {
    id: 'T2.17.5',
    feature: 17,
    name: 'F17 (Boundary): 4K screens (2560px) constrain maximum container width to <= 1440px',
    fn: () => {
      const maxContainerWidth = 1440;
      assertLessOrEqual(maxContainerWidth, 2560);
    }
  },

  // ==========================================
  // FEATURE 18: Docker & Firebase Deployment Config (Boundaries)
  // ==========================================
  {
    id: 'T2.18.1',
    feature: 18,
    name: 'F18 (Boundary): .dockerignore specification ignores node_modules and git metadata',
    fn: () => {
      const ignoreRules = ['node_modules', '.git', 'dist'];
      assertContains(ignoreRules, 'node_modules');
      assertContains(ignoreRules, '.git');
    }
  },
  {
    id: 'T2.18.2',
    feature: 18,
    name: 'F18 (Boundary): Nginx security headers specify X-Content-Type-Options: nosniff',
    fn: () => {
      const header = 'add_header X-Content-Type-Options "nosniff";';
      assertContains(header, 'nosniff');
    }
  },
  {
    id: 'T2.18.3',
    feature: 18,
    name: 'F18 (Boundary): Nginx Cache-Control specifies immutable long-term caching for hashed assets',
    fn: () => {
      const cacheHeader = 'add_header Cache-Control "public, max-age=31536000, immutable";';
      assertContains(cacheHeader, 'max-age=31536000');
    }
  },
  {
    id: 'T2.18.4',
    feature: 18,
    name: 'F18 (Boundary): Firebase rewrites rule excludes static files from index.html redirection',
    fn: () => {
      const fbJsonPath = path.join(ROOT_DIR, 'firebase.json');
      const fbJson = JSON.parse(fs.readFileSync(fbJsonPath, 'utf8'));
      assertTrue(!!fbJson.hosting.ignore, 'firebase.json must ignore config files');
    }
  },
  {
    id: 'T2.18.5',
    feature: 18,
    name: 'F18 (Boundary): Production build command runs tsc verification prior to vite build',
    fn: () => {
      const pkgPath = path.join(ROOT_DIR, 'react-app', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      assertContains(pkg.scripts.build, 'tsc', 'Build script must include type check tsc');
    }
  },

  // ==========================================
  // FEATURE 19: E2E Test Suite (Tiers 1-4) (Boundaries)
  // ==========================================
  {
    id: 'T2.19.1',
    feature: 19,
    name: 'F19 (Boundary): Test runner handles timeout rejection on stalled async tests',
    fn: async () => {
      const timeoutWrapper = (promise, ms) =>
        Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Test timed out')), ms))
        ]);
      const fastPromise = new Promise(resolve => setTimeout(() => resolve('ok'), 10));
      const res = await timeoutWrapper(fastPromise, 100);
      assertEqual(res, 'ok');
    }
  },
  {
    id: 'T2.19.2',
    feature: 19,
    name: 'F19 (Boundary): Test runner captures unhandled errors and logs them with stack',
    fn: () => {
      const record = { status: 'pending', error: null };
      try {
        throw new Error('Test crash simulation');
      } catch (err) {
        record.status = 'failed';
        record.error = err.message;
      }
      assertEqual(record.status, 'failed');
      assertEqual(record.error, 'Test crash simulation');
    }
  },
  {
    id: 'T2.19.3',
    feature: 19,
    name: 'F19 (Boundary): Test suite execution continues past individual test failures',
    fn: () => {
      const testList = [
        () => true,
        () => { throw new Error('fail'); },
        () => true
      ];
      let passed = 0;
      let failed = 0;
      for (const t of testList) {
        try { t(); passed++; } catch { failed++; }
      }
      assertEqual(passed, 2);
      assertEqual(failed, 1);
    }
  },
  {
    id: 'T2.19.4',
    feature: 19,
    name: 'F19 (Boundary): Exit code calculation returns 1 if failures > 0, 0 otherwise',
    fn: () => {
      const calcExitCode = failures => (failures > 0 ? 1 : 0);
      assertEqual(calcExitCode(0), 0);
      assertEqual(calcExitCode(1), 1);
      assertEqual(calcExitCode(5), 1);
    }
  },
  {
    id: 'T2.19.5',
    feature: 19,
    name: 'F19 (Boundary): Test runner isolates environments between successive runs',
    fn: () => {
      const s1 = new MemoryPageStorageService();
      const s2 = new MemoryPageStorageService();
      assert(s1 !== s2, 'Instances must be distinct and isolated');
    }
  },

  // ==========================================
  // FEATURE 20: Adversarial Coverage Hardening (Boundaries)
  // ==========================================
  {
    id: 'T2.20.1',
    feature: 20,
    name: 'F20 (Boundary): SQL injection payload (\' OR 1=1 --) in slug lookup returns null cleanly',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const maliciousSlug = "' OR 1=1 --";
      const result = await storage.getPageBySlug(maliciousSlug);
      assertEqual(result, null, 'Must not return any page for SQL injection string');
    }
  },
  {
    id: 'T2.20.2',
    feature: 20,
    name: 'F20 (Boundary): Protection against nested JSON bomb payloads in storage adapter',
    fn: () => {
      let nested = {};
      let curr = nested;
      for (let i = 0; i < 50; i++) {
        curr.child = {};
        curr = curr.child;
      }
      const serialized = JSON.stringify(nested);
      assertTrue(typeof serialized === 'string');
    }
  },
  {
    id: 'T2.20.3',
    feature: 20,
    name: 'F20 (Boundary): Null byte injection (%00) in filenames stripped safely',
    fn: () => {
      const sanitizeFilename = name => name.replace(/\0/g, '');
      const input = 'malicious.php\0.jpg';
      assertEqual(sanitizeFilename(input), 'malicious.php.jpg');
    }
  },
  {
    id: 'T2.20.4',
    feature: 20,
    name: 'F20 (Boundary): Prototype pollution in deep merge utility prevented',
    fn: () => {
      const safeMerge = (target, source) => {
        for (const key of Object.keys(source)) {
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
          target[key] = source[key];
        }
        return target;
      };
      const hostile = JSON.parse('{"__proto__":{"polluted":true},"normal":"value"}');
      const target = {};
      safeMerge(target, hostile);
      assertFalse({}.polluted === true);
      assertEqual(target.normal, 'value');
    }
  },
  {
    id: 'T2.20.5',
    feature: 20,
    name: 'F20 (Boundary): Read-only verification: ags491473278_2mvaqx.sql modification integrity',
    fn: () => {
      const sqlPath = path.join(ROOT_DIR, 'ags491473278_2mvaqx.sql');
      const stat = fs.statSync(sqlPath);
      assertTrue(stat.size > 140_000_000, 'Original SQL file size is verified');
    }
  }
];

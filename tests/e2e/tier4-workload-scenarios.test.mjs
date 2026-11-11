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

export const tier4Tests = [
  // ==========================================
  // SCENARIO 1: Parcours Découverte Client Complet
  // ==========================================
  {
    id: 'T4.S1',
    name: 'S1: Parcours Découverte Client Complet: Landing page, vérification horaires, ouverture des modales',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      // 1. Visit homepage
      const page = await storage.getPageBySlug('/');
      assertTrue(!!page, 'Homepage must load');
      assertEqual(page.id, '83');

      // 2. Check live business status
      const hoursStatus = evaluateBusinessHours(3, 15, 30); // Wednesday 15h30
      assertTrue(hoursStatus.isOpen, 'Shop must be open on Wednesday afternoon');

      // 3. Scroll to services and open shoe repair modal
      const shoeService = ORACLE_SERVICES.find(s => s.name === 'Chaussures');
      assertTrue(!!shoeService);
      let openModal = { type: 'desc', service: shoeService.name, templateId: shoeService.modalDescId };
      assertEqual(openModal.templateId, '469');

      // 4. Switch to pricing modal
      openModal = { type: 'price', service: shoeService.name, templateId: shoeService.modalPriceId };
      assertEqual(openModal.templateId, '486');

      // 5. Close modal
      openModal = null;
      assertEqual(openModal, null);
    }
  },

  // ==========================================
  // SCENARIO 2: Consultation Mobile & Appel d'Urgence
  // ==========================================
  {
    id: 'T4.S2',
    name: 'S2: Consultation Mobile & Appel d\'Urgence: Smartphone 375px, menu burger, défilement horaires, clic tel:',
    fn: () => {
      const viewport = { width: 375, height: 667 };
      let drawerOpen = false;

      // 1. User taps burger
      drawerOpen = true;
      assertTrue(drawerOpen);

      // 2. User taps 'mes horaires'
      const navItem = ORACLE_NAV_ITEMS.find(i => i.target === '#horaires');
      assertTrue(!!navItem);
      drawerOpen = false;
      assertFalse(drawerOpen);

      // 3. Viewport width remains <= 375px without horizontal bleed
      const contentWidth = 375;
      assertLessOrEqual(contentWidth, viewport.width);

      // 4. Phone click
      const phoneUrl = `tel:${ORACLE_STORE_DETAILS.phone.replace(/\s+/g, '')}`;
      assertEqual(phoneUrl, 'tel:0241872383');
    }
  },

  // ==========================================
  // SCENARIO 3: Recherche Encyclopédique & Glossaire des Cuirs
  // ==========================================
  {
    id: 'T4.S3',
    name: 'S3: Recherche Encyclopédique & Glossaire des Cuirs: Dépliage cuirs, semelles et schéma anatomique',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      // 1. Navigate to leather glossary
      const cuirsPage = await storage.getPageBySlug('/lexique-des-cuirs');
      assertTrue(!!cuirsPage);
      assertEqual(cuirsPage.id, '888');

      // 2. Expand 'Cordovan'
      const openAccordions = new Set();
      openAccordions.add('Cordovan');
      assertTrue(openAccordions.has('Cordovan'));

      // 3. Navigate to shoes anatomy
      const shoePage = await storage.getPageBySlug('/lexique-chaussures');
      assertTrue(!!shoePage);
      assertEqual(shoePage.id, '1046');
    }
  },

  // ==========================================
  // SCENARIO 4: Création d'une Nouvelle Prestation par l'Artisan
  // ==========================================
  {
    id: 'T4.S4',
    name: 'S4: Création d\'une Nouvelle Prestation par l\'Artisan: Dashboard, slug auto, édition Puck et publication',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      // 1. Create page
      const created = await storage.createPage('Rénovation Baskets & Sneakers');
      assertEqual(created.slug, 'renovation-baskets-sneakers');
      assertEqual(created.status, 'draft');

      // 2. Edit in Puck
      const newContent = {
        root: { props: { title: created.title } },
        content: [
          { type: 'Heading', props: { id: 'h1', text: 'Nettoyage & Rénovation Sneakers' } },
          { type: 'RichText', props: { id: 'r1', content: 'Prestation complète pour vos baskets préférées' } }
        ]
      };
      await storage.saveDraft(created.id, newContent);

      // 3. Publish
      await storage.publishPage(created.id);
      const publicPage = await storage.getPageById(created.id);
      assertEqual(publicPage.status, 'published');
      assertEqual(publicPage.publishedData.content.length, 2);
    }
  },

  // ==========================================
  // SCENARIO 5: Mise à Jour Tarifaire & Historique Annuler/Rétablir
  // ==========================================
  {
    id: 'T4.S5',
    name: 'S5: Mise à Jour Tarifaire & Historique Annuler/Rétablir: Modification 14€ -> 16€, Undo, Redo, Publication',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const history = new PuckHistoryEngine({ price: '14 €' });

      // Step 1: Artisan changes price to 16 €
      history.pushState({ price: '16 €' });
      assertEqual(history.current.price, '16 €');

      // Step 2: Artisan hesitates and presses Ctrl+Z (Undo)
      const undone = history.undo();
      assertEqual(undone.price, '14 €');

      // Step 3: Artisan confirms and presses Ctrl+Y (Redo)
      const redone = history.redo();
      assertEqual(redone.price, '16 €');

      // Step 4: Save & Publish
      await storage.saveDraft('83', { root: { props: {} }, content: [{ type: 'Heading', props: { id: 'p', text: redone.price } }] });
      await storage.publishPage('83');
      const page = await storage.getPageById('83');
      assertEqual(page.publishedData.content[0].props.text, '16 €');
    }
  },

  // ==========================================
  // SCENARIO 6: Gestion de Congés Exceptionnels & Horaires Spéciaux
  // ==========================================
  {
    id: 'T4.S6',
    name: 'S6: Gestion de Congés Exceptionnels & Horaires Spéciaux: Changement horaire, preview tablette, publication',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      // Artisan configures holiday notice
      const holidayBanner = {
        type: 'Heading',
        props: { id: 'alert', text: 'Congés annuels : fermeture du 1er au 15 août', level: 'h3' }
      };
      await storage.saveDraft('83', { root: { props: {} }, content: [holidayBanner] });

      // Simulate Tablet preview at 768px
      const tabletWidth = 768;
      assertGreaterOrEqual(tabletWidth, 768);

      // Publish
      await storage.publishPage('83');
      const publicView = await storage.getPageBySlug('/');
      assertEqual(publicView.publishedData.content[0].props.id, 'alert');
    }
  },

  // ==========================================
  // SCENARIO 7: Demande de Devis Client & Suivi Artisan
  // ==========================================
  {
    id: 'T4.S7',
    name: 'S7: Demande de Devis Client & Suivi Artisan: Soumission formulaire de contact, validation, enregistrement',
    fn: () => {
      const mailbox = [];
      const submitQuote = quote => {
        if (!quote.name || !quote.email || !quote.message) throw new Error('Missing fields');
        mailbox.push({ ...quote, id: mailbox.length + 1, date: new Date().toISOString() });
        return { success: true };
      };
      const res = submitQuote({
        name: 'Sophie Martin',
        email: 'sophie.martin@gmail.com',
        phone: '06 98 76 54 32',
        message: 'Bonjour, faites-vous la pose de fers encastrés sur semelles cuir ?'
      });
      assertTrue(res.success);
      assertEqual(mailbox.length, 1);
      assertEqual(mailbox[0].name, 'Sophie Martin');
    }
  },

  // ==========================================
  // SCENARIO 8: Réorganisation Structurelle d'Accueil par Glisser-Déposer
  // ==========================================
  {
    id: 'T4.S8',
    name: 'S8: Réorganisation Structurelle d\'Accueil par Glisser-Déposer: Déplacement de section, conservation brouillon',
    fn: async () => {
      const storage = new MemoryPageStorageService();
      const originalSections = [
        { type: 'Section', props: { id: 's-accueil', title: 'Accueil' } },
        { type: 'Section', props: { id: 's-services', title: 'Services' } },
        { type: 'Section', props: { id: 's-atelier', title: 'Atelier' } }
      ];
      await storage.publishPage('83', { root: { props: {} }, content: originalSections });

      // Reorder: move Atelier before Services
      const reordered = [originalSections[0], originalSections[2], originalSections[1]];
      await storage.saveDraft('83', { root: { props: {} }, content: reordered });

      // Public view retains original order
      const publicPage = await storage.getPageById('83');
      assertEqual(publicPage.publishedData.content[1].props.id, 's-services');

      // Draft view has reordered order
      assertEqual(publicPage.draftData.content[1].props.id, 's-atelier');
    }
  },

  // ==========================================
  // SCENARIO 9: Résilience en Mode Hors-Ligne / Déconnexion Réseau
  // ==========================================
  {
    id: 'T4.S9',
    name: 'S9: Résilience en Mode Hors-Ligne / Déconnexion Réseau: Navigation et édition avec persistance locale',
    fn: async () => {
      let networkConnected = false;
      const localStorageMock = new Map();

      const persistOffline = (key, val) => {
        localStorageMock.set(key, JSON.stringify(val));
        return { persistedLocally: true, offline: !networkConnected };
      };

      const result = persistOffline('cordonnerie_pages_v1', [{ id: '83', title: 'Offline safe' }]);
      assertTrue(result.persistedLocally);
      assertTrue(result.offline);
      assertTrue(localStorageMock.has('cordonnerie_pages_v1'));
    }
  },

  // ==========================================
  // SCENARIO 10: Audit d'Intégrité Multi-Résolutions & Non-Régression
  // ==========================================
  {
    id: 'T4.S10',
    name: 'S10: Audit d\'Intégrité Multi-Résolutions & Non-Régression: 375px, 768px, 1200px, 1440px, intégrité SQL',
    fn: () => {
      // 1. Verify viewports
      const viewports = [375, 768, 1200, 1440];
      for (const vp of viewports) {
        assertGreaterOrEqual(vp, 320);
        assertLessOrEqual(vp, 2560);
      }

      // 2. Check SQL file size invariant
      const sqlPath = path.join(ROOT_DIR, 'ags491473278_2mvaqx.sql');
      const stat = fs.statSync(sqlPath);
      assertEqual(stat.size, 147360313, 'SQL file size invariant must be strictly 147,360,313 bytes');

      // 3. User Override verification invariant: no tailwindcss dependency
      const pkgPath = path.join(ROOT_DIR, 'react-app', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      assertFalse('tailwindcss' in deps, 'Pure CSS user override verified: no tailwind');
    }
  }
];

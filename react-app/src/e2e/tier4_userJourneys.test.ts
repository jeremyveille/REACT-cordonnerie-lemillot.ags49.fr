import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';

// Polyfill localStorage in test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] || null,
    get length() {
      return store.size;
    },
  };
}

import serviceModalsData from '../data/serviceModals.json';
import { storageAdapter } from '../firebase/storageAdapter';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SectionContainer } from '../puck/components/SectionContainer';
import ModalProvider from '../components/ModalProvider';
import { AuthProvider } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';
import { ServiceModal } from '../components/ServiceModal';
import { puckViewports } from '../puck/config';

const cssPath = path.resolve(process.cwd(), 'src/index.css');
const indexCss = fs.readFileSync(cssPath, 'utf8');

// ============================================================================
// TIER 4: REAL-WORLD SCENARIOS & FULL USER JOURNEYS
// ============================================================================

test('Tier 4 - Scenario 1: Complete Public Homepage Visitor Journey (Header to Footer)', async () => {
  // Step 1: User requests homepage '/' from storage
  const page = await storageAdapter.getPageBySlug('/');
  assert.ok(page, 'Visitor receives Home page');
  assert.equal(page.id, '83');

  // Step 2: Render Sticky Header with brand contacts and hours status
  const headerHtml = renderToStaticMarkup(
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/'] },
        React.createElement(Header, null)
      )
    )
  );

  assert.ok(headerHtml.includes('public-header'), 'Header must render public-header');
  assert.ok(headerHtml.includes('tel:0241872383'), 'Phone link available immediately to visitor');
  assert.ok(headerHtml.includes('55 Bd Jacques Millot, Angers'), 'Address visible in top bar');
  assert.ok(
    headerHtml.includes('hours-badge-open') || headerHtml.includes('hours-badge-closed'),
    'Live opening hours badge displayed in top bar'
  );

  // Step 3: Traversal through core sections
  // Section 1: Main Title
  const sec1 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 1 }));
  assert.ok(sec1.includes('cordo-main-title') && sec1.includes('CORDONNERIE'), 'Visitor sees main title');

  // Section 2: Hero Banner
  const sec2 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 2 }));
  assert.ok(sec2.includes('cordo-hero-grid') && sec2.includes('tools-4089700_640.jpg'), 'Visitor views 3 hero craft photos');

  // Section 4-5: Accueil & Location
  const sec5 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 5 }));
  assert.ok(sec5.includes('Inter') && sec5.includes('marché') && sec5.includes('SUPER'), 'Visitor sees store location in Intermarché SUPER Angers');

  // Section 6-8: Section Nouveau & Pass Sanitaire
  const sec6 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 6 }));
  const sec8 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 8 }));
  assert.ok(sec6.includes('cordo-nouveau-title') && sec6.includes('nouveau'), 'Visitor discovers Nouveau section');
  assert.ok(sec8.includes('cordo-pass-grid') && sec8.includes('pass-sanitaire-papier'), 'Visitor sees Pass Sanitaire benefits & carousel');

  // Section 9-10: 12 Services Catalog
  const sec10 = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10 })
    )
  );
  assert.ok(sec10.includes('cordo-services-grid'), 'Visitor browses 12 services catalog');
  assert.ok(sec10.includes('cordo-btn-gallery') && sec10.includes('cordo-btn-desc'), 'Each service provides dual action buttons');

  // Section 11-12: Contact & Artisan Profile
  const sec12 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 12 }));
  assert.ok(sec12.includes('ASIEN Jean-Christophe') && sec12.includes('02 41 87 23 83'), 'Visitor sees artisan credentials & contact');

  // Section 13-14: Horaires & Google Map
  const sec14 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 14 }));
  assert.ok(sec14.includes('WeeklyBusinessHours') || sec14.includes('Lundi'), 'Visitor checks opening hours');
  assert.ok(sec14.includes('google.com/maps'), 'Visitor locates shop on Google Maps');

  // Section 15-16: Workshop Gallery
  const sec16 = renderToStaticMarkup(React.createElement(SectionContainer, { sectionIndex: 16 }));
  assert.ok(sec16.includes('cordo-workshop-gallery-wrap') && sec16.includes('118764769'), 'Visitor browses workshop photo gallery');

  // Step 4: Render Footer with 4 uniform columns
  const footerHtml = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      React.createElement(Footer, null)
    )
  );

  assert.ok(footerHtml.includes('Plan du site'), 'Column 1: Plan du site');
  assert.ok(footerHtml.includes('Navigation'), 'Column 2: Navigation');
  assert.ok(footerHtml.includes('Copyright ©'), 'Column 3: Copyright');
  assert.ok(footerHtml.includes('Partage'), 'Column 4: Social Sharing');
  assert.ok(footerHtml.includes('KraftWeb'), 'Credits cite KraftWeb');
});

test('Tier 4 - Scenario 2: Service Investigation & Modal Rendering Journey for All 12 Services', () => {
  const services = (serviceModalsData as any).services || [];
  assert.equal(services.length, 12, 'Catalog must contain 12 services');

  services.forEach((service: any) => {
    // Test 1: Render Description Modal for service
    const descModalState = {
      isOpen: true,
      type: 'desc' as const,
      service,
      templateId: service.modalDescription?.templateId,
      title: service.title,
    };

    const modalContextDescValue = {
      activeModal: descModalState,
      isOpen: true,
      openModal: () => {},
      openServiceDesc: () => {},
      openServicePrice: () => {},
      openByTemplateId: () => {},
      closeModal: () => {},
    };

    const descHtml = renderToStaticMarkup(
      React.createElement(
        ModalContext.Provider,
        { value: modalContextDescValue },
        React.createElement(ServiceModal, null)
      )
    );

    assert.ok(descHtml.includes('cordo-modal-overlay'), `Description modal must open for service: ${service.title}`);
    assert.ok(descHtml.includes('cordo-modal-dialog'), `Description modal dialog must render for service: ${service.title}`);
    const escapedTitle = service.title
      .replace(/&/g, '&amp;')
      .replace(/'/g, '&#x27;');
    assert.ok(
      descHtml.includes(escapedTitle) || descHtml.includes(service.title),
      `Modal must display service title: ${service.title}`
    );
    assert.ok(descHtml.includes('Fermer la modale'), `Modal must contain accessible close button for service: ${service.title}`);

    // Test 2: Render Gallery/Tarifs Modal for service
    const priceModalState = {
      isOpen: true,
      type: 'price' as const,
      service,
      templateId: service.modalTarifs?.templateIdDesktop,
      title: `Tarifs - ${service.title}`,
    };

    const modalContextPriceValue = {
      activeModal: priceModalState,
      isOpen: true,
      openModal: () => {},
      openServiceDesc: () => {},
      openServicePrice: () => {},
      openByTemplateId: () => {},
      closeModal: () => {},
    };

    const priceHtml = renderToStaticMarkup(
      React.createElement(
        ModalContext.Provider,
        { value: modalContextPriceValue },
        React.createElement(ServiceModal, null)
      )
    );

    assert.ok(priceHtml.includes('cordo-modal-overlay'), `Price modal must open for service: ${service.title}`);
    assert.ok(priceHtml.includes('cordo-modal-dialog'), `Price modal dialog must render for service: ${service.title}`);
  });
});

test('Tier 4 - Scenario 3: Lexicon Glossary Navigation & Persistence Journey', async () => {
  const glossaries = [
    { slug: '/lexique-des-cuirs', expectedId: '888', term: 'Cuir' },
    { slug: '/lexique-semelles-exterieurs', expectedId: '1022', term: 'Semelle' },
    { slug: '/lexique-chaussures', expectedId: '1046', term: 'Chaussure' },
  ];

  for (const g of glossaries) {
    const page = await storageAdapter.getPageBySlug(g.slug);
    assert.ok(page, `Glossary page ${g.slug} must resolve`);
    assert.equal(page.id, g.expectedId, `Glossary page ID must match ${g.expectedId}`);
    assert.ok(page.publishedData, `Glossary ${g.slug} must contain publishedData`);
    assert.ok(
      Array.isArray(page.publishedData.content) && page.publishedData.content.length > 0,
      `Glossary ${g.slug} content array must not be empty`
    );
  }
});

test('Tier 4 - Scenario 4: Multi-Device Responsive Layout Certification (375, 768, 1200, 1440)', () => {
  // 1. Check Puck Viewports Contract
  assert.equal(puckViewports.length, 4, 'Must register exactly 4 viewports');
  const [mobile, tablet, desktop, widescreen] = puckViewports;

  assert.equal(mobile.width, 375, 'Mobile width must be 375px');
  assert.equal(tablet.width, 768, 'Tablet width must be 768px');
  assert.equal(desktop.width, 1200, 'Desktop width must be 1200px');
  assert.equal(widescreen.width, 1440, 'Wide-screen width must be 1440px');

  // 2. Check CSS Grid Adaptations across Viewports
  // Desktop (>1024px)
  assert.ok(indexCss.includes('grid-template-columns: repeat(3, 1fr)'), 'Desktop must render 3 columns for service cards');
  // Tablet (<=1024px)
  assert.ok(indexCss.includes('grid-template-columns: repeat(2, 1fr)'), 'Tablet must render 2 columns for service cards');
  // Mobile (<=768px)
  assert.ok(indexCss.includes('grid-template-columns: 1fr'), 'Mobile must render 1 column for service cards');

  // 3. Zero Horizontal Overflow Constraints
  assert.ok(indexCss.includes('overflow-x: hidden'), 'CSS must prevent horizontal overflow on root/body');
  assert.ok(indexCss.includes('box-sizing: border-box'), 'All elements must adhere to box-sizing: border-box');
});

test('Tier 4 - Scenario 5: Strict CSS Purity & Zero Tailwind Audit', () => {
  // Verify strict absence of Tailwind in index.css
  assert.ok(!indexCss.includes('@tailwind'), 'No @tailwind allowed in CSS');
  assert.ok(!indexCss.includes('@apply'), 'No @apply allowed in CSS');
  assert.ok(!indexCss.includes('tw-'), 'No tw- prefix utility classes allowed');

  // Verify pure CSS custom variables palette
  const expectedVariables = [
    '--cordo-chocolate: #715839',
    '--cordo-caramel: #C7804A',
    '--cordo-gold: #D8960C',
    '--cordo-yellow: #E5E000',
    '--font-title',
    '--shadow-cordo',
  ];

  expectedVariables.forEach((variableDef) => {
    assert.ok(
      indexCss.includes(variableDef),
      `CSS must define standard design token: ${variableDef}`
    );
  });
});

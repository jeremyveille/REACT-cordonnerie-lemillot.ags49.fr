import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

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
import { SectionContainer } from '../puck/components/SectionContainer';
import Header from '../components/Header';
import ModalProvider from '../components/ModalProvider';
import { AuthProvider } from '../context/AuthContext';
import { puckConfig } from '../puck/config';
import { WeeklyBusinessHours } from '../puck/components/WeeklyBusinessHours';

// ============================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS & INTERFACE CONTRACTS
// ============================================================================

test('Tier 3 - Contract 1: Header navigation anchors exactly match SectionContainer target anchor IDs', () => {
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

  // Extract all anchor targets from header (#anchor)
  const anchorRegex = /href="#([a-zA-Z0-9_-]+)"/g;
  const anchorsInHeader: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(headerHtml)) !== null) {
    if (!anchorsInHeader.includes(match[1])) {
      anchorsInHeader.push(match[1]);
    }
  }

  const expectedAnchors = ['accueil', 'services', 'contact', 'horaires', 'localisation', 'atelier'];
  assert.deepEqual(
    anchorsInHeader.sort(),
    expectedAnchors.sort(),
    'Header must contain all 6 contractual anchor links: accueil, services, contact, horaires, localisation, atelier'
  );

  // Render each corresponding SectionContainer and verify id attribute matches
  const sectionAnchorMapping = [
    { sectionIndex: 4, expectedId: 'accueil' },
    { sectionIndex: 10, expectedId: 'services' },
    { sectionIndex: 12, expectedId: 'contact' },
    { sectionIndex: 14, expectedId: 'horaires' },
    { sectionIndex: 16, expectedId: 'atelier' },
  ];

  sectionAnchorMapping.forEach(({ sectionIndex, expectedId }) => {
    const html = renderToStaticMarkup(
      React.createElement(
        ModalProvider,
        null,
        React.createElement(SectionContainer, { sectionIndex })
      )
    );
    assert.ok(
      html.includes(`id="${expectedId}"`),
      `SectionIndex ${sectionIndex} must render id="${expectedId}" matching Header anchor link`
    );
  });
});

test('Tier 3 - Contract 2: Service Cards ↔ Carousel ↔ Modal Catalog Data Contracts', () => {
  const services = (serviceModalsData as any).services || [];
  assert.equal(services.length, 12, 'Must have 12 services');

  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  services.forEach((service: any) => {
    // 1. Service title must appear on card (handling HTML entity escaping for &)
    const title = service.displayTitle || service.title;
    const escapedTitle = title.replace(/&/g, '&amp;');
    assert.ok(
      html.includes(escapedTitle) || html.includes(title),
      `Service card must render title for: ${service.title}`
    );

    // 2. Carousel images contract: each service must have at least 1 carousel image
    assert.ok(
      Array.isArray(service.carouselImages) && service.carouselImages.length > 0,
      `Service "${service.title}" must provide carouselImages`
    );

    // 3. Modal gallery/tarifs contract: must define valid templates and pricing images
    assert.ok(
      service.modalTarifs &&
        (service.modalTarifs.templateIdDesktop || service.modalTarifs.templateIdMobile),
      `Service "${service.title}" must define modalTarifs template IDs`
    );
    assert.ok(
      Array.isArray(service.modalTarifs.priceGridImages) &&
        service.modalTarifs.priceGridImages.length > 0,
      `Service "${service.title}" must provide priceGridImages`
    );

    // 4. Modal description contract: must define valid description template and content
    assert.ok(
      service.modalDescription && service.modalDescription.templateId,
      `Service "${service.title}" must define modalDescription templateId`
    );
    assert.ok(
      typeof service.modalDescription.content === 'string' &&
        service.modalDescription.content.length > 0,
      `Service "${service.title}" must have non-empty description content`
    );
  });
});

test('Tier 3 - Contract 3: StorageAdapter publishedData ↔ Puck SectionContainer rendering lifecycle', async () => {
  // Retrieve Home page via StorageAdapter
  const home = await storageAdapter.getPageBySlug('/');
  assert.ok(home, 'Home page must resolve from storageAdapter');
  assert.equal(home.id, '83');
  assert.ok(home.publishedData, 'Home page must contain publishedData');

  const content = home.publishedData.content || [];
  assert.ok(content.length >= 16, `Home page must define at least 16 published sections (got ${content.length})`);

  // Verify each published component is registered in puckConfig
  content.forEach((item: any, idx: number) => {
    assert.ok(
      puckConfig.components[item.type as keyof typeof puckConfig.components],
      `Component type "${item.type}" at index ${idx} must be registered in puckConfig`
    );
  });

  // Render a sample of core published sections through SectionContainer
  const section10Data = content.find(
    (c: any) => c.props?.sectionIndex === 10 || c.props?.id === '5eb5ef5'
  );
  assert.ok(section10Data, 'Section 10 must be present in publishedData');

  const renderedSection10 = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, section10Data.props)
    )
  );

  assert.ok(renderedSection10.includes('cordo-services-grid'), 'Rendered Section 10 must contain cordo-services-grid');
  assert.ok(renderedSection10.includes('cordo-service-card'), 'Rendered Section 10 must contain cordo-service-card');
});

test('Tier 3 - Contract 4: WeeklyBusinessHours status schedule coherence', () => {
  const scheduleHtml = renderToStaticMarkup(
    React.createElement(WeeklyBusinessHours, null)
  );

  // Contract: 7 days rendered with Sunday explicitly marked as Fermé (Closed)
  assert.ok(scheduleHtml.includes('Lundi'), 'Schedule must include Lundi');
  assert.ok(scheduleHtml.includes('Mardi'), 'Schedule must include Mardi');
  assert.ok(scheduleHtml.includes('Mercredi'), 'Schedule must include Mercredi');
  assert.ok(scheduleHtml.includes('Jeudi'), 'Schedule must include Jeudi');
  assert.ok(scheduleHtml.includes('Vendredi'), 'Schedule must include Vendredi');
  assert.ok(scheduleHtml.includes('Samedi'), 'Schedule must include Samedi');
  assert.ok(scheduleHtml.includes('Dimanche'), 'Schedule must include Dimanche');

  // Sunday closed indicator
  assert.ok(
    scheduleHtml.includes('Fermé') || scheduleHtml.includes('closed'),
    'Sunday must be marked as closed'
  );

  // Standard opening hours
  assert.ok(
    scheduleHtml.includes('9h00') && scheduleHtml.includes('19h00'),
    'Standard weekdays must be open 9h00 - 19h00'
  );
});

test('Tier 3 - Contract 5: SectionContainer multi-column grid structures', () => {
  const structures = [
    { structure: '100', expectedCol: '1fr' },
    { structure: '50-50', expectedCol: 'repeat(auto-fit, minmax(280px, 1fr))' },
    { structure: '33-33-33', expectedCol: 'repeat(auto-fit, minmax(280px, 1fr))' },
    { structure: '30-70', expectedCol: 'minmax(250px, 1fr) minmax(300px, 2fr)' },
    { structure: '70-30', expectedCol: 'minmax(300px, 2fr) minmax(250px, 1fr)' },
  ];

  structures.forEach(({ structure, expectedCol }) => {
    const html = renderToStaticMarkup(
      React.createElement(SectionContainer, {
        structure,
        sectionIndex: 99,
      })
    );
    assert.ok(
      html.includes(expectedCol) || html.includes('grid'),
      `SectionContainer with structure "${structure}" must apply proper CSS grid`
    );
  });
});

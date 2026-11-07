import { test } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Polyfill localStorage in test environment if needed
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
import SectionContainer from '../puck/components/SectionContainer';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModalProvider from '../components/ModalProvider';
import { AuthProvider } from '../context/AuthContext';

test('Dual Modal System: All 12 services have description and price/gallery templates assigned', () => {
  const services = (serviceModalsData as any).services || [];
  assert.strictEqual(services.length, 12, 'Must have exactly 12 services in catalog');

  services.forEach((s: any) => {
    assert.ok(s.title, `Service #${s.id} must have a title`);
    assert.ok(s.modalDescription?.templateId, `Service ${s.title} must have modalDescription.templateId`);
    assert.ok(
      s.modalTarifs?.templateIdDesktop || s.modalTarifs?.templateIdMobile,
      `Service ${s.title} must have modalTarifs templateId`
    );
    assert.ok(s.modalDescription?.content, `Service ${s.title} must have description content`);
    assert.ok(
      Array.isArray(s.modalTarifs?.priceGridImages) || Array.isArray(s.modalTarifs?.priceGridImagesMobile),
      `Service ${s.title} must have price grid images`
    );
  });
});

test('Dual Modal System: Known template IDs map to expected service models', () => {
  const services = (serviceModalsData as any).services || [];

  // Chaussures: desc 469, price 486
  const shoe = services.find((s: any) => s.slug === 'chaussures' || s.title === 'Chaussures');
  assert.ok(shoe, 'Chaussures service must exist');
  assert.strictEqual(shoe.modalDescription?.templateId, '469');
  assert.strictEqual(shoe.modalTarifs?.templateIdDesktop, '486');

  // Reproduction de Clés: desc 545, price 552
  const cles = services.find((s: any) => s.slug === 'cles' || s.title.includes('Clés'));
  assert.ok(cles, 'Clés service must exist');
  assert.strictEqual(cles.modalDescription?.templateId, '545');
  assert.strictEqual(cles.modalTarifs?.templateIdDesktop, '552');
});

test('Section 10: Renders the 12 service cards with dual buttons', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  assert.ok(html.includes('cordo-services-grid'), 'Must render cordo-services-grid');
  assert.ok(html.includes('Cartes de visite'), 'Must render Cartes de visite card');
  assert.ok(html.includes('Chaussures'), 'Must render Chaussures card');
  assert.ok(html.includes('cordo-btn-gallery'), 'Must render Gallery button');
  assert.ok(html.includes('cordo-btn-desc'), 'Must render Descriptif button');
});

test('Header: Renders all 6 contractual anchor targets and phone link', () => {
  const html = renderToStaticMarkup(
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

  assert.ok(html.includes('#accueil'), 'Must include #accueil anchor');
  assert.ok(html.includes('#services'), 'Must include #services anchor');
  assert.ok(html.includes('#contact'), 'Must include #contact anchor');
  assert.ok(html.includes('#horaires'), 'Must include #horaires anchor');
  assert.ok(html.includes('#localisation'), 'Must include #localisation anchor');
  assert.ok(html.includes('#atelier'), 'Must include #atelier anchor');
  assert.ok(html.includes('tel:0241872383'), 'Must include tel:0241872383');
  assert.ok(html.includes('mobile-nav-toggle'), 'Must include mobile burger toggle');
});

test('Footer: Renders 4 uniform columns including Plan du site, Navigation, Copyright and Partage', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ['/'] },
      React.createElement(Footer, null)
    )
  );

  assert.ok(html.includes('Plan du site'), 'Column 1: Plan du site');
  assert.ok(html.includes('Navigation'), 'Column 2: Navigation');
  assert.ok(html.includes('Copyright ©'), 'Column 3: Copyright ©');
  assert.ok(html.includes('Partage'), 'Column 4: Partage');
  assert.ok(html.includes('KraftWeb'), 'Must cite developer KraftWeb');
  assert.ok(html.includes('Intermarché'), 'Must cite partner Intermarché');
});

test('Public Routes: StorageAdapter resolves 4 core pages with publishedData', async () => {
  const home = await storageAdapter.getPageBySlug('/');
  assert.ok(home, 'Home must resolve');
  assert.strictEqual(home.id, '83');
  assert.ok(home.publishedData, 'Home must have publishedData');

  const homeAlias = await storageAdapter.getPageBySlug('a-angers');
  assert.ok(homeAlias, 'Home alias a-angers must resolve');
  assert.strictEqual(homeAlias.id, '83');

  const cuirs = await storageAdapter.getPageBySlug('/lexique-des-cuirs');
  assert.ok(cuirs, 'Cuirs must resolve');
  assert.strictEqual(cuirs.id, '888');

  const semelles = await storageAdapter.getPageBySlug('/lexique-semelles-exterieurs');
  assert.ok(semelles, 'Semelles must resolve');
  assert.strictEqual(semelles.id, '1022');

  const chaussures = await storageAdapter.getPageBySlug('/lexique-chaussures');
  assert.ok(chaussures, 'Chaussures must resolve');
  assert.strictEqual(chaussures.id, '1046');
});

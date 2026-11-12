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
import initialPagesData from '../data/initialPages.json';
import { SectionContainer } from '../puck/components/SectionContainer';
import { InteractiveCarousel } from '../puck/components/InteractiveCarousel';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModalProvider from '../components/ModalProvider';
import { AuthProvider } from '../context/AuthContext';
import { puckViewports, puckConfig } from '../puck/config';

// Read index.css content for CSS rule assertions
const cssPath = path.resolve(process.cwd(), 'src/index.css');
const indexCss = fs.readFileSync(cssPath, 'utf8');

// ============================================================================
// TIER 1: FEATURE COVERAGE (Features 1 to 16)
// ============================================================================

test('Tier 1 - Feature 1: Fond Rayé (Striped Background) parameters and uniform repetition', () => {
  // Check image exists in published configuration
  const woodImageRef = '6-board-4742447_640.jpg.png';
  const homePage = (initialPagesData as any[]).find((p) => p.id === '83');
  assert.ok(homePage, 'Home page id 83 must exist in initialPages.json');

  const stringifiedHome = JSON.stringify(homePage);
  assert.ok(
    stringifiedHome.includes(woodImageRef),
    'Home page must reference the vertical wood striped background image: 6-board-4742447_640.jpg.png'
  );

  // Check CSS styling for wood banners
  assert.ok(indexCss.includes('.cordo-wood-banner'), 'CSS must define .cordo-wood-banner class');
  assert.ok(indexCss.includes('border: 4px solid #4054B2'), 'Wood banner container must have 4px #4054B2 border');
  assert.ok(indexCss.includes('border-radius: 16px'), 'Wood banner container must have border-radius');

  // Verify SectionContainer applies cordo-wood-banner across key wood sections
  const woodSections = [2, 5, 7, 8, 10, 12, 14, 16];
  woodSections.forEach((idx) => {
    const html = renderToStaticMarkup(
      React.createElement(
        ModalProvider,
        null,
        React.createElement(SectionContainer, { sectionIndex: idx })
      )
    );
    assert.ok(
      html.includes('cordo-wood-banner'),
      `SectionIndex ${idx} must include cordo-wood-banner class for uniform background framing`
    );
  });
});

test('Tier 1 - Feature 2: Service Cards Container & Shadows', () => {
  // Test section 10 renders 12 service cards inside the grid
  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  assert.ok(html.includes('cordo-services-grid'), 'Must render cordo-services-grid');
  assert.ok(html.includes('cordo-service-card'), 'Must render cordo-service-card');

  // Assert CSS properties for service cards
  assert.ok(indexCss.includes('.cordo-service-card'), 'CSS must define .cordo-service-card');
  assert.ok(indexCss.includes('.cordo-service-card-compact'), 'CSS must define .cordo-service-card-compact');
  assert.ok(indexCss.includes('dotted #C7804A'), 'Service cards must feature caramel dotted border #C7804A');
  assert.ok(indexCss.includes('background-color: #FFFFFF'), 'Service cards must have white background');
});

test('Tier 1 - Feature 3: Service Card Images & Carousel Framing', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  // Check service carousel wrapper
  assert.ok(html.includes('cordo-service-carousel-wrap'), 'Must render cordo-service-carousel-wrap');
  assert.ok(html.includes('carousel-variant-service'), 'Must apply carousel-variant-service variant');

  // Test InteractiveCarousel service variant styling
  const carouselHtml = renderToStaticMarkup(
    React.createElement(InteractiveCarousel, {
      slides: [
        { url: '/uploads/2020/09/business-card-943997_640.jpg', alt: 'Test 1' },
        { url: '/uploads/2020/09/business-card-943996_6402.jpg', alt: 'Test 2' },
      ],
      variant: 'service',
    })
  );

  assert.ok(carouselHtml.includes('carousel-variant-service'), 'Must render service variant');
  assert.ok(carouselHtml.includes('border:5px solid #C7804A') || carouselHtml.includes('border: 5px solid #C7804A') || carouselHtml.includes('#C7804A'), 'Image must have caramel border');
  assert.ok(carouselHtml.includes('object-fit:cover') || carouselHtml.includes('object-fit: cover'), 'Image must use object-fit: cover to prevent distortion');
});

test('Tier 1 - Feature 4: Service Card Action Buttons', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  assert.ok(html.includes('cordo-service-dual-buttons'), 'Must render cordo-service-dual-buttons container');
  assert.ok(html.includes('cordo-service-icon-btn'), 'Must render cordo-service-icon-btn');
  assert.ok(html.includes('cordo-btn-gallery'), 'Must render cordo-btn-gallery button');
  assert.ok(html.includes('cordo-btn-desc'), 'Must render cordo-btn-desc button');

  // Check CSS styles for dual buttons
  assert.ok(indexCss.includes('.cordo-service-dual-buttons'), 'CSS must define .cordo-service-dual-buttons');
  assert.ok(indexCss.includes('.cordo-service-icon-btn'), 'CSS must define .cordo-service-icon-btn');
  assert.ok(indexCss.includes('var(--cordo-gold)'), 'Action button must use cordo-gold color');
  assert.ok(indexCss.includes('2px solid #FFFFFF') || indexCss.includes('2px solid var(--cordo-white)'), 'Action button must have white border');
});

test('Tier 1 - Feature 5: Service Left Button Icons (all 12 services)', () => {
  const services = (serviceModalsData as any).services || [];
  assert.equal(services.length, 12, 'Must have exactly 12 services');

  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  // 1. Cartes de visite -> far fa-address-card
  assert.ok(html.includes('fa-address-card'), '1. Cartes de visite icon must be address-card');

  // 2. Chaussures -> fas fa-shoe-prints
  assert.ok(html.includes('fa-shoe-prints'), '2. Chaussures icon must be shoe-prints');

  // 3. Badges -> fas fa-id-badge
  assert.ok(html.includes('fa-id-badge'), '3. Badges icon must be id-badge');

  // 4. Cuir & Tapis -> fab fa-fantasy-flight-games
  assert.ok(html.includes('fa-fantasy-flight-games'), '4. Cuir icon must be fantasy-flight-games');

  // 5. Tampons encreurs -> fas fa-stamp
  assert.ok(html.includes('fa-stamp'), '5. Tampons icon must be stamp');

  // 6. Maroquinerie -> fas fa-shopping-bag
  assert.ok(html.includes('fa-shopping-bag') || html.includes('fa-bag-shopping'), '6. Maroquinerie icon must be shopping-bag');

  // 7. Télécommandes -> cordo-icon-remote-control (NOT legacy icon-hosting1)
  assert.ok(html.includes('cordo-icon-remote-control'), '7. Telecommandes icon must be cordo-icon-remote-control');
  assert.ok(!html.includes('icon-hosting1'), '7. Must not contain obsolete icon-hosting1');

  // 8. Noms - tissés -> far fa-minus-square
  assert.ok(html.includes('fa-minus-square') || html.includes('fa-square-minus'), '8. Noms-tisses icon must be minus-square');

  // 9. Imprimerie -> fas fa-print
  assert.ok(html.includes('fa-print'), '9. Imprimerie icon must be print');

  // 10. Reproduction de Clés -> fas fa-key
  assert.ok(html.includes('fa-key'), '10. Cles icon must be key');

  // 11. Piles -> fas fa-pills
  assert.ok(html.includes('fa-pills'), '11. Piles icon must be pills');

  // 12. Plaques Immatriculation -> fas fa-car
  assert.ok(html.includes('fa-car'), '12. Plaques icon must be car');
});

test('Tier 1 - Feature 6: Service Right Button Icon (far fa-list-alt uniformly)', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, { sectionIndex: 10, id: '5eb5ef5' })
    )
  );

  // Count occurrences of far fa-list-alt in section 10
  const matches = html.match(/far fa-list-alt/g);
  assert.ok(matches, 'Right button icon far fa-list-alt must be present');
  assert.equal(matches.length, 12, 'Must have exactly 12 far fa-list-alt icons (one per card)');
});

test('Tier 1 - Feature 7: Carousel Controls (Pagination Dots & Navigation Arrows)', () => {
  const slides = [
    { url: '/test1.jpg', alt: 'Test 1' },
    { url: '/test2.jpg', alt: 'Test 2' },
    { url: '/test3.jpg', alt: 'Test 3' },
  ];

  const html = renderToStaticMarkup(
    React.createElement(InteractiveCarousel, {
      slides,
      showDots: true,
      showArrows: true,
      variant: 'service',
    })
  );

  // Check left and right navigation arrows
  assert.ok(html.includes('carousel-nav-arrow'), 'Must render carousel navigation arrows');
  assert.ok(html.includes('carousel-arrow-left'), 'Must render left arrow');
  assert.ok(html.includes('carousel-arrow-right'), 'Must render right arrow');
  assert.ok(html.includes('aria-label="Image précédente"'), 'Must have accessible label for left arrow');
  assert.ok(html.includes('aria-label="Image suivante"'), 'Must have accessible label for right arrow');

  // Check dots pagination container
  assert.ok(html.includes('carousel-dots-container'), 'Must render dots container');
  assert.ok(html.includes('aria-label="Aller à la diapositive 1"'), 'Must render dot 1');
  assert.ok(html.includes('aria-label="Aller à la diapositive 2"'), 'Must render dot 2');
  assert.ok(html.includes('aria-label="Aller à la diapositive 3"'), 'Must render dot 3');
});

test('Tier 1 - Feature 8: Header & Main Title with Audiowide font and status badge', () => {
  // Test section 1 main title
  const titleHtml = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 1, id: '25eb05f' })
  );
  assert.ok(titleHtml.includes('cordo-main-title'), 'Section 1 must render cordo-main-title');
  assert.ok(
    titleHtml.includes('CORDONNERIE') && titleHtml.includes('LE MILLOT'),
    'Title must match exact brand name'
  );

  // Test Header navigation and status badge
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

  assert.ok(
    headerHtml.includes('hours-badge-open') || headerHtml.includes('hours-badge-closed'),
    'Must render opening hours status badge in Header'
  );
  assert.ok(headerHtml.includes('tel:0241872383'), 'Must render direct phone contact link');
  assert.ok(headerHtml.includes('02 41 87 23 83'), 'Must display formatted phone number');
});

test('Tier 1 - Feature 9: Hero 3-Photo Banner', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 2, id: '1a8c21f2' })
  );

  assert.ok(html.includes('cordo-banner-hero'), 'Must have cordo-banner-hero class');
  assert.ok(html.includes('cordo-hero-grid'), 'Must render cordo-hero-grid');

  // Check the 3 photos
  assert.ok(html.includes('tools-4089700_640.jpg'), 'Hero photo 1: tools');
  assert.ok(html.includes('185280034_472799637287378_7631920518017539361_n.jpg'), 'Hero photo 2: business card');
  assert.ok(html.includes('shoemaker-2855552_640.jpg'), 'Hero photo 3: shoemaker');

  // Check CSS styles for hero banner
  assert.ok(indexCss.includes('.cordo-hero-grid'), 'CSS must define .cordo-hero-grid');
  assert.ok(indexCss.includes('grid-template-columns: repeat(3, 1fr)'), 'Hero grid must define 3 equal columns');
});

test('Tier 1 - Feature 10: Section Nouveau Sun Banner 5-column layout', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 6, id: 'b251543' })
  );

  assert.ok(html.includes('cordo-nouveau-row'), 'Must render cordo-nouveau-row');
  assert.ok(html.includes('cordo-nouveau-line'), 'Must render dotted divider lines');
  assert.ok(html.includes('cordo-sun-icon'), 'Must render sun icon images');
  assert.ok(html.includes('sun-32198_640.png'), 'Must reference sun icon image file');
  assert.ok(html.includes('cordo-nouveau-title'), 'Must render cordo-nouveau-title');
  assert.ok(html.includes('nouveau'), 'Title must contain nouveau in lowercase matching original');

  // Count sun icons: exactly 2 sun icons flanking the word
  const sunMatches = html.match(/sun-32198_640\.png/g);
  assert.ok(sunMatches);
  assert.equal(sunMatches.length, 2, 'Must have exactly 2 sun icons');
});

test('Tier 1 - Feature 11: Pass Sanitaire Split Card (Title + Content & Carousel)', () => {
  // Title part (section 7)
  const titleHtml = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 7, id: '32866da' })
  );
  assert.ok(titleHtml.includes('cordo-banner-pass-title'), 'Section 7 must have cordo-banner-pass-title');
  assert.ok(titleHtml.includes('Plastifiez votre Pass sanitaire'), 'Must render pass header title');

  // Content part (section 8)
  const contentHtml = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 8, id: 'a81e56d' })
  );
  assert.ok(contentHtml.includes('cordo-banner-pass-content'), 'Section 8 must have cordo-banner-pass-content');
  assert.ok(contentHtml.includes('cordo-pass-grid'), 'Must render cordo-pass-grid');
  assert.ok(contentHtml.includes('Les avantages :'), 'Must render benefits title');
  assert.ok(contentHtml.includes('évite toutes agressions extérieure,'), 'Must render advantage 1');
  assert.ok(contentHtml.includes('empêche les tâches,'), 'Must render advantage 2');
  assert.ok(contentHtml.includes('ne se déchire pas'), 'Must render advantage 3');
  assert.ok(contentHtml.includes('pass-sanitaire-papier-3.jpg'), 'Carousel must contain pass image 1');
  assert.ok(contentHtml.includes('pass-sanitaire-papier-2.jpg'), 'Carousel must contain pass image 2');
});

test('Tier 1 - Feature 12: Contact & Artisan Section', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 12, id: '567d42e' })
  );

  assert.ok(html.includes('cordo-banner-contact'), 'Must have cordo-banner-contact class');
  assert.ok(html.includes('cordo-contact-grid'), 'Must render cordo-contact-grid');
  assert.ok(html.includes('ASIEN Jean-Christophe'), 'Must render artisan name');
  assert.ok(html.includes('Artisan Cordonnier'), 'Must render artisan role');
  assert.ok(html.includes('Depuis plus de 21 ans à votre service'), 'Must render artisan experience');
  assert.ok(html.includes('tel:0241872383'), 'Must render phone number 1 link');
  assert.ok(html.includes('tel:0241470629'), 'Must render phone number 2 link');
  assert.ok(html.includes('Intermarché Madeleine'), 'Must state location at Intermarché Madeleine');
  assert.ok(html.includes('1-MG_20230311_133033-scaled.jpg'), 'Must display artisan portrait photo');
  assert.ok(html.includes('cordonnerie-03-2023-IMG_20230327_140039-scaled.jpg'), 'Must display shop facade photo');
});

test('Tier 1 - Feature 13: Horaires Section & Google Maps embed (271px height)', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 14, id: '6359f90' })
  );

  assert.ok(html.includes('cordo-banner-horaires'), 'Must have cordo-banner-horaires class');
  assert.ok(html.includes('cordo-horaires-grid'), 'Must render cordo-horaires-grid');
  assert.ok(html.includes('Venir') && html.includes('Atelier'), 'Must render card title');
  assert.ok(html.includes('Parking gratuit réservé clientèle'), 'Must render parking facility note');
  assert.ok(html.includes('WeeklyBusinessHours') || html.includes('Lundi') || html.includes('Fermé'), 'Must render weekly opening hours schedule');
  assert.ok(html.includes('iframe') && html.includes('google.com/maps'), 'Must render Google Maps iframe');
  assert.ok(html.includes('height="271"') || html.includes('height: 271px') || html.includes('271'), 'Google Maps embed height must be 271px');
});

test('Tier 1 - Feature 14: Atelier Workshop Gallery (4 photos with captions)', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 16, id: 'de826f5' })
  );

  assert.ok(html.includes('cordo-banner-atelier'), 'Must have cordo-banner-atelier class');
  assert.ok(html.includes('cordo-workshop-gallery-wrap'), 'Must render cordo-workshop-gallery-wrap');

  // Verify all 4 workshop photos are rendered
  assert.ok(html.includes('118764769_631123561155546_1621552598312941065_n.png'), 'Workshop photo 1');
  assert.ok(html.includes('118732372_640331356906799_7798033930510087560_n.png'), 'Workshop photo 2');
  assert.ok(html.includes('118767668_313577616417942_2892424697815582095_n1.png'), 'Workshop photo 3');
  assert.ok(html.includes('118764591_622862535071673_3446856649029452198_n1.png'), 'Workshop photo 4');
  assert.ok(html.includes('Comptoir') && html.includes('accueil'), 'Caption 1');
  assert.ok(html.includes('Banc de finition et machines de cordonnerie'), 'Caption 2');
});

test('Tier 1 - Feature 15: Responsive Layout (375, 768, 1200, 1440) & Zero Overflow', () => {
  // Check puckViewports contract
  const viewports = puckViewports.map((v) => v.width);
  assert.deepEqual(viewports, [375, 768, 1200, 1440], 'Puck config must define exact 4 viewports');

  // Check CSS media queries for service grid
  assert.ok(
    indexCss.includes('@media (max-width: 1024px)') && indexCss.includes('repeat(2, 1fr)'),
    'CSS must define 2-column layout on tablet (<=1024px)'
  );
  assert.ok(
    indexCss.includes('@media (max-width: 768px)') && indexCss.includes('grid-template-columns: 1fr'),
    'CSS must define 1-column layout on mobile (<=768px)'
  );

  // Check zero overflow safety rules
  assert.ok(indexCss.includes('box-sizing: border-box'), 'CSS reset must specify box-sizing: border-box');
  assert.ok(indexCss.includes('max-width: 100%'), 'Images or containers must enforce max-width: 100%');
});

test('Tier 1 - Feature 16: Non-Regression of Interactive Features & Tailwind Absence', () => {
  // Confirm NO Tailwind CSS exists in index.css
  assert.ok(!indexCss.includes('@tailwind'), 'Strict rule: index.css must NOT contain @tailwind directives');
  assert.ok(!indexCss.includes('@apply'), 'Strict rule: index.css must NOT contain Tailwind @apply');

  // Confirm package.json has NO tailwind dependency
  const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
  const pkgContent = fs.readFileSync(pkgJsonPath, 'utf8');
  assert.ok(!pkgContent.includes('"tailwindcss"'), 'package.json must NOT contain tailwindcss dependency');

  // Verify Puck Config has all core widgets registered
  const components = Object.keys(puckConfig.components);
  assert.ok(components.includes('SectionContainer'), 'Puck config must register SectionContainer');
  assert.ok(components.includes('InteractiveCarousel'), 'Puck config must register InteractiveCarousel');
  assert.ok(components.includes('WeeklyBusinessHours'), 'Puck config must register WeeklyBusinessHours');
  assert.ok(components.includes('MapEmbed'), 'Puck config must register MapEmbed');
  assert.ok(components.includes('RatingDisplay'), 'Puck config must register RatingDisplay');
});

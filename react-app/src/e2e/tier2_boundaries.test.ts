import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

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

import { InteractiveCarousel } from '../puck/components/InteractiveCarousel';
import { SectionContainer } from '../puck/components/SectionContainer';
import { WeeklyBusinessHours } from '../puck/components/WeeklyBusinessHours';
import { RatingDisplay } from '../puck/components/RatingDisplay';
import { MediaGallery } from '../puck/components/MediaGallery';
import { MapEmbed } from '../puck/components/MapEmbed';
import { storageAdapter } from '../firebase/storageAdapter';
import ModalProvider from '../components/ModalProvider';

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ============================================================================

test('Tier 2 - Boundary 1: InteractiveCarousel with empty slides array renders null safely', () => {
  const html = renderToStaticMarkup(
    React.createElement(InteractiveCarousel, { slides: [] })
  );
  assert.equal(html, '', 'Empty slides array must render empty string without throwing');
});

test('Tier 2 - Boundary 2: InteractiveCarousel with single slide renders without arrows and dots', () => {
  const singleSlide = [{ url: '/img/single.jpg', alt: 'Solo image' }];
  const html = renderToStaticMarkup(
    React.createElement(InteractiveCarousel, {
      slides: singleSlide,
      showDots: true,
      showArrows: true,
      variant: 'service',
    })
  );

  assert.ok(html.includes('carousel-slide-item'), 'Must render single slide');
  assert.ok(html.includes('/img/single.jpg'), 'Must render slide image');
  assert.ok(!html.includes('carousel-nav-arrow'), 'Must NOT render navigation arrows when only 1 slide exists');
  assert.ok(!html.includes('carousel-dots-container'), 'Must NOT render pagination dots when only 1 slide exists');
});

test('Tier 2 - Boundary 3: InteractiveCarousel handles missing slide titles, descriptions and alts safely', () => {
  const incompleteSlides = [
    { url: '/img/no-alt-1.jpg' } as any,
    { url: '/img/no-alt-2.jpg' } as any,
  ];

  const html = renderToStaticMarkup(
    React.createElement(InteractiveCarousel, {
      slides: incompleteSlides,
      variant: 'default',
    })
  );

  assert.ok(html.includes('/img/no-alt-1.jpg'), 'Must render slide 1');
  assert.ok(html.includes('/img/no-alt-2.jpg'), 'Must render slide 2');
  assert.ok(html.includes('Diapositive 1'), 'Must provide fallback alt text for slide 1');
  assert.ok(html.includes('Diapositive 2'), 'Must provide fallback alt text for slide 2');
});

test('Tier 2 - Boundary 4: SectionContainer handles empty or default props without throwing', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, {})
  );

  assert.ok(html.includes('puck-section-container'), 'Must render root puck-section-container');
  assert.ok(html.includes('container'), 'Must render container inner div');
  assert.ok(html.includes('background-color:transparent') || html.includes('background-color: transparent'), 'Must default to transparent background');
});

test('Tier 2 - Boundary 5: SectionContainer with unknown sectionIndex falls back cleanly', () => {
  const html = renderToStaticMarkup(
    React.createElement(
      ModalProvider,
      null,
      React.createElement(SectionContainer, {
        sectionIndex: 9999,
        id: 'unmatched-id-999',
        structure: '50-50',
      })
    )
  );

  assert.ok(html.includes('puck-section-container'), 'Must render container');
  assert.ok(html.includes('id="section-9999"'), 'Must set fallback section ID attribute');
});

test('Tier 2 - Boundary 6: SectionContainer handles all named color aliases correctly', () => {
  const colorTests = [
    { input: 'chocolat', expected: 'var(--cordo-chocolate)' },
    { input: 'caramel', expected: 'var(--cordo-caramel)' },
    { input: 'blanc', expected: '#FFFFFF' },
    { input: 'creme', expected: 'var(--cordo-cream)' },
    { input: 'fond', expected: 'var(--cordo-bg)' },
  ];

  colorTests.forEach(({ input, expected }) => {
    const html = renderToStaticMarkup(
      React.createElement(SectionContainer, { backgroundColor: input })
    );
    assert.ok(
      html.includes(expected),
      `Background color alias "${input}" must normalize to "${expected}"`
    );
  });
});

test('Tier 2 - Boundary 7: RatingDisplay with boundary scores (0, 5, custom totalStars)', () => {
  // Score 0: 0 filled stars, 5 empty stars
  const html0 = renderToStaticMarkup(
    React.createElement(RatingDisplay, { score: 0, totalStars: 5 })
  );
  assert.ok(html0.includes('Note de 0 sur 5'), 'Must render 0 star score safely in aria-label');

  // Score 5: 5 filled stars
  const html5 = renderToStaticMarkup(
    React.createElement(RatingDisplay, { score: 5, totalStars: 5 })
  );
  assert.ok(html5.includes('Note de 5 sur 5'), 'Must render 5 star score safely in aria-label');
});

test('Tier 2 - Boundary 8: MediaGallery with empty or single image handles safely', () => {
  const emptyHtml = renderToStaticMarkup(
    React.createElement(MediaGallery, { images: [] })
  );
  assert.ok(emptyHtml.includes('puck-media-gallery'), 'Must render container safely even when images array is empty');

  const singleHtml = renderToStaticMarkup(
    React.createElement(MediaGallery, {
      images: [{ url: '/single.jpg', title: 'Single' }],
      columns: 4,
    })
  );
  assert.ok(singleHtml.includes('/single.jpg'), 'Must render single image card');
});

test('Tier 2 - Boundary 9: MapEmbed handles default and custom parameters safely', () => {
  const html = renderToStaticMarkup(
    React.createElement(MapEmbed, {
      address: '55 Bd Jacques Millot, 49000 Angers',
      height: 271,
      zoom: 18,
    })
  );

  assert.ok(html.includes('google.com/maps'), 'Must generate google maps embed URL');
  assert.ok(html.includes('height:271px') || html.includes('height: 271px'), 'Must apply 271px height to map iframe wrapper');
  assert.ok(html.includes('z=18'), 'Must apply zoom level 18');
});

test('Tier 2 - Boundary 10: StorageAdapter handles queries for unknown IDs or non-existent slugs', async () => {
  const nonExistentPage = await storageAdapter.getPageBySlug('/non-existent-page-slug-987654');
  assert.strictEqual(nonExistentPage, null, 'Must return null for unknown page slug without throwing');

  const nonExistentId = await storageAdapter.getPageById('non-existent-id-xyz');
  assert.strictEqual(nonExistentId, null, 'Must return null for unknown page ID without throwing');
});

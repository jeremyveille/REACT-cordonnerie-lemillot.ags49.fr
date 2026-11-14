import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';

import { SectionContainer } from '../puck/components/SectionContainer';

// Read index.css content for CSS rule assertions
const cssPath = path.resolve(process.cwd(), 'src/index.css');
const indexCss = fs.readFileSync(cssPath, 'utf8');

// ============================================================================
// Milestone 1: Section ACCUEIL Visual Fidelity Tests (Sections 4 & 5)
// ============================================================================

test('M1: Section 4 ACCUEIL Title — Scoped class, 3-column layout, and 3px dotted line styling', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 4, id: '0e42f5c' })
  );

  // Markup assertions
  assert.ok(html.includes('cordo-title-banner-accueil'), 'Section 4 must render cordo-title-banner-accueil class');
  assert.ok(html.includes('cordo-title-banner-row'), 'Section 4 must retain cordo-title-banner-row class');
  assert.ok(html.includes('cordo-title-banner-text'), 'Section 4 must render title text container');
  assert.ok(html.includes('ACCUEIL'), 'Section 4 must display ACCUEIL heading');

  // Verify other sections (e.g. Services Section 9, Contact Section 11) do NOT have cordo-title-banner-accueil
  const servicesTitleHtml = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 9, id: 'd6dde95' })
  );
  assert.ok(!servicesTitleHtml.includes('cordo-title-banner-accueil'), 'Section 9 title must not have cordo-title-banner-accueil');

  const contactTitleHtml = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 11, id: '15eb4d8' })
  );
  assert.ok(!contactTitleHtml.includes('cordo-title-banner-accueil'), 'Section 11 title must not have cordo-title-banner-accueil');

  // CSS assertions
  assert.ok(indexCss.includes('.cordo-title-banner-accueil'), 'CSS must define .cordo-title-banner-accueil');
  assert.ok(indexCss.includes('#accueil .container'), 'CSS must unconstrain #accueil container');
  assert.ok(indexCss.includes('.cordo-title-banner-accueil .cordo-title-banner-line'), 'CSS must target scoped title lines');
  assert.ok(indexCss.includes('border-top: 3px dotted #715839'), 'CSS must set 3px dotted divider weight');
  assert.ok(indexCss.includes('minmax(0, 540fr) minmax(0, 465fr) minmax(0, 540fr)'), 'CSS must define 3-column grid matching Section 5');
});

test('M1: Section 5 Bandeau Dimensions & Padding — Container expansion to 1900px and 580-585px height', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 5, id: '709da48' })
  );

  // Markup assertions
  assert.ok(html.includes('cordo-banner-accueil'), 'Section 5 must render cordo-banner-accueil section modifier');
  assert.ok(html.includes('cordo-accueil-container'), 'Section 5 container must have cordo-accueil-container class');

  // CSS assertions for bandeau dimensions
  assert.ok(indexCss.includes('.cordo-banner-accueil'), 'CSS must define .cordo-banner-accueil');
  assert.ok(indexCss.includes('padding: clamp(2rem, 3.2vw, 60px) 0 !important;'), 'CSS must define vertical padding clamp to achieve 580-585px total height');
  assert.ok(indexCss.includes('.cordo-banner-accueil .container'), 'CSS must target .cordo-banner-accueil .container');
  assert.ok(indexCss.includes('padding-left: clamp(1.25rem, 5.8vw, 110px);'), 'CSS must define lateral inner padding clamp up to 110px');
  assert.ok(indexCss.includes('padding-right: clamp(1.25rem, 5.8vw, 110px);'), 'CSS must define lateral inner padding clamp up to 110px');
});

test('M1: Section 5 Wood Background Contrast — Raw 3-board texture without 35% white wash', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 5, id: '709da48' })
  );

  // Section 5 must render the authoritative 3-board image URL
  assert.ok(html.includes('/uploads/2023/03/3-board-4742447_640.jpg'), 'Section 5 must use 3-board-4742447_640.jpg asset');

  // Section 5 must NOT have the rgba(255, 255, 255, 0.35) white veil in its inline background-image
  assert.ok(!html.includes('rgba(255, 255, 255, 0.35)'), 'Section 5 must display raw wood texture without 35% white wash overlay');

  // Compare with Section 2 (Hero) which DOES use the 0.35 white wash
  const heroHtml = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 2, id: '1a8c21f2' })
  );
  assert.ok(heroHtml.includes('rgba(255, 255, 255, 0.35)'), 'Section 2 must preserve its original white wash overlay');

  // CSS assertions
  assert.ok(indexCss.includes('border: 4px solid #4054B2;'), 'CSS must set 4px solid blue border');
  assert.ok(indexCss.includes('border-radius: 16px;'), 'CSS must set 16px border-radius');
  assert.ok(indexCss.includes('box-shadow: 4px 4px 0px 0px var(--cordo-chocolate);'), 'CSS must set chocolate box-shadow');
});

test('M1: Section 5 Grid & Card Proportions — Photo frames wider than central card (540fr vs 465fr)', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 5, id: '709da48' })
  );

  // Grid markup
  assert.ok(html.includes('cordo-accueil-wrap'), 'Section 5 must render cordo-accueil-wrap');
  assert.ok(html.includes('cordo-accueil-grid'), 'Section 5 must render cordo-accueil-grid');

  // CSS assertions for grid
  assert.ok(indexCss.includes('.cordo-accueil-grid'), 'CSS must define .cordo-accueil-grid');
  assert.ok(indexCss.includes('grid-template-columns: minmax(0, 540fr) minmax(0, 465fr) minmax(0, 540fr);'), 'CSS must define 540fr 465fr 540fr grid columns');
  assert.ok(indexCss.includes('gap: clamp(1.5rem, 3.4vw, 65px);'), 'CSS must define responsive gap up to 65px');
  assert.ok(indexCss.includes('align-items: center;'), 'Grid must vertically center all 3 items');
  assert.ok(indexCss.includes('max-width: 1675px;'), 'Grid must set max-width 1675px');
});

test('M1: Section 5 Photo Frames & Cropping — Symmetry, 460/375 ratio, caramel border, and focal positions', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 5, id: '709da48' })
  );

  // Symmetrical photo frames and images
  const frameMatches = html.match(/class="cordo-accueil-photo-frame"/g);
  assert.equal(frameMatches?.length, 2, 'Section 5 must render exactly 2 symmetrical photo frames');

  const imgMatches = html.match(/class="cordo-accueil-img"/g);
  assert.equal(imgMatches?.length, 2, 'Section 5 must render exactly 2 photo images');

  // Verify image asset paths
  assert.ok(html.includes('186857245_500196524357695_4314135679681458895_n.jpg'), 'Left photo must render image 186857245');
  assert.ok(html.includes('186955828_871992320022870_8851172976867705776_n.jpg'), 'Right photo must render image 186955828');

  // CSS assertions for photo frame
  assert.ok(indexCss.includes('.cordo-accueil-photo-frame'), 'CSS must define .cordo-accueil-photo-frame');
  assert.ok(indexCss.includes('border: 4px dotted #4054B2;'), 'Photo frame must have 4px dotted blue border');
  assert.ok(indexCss.includes('padding: clamp(1.25rem, 2.2vw, 36px);'), 'Photo frame must have responsive padding up to 36px');
  assert.ok(indexCss.includes('max-width: 540px;'), 'Photo frame must have max-width 540px');
  assert.ok(indexCss.includes('min-height: 455px;'), 'Photo frame must have min-height 455px');

  // CSS assertions for photo image
  assert.ok(indexCss.includes('.cordo-accueil-img'), 'CSS must define .cordo-accueil-img');
  assert.ok(indexCss.includes('aspect-ratio: 460 / 375;'), 'Image must have 460 / 375 aspect ratio');
  assert.ok(indexCss.includes('border: 4px solid var(--cordo-caramel);'), 'Image must have 4px solid caramel border');
  assert.ok(indexCss.includes('border-radius: 12px;'), 'Image must have 12px border radius');

  // CSS assertions for custom object-position cropping
  assert.ok(indexCss.includes('object-position: center 20%;'), 'Left photo must focus at center 20% to reveal ceiling and counter');
  assert.ok(indexCss.includes('object-position: center 40%;'), 'Right photo must focus at center 40% to reveal shop and lower counter');
});

test('M1: Section 5 Central Text Card & Typography — Audiowide font, #800000 bordeaux, and natural line wrap', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 5, id: '709da48' })
  );

  // Card markup
  assert.ok(html.includes('cordo-accueil-card'), 'Section 5 must render cordo-accueil-card');
  assert.ok(html.includes('Vous pouvez me retrouver dans'), 'Card must render opening paragraph');
  assert.ok(html.includes('Profitez de vos courses pour passer'), 'Card must render second paragraph');

  // Verify Intermarché SUPER colored spans are intact
  assert.ok(html.includes('Inter</span>'), 'Card must preserve Inter span');
  assert.ok(html.includes('marché</span>'), 'Card must preserve marché span');
  assert.ok(html.includes('SUPER</span>'), 'Card must preserve SUPER span');

  // Verify inline style was removed from <p> to allow CSS Audiowide control
  assert.ok(!html.includes('<p style='), 'Paragraphs in cordo-accueil-card must not have conflicting inline styles');

  // CSS assertions for card dimensions and styling
  assert.ok(indexCss.includes('.cordo-accueil-card'), 'CSS must define .cordo-accueil-card');
  assert.ok(indexCss.includes('max-width: 465px;'), 'Card must have max-width 465px');
  assert.ok(indexCss.includes('min-height: 315px;'), 'Card must have min-height 315px');
  assert.ok(indexCss.includes('align-self: center;'), 'Card must have align-self center');

  // CSS assertions for Audiowide typography and bordeaux color
  assert.ok(indexCss.includes('.cordo-accueil-card p'), 'CSS must target .cordo-accueil-card p');
  assert.ok(indexCss.includes('font-family: var(--font-title);'), 'Card text must use Audiowide title font');
  assert.ok(indexCss.includes('color: #800000;'), 'Card text must be dark bordeaux #800000');
  assert.ok(indexCss.includes('font-size: clamp(0.95rem, 1.1vw, 1.05rem);'), 'Card text must use responsive font size');
  assert.ok(indexCss.includes('line-height: 1.55;'), 'Card text must have 1.55 line height');
  assert.ok(indexCss.includes('margin-top: clamp(1.5rem, 2.5vw, 2rem);'), 'Card must have generous inter-paragraph spacing');
});

test('M1: Responsive Behavior — Mobile stack at <=860px in DOM order with zero distortion', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 5, id: '709da48' })
  );

  // DOM order assertion: Left photo frame -> Central card -> Right photo frame
  const leftPhotoPos = html.indexOf('186857245_500196524357695_4314135679681458895_n.jpg');
  const cardPos = html.indexOf('cordo-accueil-card');
  const rightPhotoPos = html.indexOf('186955828_871992320022870_8851172976867705776_n.jpg');

  assert.ok(leftPhotoPos < cardPos, 'Left photo must precede central card in DOM order');
  assert.ok(cardPos < rightPhotoPos, 'Central card must precede right photo in DOM order');

  // CSS responsive media query assertions
  assert.ok(indexCss.includes('@media (max-width: 860px)'), 'CSS must define 860px mobile breakpoint');
  assert.ok(indexCss.includes('min-height: auto;'), 'Mobile rules must reset min-height to auto to prevent overflow');
});

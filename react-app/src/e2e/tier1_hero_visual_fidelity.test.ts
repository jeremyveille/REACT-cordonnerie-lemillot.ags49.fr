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
// Milestone 1: Hero Banner & Main Title Visual Fidelity Tests
// ============================================================================

test('M1: Section 1 Main Title — wrapper class, markup, and CSS spacing clamps', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 1, id: '25eb05f' })
  );

  // Markup assertions
  assert.ok(html.includes('cordo-main-title-wrap'), 'Section 1 must render wrapper with cordo-main-title-wrap class');
  assert.ok(html.includes('cordo-main-title'), 'Section 1 must render heading with cordo-main-title class');
  assert.ok(html.includes('CORDONNERIE') && html.includes('LE MILLOT'), 'Section 1 must preserve brand name');

  // CSS assertions
  assert.ok(indexCss.includes('.cordo-main-title-wrap'), 'CSS must define .cordo-main-title-wrap');
  assert.ok(indexCss.includes('clamp(1.75rem, 3.2vw, 2.75rem)'), 'CSS must define responsive clamp margin for main title');
  assert.ok(indexCss.includes('text-shadow: 0px 3px 0px #FFAE07'), 'CSS must preserve retro 3D yellow shadow');
  assert.ok(indexCss.includes('color: #715839'), 'CSS must preserve chocolate brown color');
});

test('M1: Section 2 Hero Container — dedicated cordo-hero-container class and unconstrained CSS width', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 2, id: '1a8c21f2' })
  );

  // Markup assertions
  assert.ok(html.includes('cordo-hero-container'), 'Section 2 must render container with cordo-hero-container class');
  assert.ok(html.includes('cordo-banner-hero'), 'Section 2 must render cordo-banner-hero section class');

  // CSS assertions
  assert.ok(indexCss.includes('.cordo-hero-container'), 'CSS must target .cordo-hero-container');
  assert.ok(indexCss.includes('max-width: 1900px'), 'CSS must unconstrain hero container max-width to 1900px');
  assert.ok(indexCss.includes('clamp(1.25rem, 5.8vw, 110px)'), 'CSS must define responsive lateral padding up to 110px');
  assert.ok(indexCss.includes('clamp(2.25rem, 2.8vw, 3rem) 0 !important'), 'CSS must define vertical padding clamp on hero banner');
  assert.ok(indexCss.includes('/uploads/2023/03/3-board-4742447_640.jpg'), 'CSS must reference authoritative 3-board wood texture');
});

test('M1: Hero 3 Cards Grid & Image Framing — aspect ratio 3:2 and shoe focus alignment', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, { sectionIndex: 2, id: '1a8c21f2' })
  );

  // Grid markup
  assert.ok(html.includes('cordo-hero-grid'), 'Section 2 must render cordo-hero-grid');
  assert.ok(html.includes('cordo-hero-card'), 'Section 2 must render cordo-hero-card');
  assert.ok(html.includes('cordo-hero-img'), 'Section 2 must render cordo-hero-img');

  // CSS assertions for Grid and Cards
  assert.ok(indexCss.includes('gap: clamp(1rem, 1.6vw, 30px)'), 'CSS must define responsive gap up to 30px');
  assert.ok(indexCss.includes('align-items: stretch'), 'Hero grid must stretch cards to uniform height');
  assert.ok(indexCss.includes('max-width: 560px'), 'Hero cards must have max-width 560px for ~540px desktop width');

  // CSS assertions for Images
  assert.ok(indexCss.includes('aspect-ratio: 3 / 2'), 'Hero images must define aspect-ratio 3 / 2');
  assert.ok(indexCss.includes('object-fit: cover'), 'Hero images must have object-fit cover');
  assert.ok(indexCss.includes('object-position: center 50%'), 'Shoemaker image must align focal position at center 50%');

  // Verify non-regression on base image styling (Cards 1 and 2)
  assert.ok(indexCss.includes('object-position: center;'), 'Base hero image must preserve default center position for Cards 1 and 2');
  assert.ok(indexCss.includes('.cordo-hero-card:nth-child(3) .cordo-hero-img'), 'Override must strictly target only Card 3');

  // Verify HTML contains all three hero image assets
  assert.ok(html.includes('tools-4089700_640.jpg'), 'Card 1 must render tools image');
  assert.ok(html.includes('185280034_472799637287378_7631920518017539361_n.jpg'), 'Card 2 must render business card image');
  assert.ok(html.includes('shoemaker-2855552_640.jpg'), 'Card 3 must render shoemaker image');
});

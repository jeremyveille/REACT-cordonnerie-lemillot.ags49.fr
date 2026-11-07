import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { puckConfig, puckViewports } from './config';
import { SectionContainer } from './components/SectionContainer';
import { VerticalSpacer } from './components/VerticalSpacer';
import { CustomDivider } from './components/CustomDivider';
import { HeadingBlock } from './components/HeadingBlock';
import { RichTextBlock } from './components/RichTextBlock';
import { ImageBlock } from './components/ImageBlock';
import { MediaGallery } from './components/MediaGallery';
import { VideoEmbed } from './components/VideoEmbed';
import { ActionButton } from './components/ActionButton';
import { AccordionCollapse } from './components/AccordionCollapse';
import { TabContainer } from './components/TabContainer';
import { InteractiveCarousel } from './components/InteractiveCarousel';
import { WeeklyBusinessHours, DEFAULT_SCHEDULE } from './components/WeeklyBusinessHours';
import { MapEmbed } from './components/MapEmbed';
import { ContactForm } from './components/ContactForm';
import { HtmlBlock } from './components/HtmlBlock';
import { RatingDisplay } from './components/RatingDisplay';

test('Puck Config — Defines 6 French categories with correct titles', () => {
  assert.ok(puckConfig.categories);
  const categories = puckConfig.categories;

  assert.equal(categories.layout?.title, '📐 Mise en page');
  assert.equal(categories.typography?.title, '✍️ Textes & Titres');
  assert.equal(categories.media?.title, '🖼️ Médias');
  assert.equal(categories.interactive?.title, '⚡ Éléments Interactifs');
  assert.equal(categories.artisan?.title, '👞 Cordonnerie & Contact');
  assert.equal(categories.advanced?.title, '🧩 Avancé');
});

test('Puck Config — Registers all 14+ required core widgets and modular components', () => {
  const expectedWidgets = [
    'SectionContainer',
    'VerticalSpacer',
    'CustomDivider',
    'HeadingBlock',
    'RichTextBlock',
    'ImageBlock',
    'MediaGallery',
    'VideoEmbed',
    'ActionButton',
    'AccordionCollapse',
    'TabContainer',
    'InteractiveCarousel',
    'WeeklyBusinessHours',
    'MapEmbed',
    'ContactForm',
    'HtmlBlock',
    'RatingDisplay',
  ];

  expectedWidgets.forEach((name) => {
    const comp = puckConfig.components[name as keyof typeof puckConfig.components];
    assert.ok(comp, `Widget "${name}" must be registered in puckConfig.components`);
    assert.ok(typeof comp.label === 'string' && comp.label.length > 0, `Widget "${name}" must have a label in French`);
    assert.ok(comp.defaultProps, `Widget "${name}" must define defaultProps`);
    assert.ok(typeof comp.render === 'function', `Widget "${name}" must define a render function`);
  });
});

test('Puck Config — Registers backward compatibility aliases for Elementor and Oracle tests', () => {
  const aliases = [
    'Section',
    'GridColumns',
    'Heading',
    'RichText',
    'SingleImage',
    'ImageGallery',
    'Carousel',
    'Accordion',
    'Tabs',
    'CallToAction',
    'OpeningHours',
    'GoogleMapEmbed',
  ];

  aliases.forEach((alias) => {
    const comp = puckConfig.components[alias as keyof typeof puckConfig.components];
    assert.ok(comp, `Alias widget "${alias}" must be registered`);
  });
});

test('Puck Config — Viewports define the 4 responsive breakpoints (375, 768, 1200, 1440)', () => {
  assert.equal(puckViewports.length, 4);
  const widths = puckViewports.map((v) => v.width);
  assert.deepEqual(widths, [375, 768, 1200, 1440]);

  assert.ok(puckViewports[0].label.includes('Mobile'));
  assert.ok(puckViewports[1].label.includes('Tablette'));
  assert.ok(puckViewports[2].label.includes('Ordinateur'));
  assert.ok(puckViewports[3].label.includes('Grand Écran'));
});

test('Widget: SectionContainer renders multi-column grid and handles background', () => {
  const html = renderToStaticMarkup(
    React.createElement(SectionContainer, {
      structure: '50-50',
      backgroundColor: 'chocolat',
      padding: '3rem',
      boxed: true,
    })
  );

  assert.ok(html.includes('puck-section-container'));
  assert.ok(html.includes('cordo-card'));
  assert.ok(html.includes('var(--cordo-chocolate)'));
});

test('Widget: VerticalSpacer renders CSS variables for responsive heights', () => {
  const html = renderToStaticMarkup(
    React.createElement(VerticalSpacer, {
      heightDesktop: 40,
      heightMobile: 25,
    })
  );

  assert.ok(html.includes('puck-vertical-spacer'));
  assert.ok(html.includes('--spacer-h-desktop:40px'));
  assert.ok(html.includes('--spacer-h-mobile:25px'));
});

test('Widget: CustomDivider renders diamond and line separator', () => {
  const html = renderToStaticMarkup(
    React.createElement(CustomDivider, {
      text: 'Artisanat',
      color: '#715839',
      showDiamond: true,
    })
  );

  assert.ok(html.includes('puck-custom-divider'));
  assert.ok(html.includes('divider-diamond'));
  assert.ok(html.includes('Artisanat'));
});

test('Widget: HeadingBlock renders H1-H4 with Audiowide font and 3D shadow option', () => {
  const html = renderToStaticMarkup(
    React.createElement(HeadingBlock, {
      text: 'Cordonnerie d’Exception',
      level: 'h1',
      align: 'center',
      fontFamily: 'Audiowide',
      subtitle: 'Depuis 2015 à Angers',
      textShadow3D: true,
    })
  );

  assert.ok(html.includes('<h1'));
  assert.ok(html.includes('Cordonnerie d’Exception'));
  assert.ok(html.includes('var(--font-title)'));
  assert.ok(html.includes('Depuis 2015 à Angers'));
  assert.ok(html.includes('text-shadow:2px 2px 0px var(--cordo-gold)'));
});

test('Widget: RichTextBlock renders formatted text with custom alignment and size', () => {
  const html = renderToStaticMarkup(
    React.createElement(RichTextBlock, {
      content: '<p>Bienvenue à notre <strong>Atelier</strong>.</p>',
      fontSize: 'lead',
      align: 'center',
    })
  );

  assert.ok(html.includes('puck-richtext-block'));
  assert.ok(html.includes('richtext-html-body'));
  assert.ok(html.includes('Bienvenue à notre'));
  assert.ok(html.includes('text-align:center'));
});

test('Widget: ImageBlock renders image with retro 3D shadow and caption', () => {
  const html = renderToStaticMarkup(
    React.createElement(ImageBlock, {
      src: '/uploads/2020/09/tools-4089700_640.jpg',
      alt: 'Outils',
      caption: 'Nos outils traditionnels',
      retroShadow: true,
    })
  );

  assert.ok(html.includes('puck-image-block'));
  assert.ok(html.includes('/uploads/2020/09/tools-4089700_640.jpg'));
  assert.ok(html.includes('Nos outils traditionnels'));
  assert.ok(html.includes('var(--cordo-shadow)'));
});

test('Widget: MediaGallery renders responsive columns grid and item cards', () => {
  const images = [
    { url: '/uploads/2020/09/tools-4089700_640.jpg', title: 'Outils' },
    { url: '/uploads/2020/09/shoemaker-2855552_640.jpg', title: 'Chaussures' },
  ];

  const html = renderToStaticMarkup(
    React.createElement(MediaGallery, {
      title: 'Notre Galerie',
      columns: 2,
      images,
    })
  );

  assert.ok(html.includes('puck-media-gallery'));
  assert.ok(html.includes('gallery-grid-2'));
  assert.ok(html.includes('Notre Galerie'));
  assert.ok(html.includes('gallery-item-card'));
});

test('Widget: VideoEmbed renders responsive 16:9 container', () => {
  const html = renderToStaticMarkup(
    React.createElement(VideoEmbed, {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Vidéo Atelier',
    })
  );

  assert.ok(html.includes('puck-video-embed'));
  assert.ok(html.includes('aspect-ratio:16 / 9'));
  assert.ok(html.includes('https://www.youtube.com/embed/dQw4w9WgXcQ'));
});

test('Widget: ActionButton renders button with retro 3D hover animation classes', () => {
  const html = renderToStaticMarkup(
    React.createElement(ActionButton, {
      label: 'Prendre Rendez-vous',
      url: '#contact',
      variant: 'gold',
      size: 'lg',
      retroShadow: true,
    })
  );

  assert.ok(html.includes('btn-gold'));
  assert.ok(html.includes('btn-lg'));
  assert.ok(html.includes('btn-retro-shadow'));
  assert.ok(html.includes('Prendre Rendez-vous'));
});

test('Widget: AccordionCollapse renders collapsible items with headers and content', () => {
  const items = [
    { title: 'Tarif Clé Simple', content: 'À partir de 6€ la reproduction.' },
    { title: 'Tarif Ressemelage', content: 'Devis sur place selon usure.' },
  ];

  const html = renderToStaticMarkup(
    React.createElement(AccordionCollapse, {
      title: 'Foire Aux Questions',
      items,
      initialOpenIndex: 0,
    })
  );

  assert.ok(html.includes('puck-accordion-container'));
  assert.ok(html.includes('Foire Aux Questions'));
  assert.ok(html.includes('Tarif Clé Simple'));
  assert.ok(html.includes('accordion-body-collapse expanded'));
  assert.ok(html.includes('À partir de 6€ la reproduction.'));
});

test('Widget: TabContainer renders tab navigation list and active tab panel', () => {
  const tabs = [
    { id: 'tab1', label: 'Cordonnerie', content: 'Ressemelage et talons.' },
    { id: 'tab2', label: 'Clés', content: 'Clés de sécurité et badges.' },
  ];

  const html = renderToStaticMarkup(
    React.createElement(TabContainer, {
      tabs,
      activeTabId: 'tab1',
    })
  );

  assert.ok(html.includes('puck-tab-container'));
  assert.ok(html.includes('role="tablist"'));
  assert.ok(html.includes('tab-btn-active'));
  assert.ok(html.includes('Ressemelage et talons.'));
});

test('Widget: InteractiveCarousel renders slides track and controls', () => {
  const slides = [
    { url: '/uploads/slide1.jpg', title: 'Diapo 1' },
    { url: '/uploads/slide2.jpg', title: 'Diapo 2' },
  ];

  const html = renderToStaticMarkup(
    React.createElement(InteractiveCarousel, {
      slides,
      showDots: true,
      showArrows: true,
    })
  );

  assert.ok(html.includes('puck-carousel-wrapper'));
  assert.ok(html.includes('carousel-track'));
  assert.ok(html.includes('carousel-nav-arrow'));
  assert.ok(html.includes('carousel-dots-container'));
});

test('Widget: WeeklyBusinessHours renders 7 days with Sunday closed red badge', () => {
  const html = renderToStaticMarkup(
    React.createElement(WeeklyBusinessHours, {
      title: 'Horaires d’Ouverture',
      schedule: DEFAULT_SCHEDULE,
    })
  );

  assert.ok(html.includes('puck-business-hours-card'));
  assert.ok(html.includes('Lundi'));
  assert.ok(html.includes('Dimanche'));
  assert.ok(html.includes('Fermé'));
  assert.ok(html.includes('#FA2D2D'));
  assert.ok(html.includes('live-status-badge'));
});

test('Widget: MapEmbed renders Google Maps iframe and directions button', () => {
  const html = renderToStaticMarkup(
    React.createElement(MapEmbed, {
      address: '55 bd Jacques Millot, 49000 Angers',
      title: 'Atelier Madeleine',
    })
  );

  assert.ok(html.includes('puck-map-embed-container'));
  assert.ok(html.includes('maps.google.com'));
  assert.ok(html.includes('Itinéraire Google Maps'));
});

test('Widget: ContactForm renders all inquiry fields and GDPR consent checkbox', () => {
  const html = renderToStaticMarkup(
    React.createElement(ContactForm, {
      title: 'Contactez-nous',
    })
  );

  assert.ok(html.includes('puck-contact-form-container'));
  assert.ok(html.includes('contact-name'));
  assert.ok(html.includes('contact-email'));
  assert.ok(html.includes('contact-service'));
  assert.ok(html.includes('contact-message'));
  assert.ok(html.includes('checkbox'));
});

test('Widget: RatingDisplay renders 5 stars and customer review comment', () => {
  const html = renderToStaticMarkup(
    React.createElement(RatingDisplay, {
      title: 'Vos avis :',
      score: 5,
      totalStars: 5,
      reviewCount: 48,
    })
  );

  assert.ok(html.includes('puck-rating-display'));
  assert.ok(html.includes('5.0 / 5'));
  assert.ok(html.includes('48 avis Google vérifiés'));
});

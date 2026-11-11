// @ts-check
import fs from 'fs';
import path from 'path';

/**
 * Authoritative Oracle & Domain Models for Cordonnerie Le Millot
 * Derived directly from ags491473278_2mvaqx.sql, SITE/, and PROJECT.md
 */

export const ORACLE_PAGES = [
  { id: '83', slug: 'a-angers', publicSlug: '/', title: 'Cordonnerie', minSections: 19 },
  { id: '888', slug: 'lexique-des-cuirs', publicSlug: '/lexique-des-cuirs', title: 'Lexique des cuirs', minAccordions: 34 },
  { id: '1022', slug: 'lexique-semelles-exterieurs', publicSlug: '/lexique-semelles-exterieurs', title: 'Lexique semelles extérieurs', minAccordions: 2 },
  { id: '1046', slug: 'lexique-chaussures', publicSlug: '/lexique-chaussures', title: 'lexique chaussures', minAccordions: 45 }
];

export const ORACLE_NAV_ITEMS = [
  { id: 78, title: 'accueil', target: '#accueil', order: 1 },
  { id: 79, title: 'mes services', target: '#services', order: 2 },
  { id: 80, title: 'contact', target: '#contact', order: 3 },
  { id: 81, title: 'mes horaires', target: '#horaires', order: 4, parent: 80 },
  { id: 82, title: 'me situer', target: '#localisation', order: 5, parent: 80 },
  { id: 353, title: 'mon atelier', target: '#atelier', order: 6, parent: 80 }
];

export const ORACLE_SERVICES = [
  { id: 1, name: 'Cartes de visite', modalDescId: '400', modalPriceId: '432', icon: 'far fa-address-card' },
  { id: 2, name: 'Chaussures', modalDescId: '469', modalPriceId: '486', icon: 'fas fa-shoe-prints' },
  { id: 3, name: "Badges d'immeuble", modalDescId: '644', modalPriceId: '651', icon: 'fas fa-id-badge' },
  { id: 4, name: 'Cuir & Tapis', modalDescId: '815', modalPriceId: '823', icon: 'fab fa-fantasy-flight-games' },
  { id: 5, name: 'Tampons encreurs', modalDescId: '608', modalPriceId: '620', icon: 'fas fa-stamp' },
  { id: 6, name: 'Maroquinerie & Sacs', modalDescId: '522', modalPriceId: '535', icon: 'fas fa-shopping-bag' },
  { id: 7, name: 'Télécommandes portails', modalDescId: '672', modalPriceId: '680', icon: 'icon-hosting1' },
  { id: 8, name: 'Noms - Tissés', modalDescId: '725', modalPriceId: '749', icon: 'far fa-minus-square' },
  { id: 9, name: 'Imprimerie', modalDescId: '585', modalPriceId: '590', icon: 'fas fa-print' },
  { id: 10, name: 'Reproduction de Clés', modalDescId: '545', modalPriceId: '552', icon: 'fas fa-key' },
  { id: 11, name: 'Piles', modalDescId: '703', modalPriceId: '711', icon: 'fas fa-pills' },
  { id: 12, name: 'Plaques Immatriculation', modalDescId: '856', modalPriceId: '869', icon: 'fas fa-car' }
];

export const ORACLE_BUSINESS_HOURS = {
  monday: { open: '09:00', close: '19:00', isClosed: false },
  tuesday: { open: '09:00', close: '19:00', isClosed: false },
  wednesday: { open: '09:00', close: '19:00', isClosed: false },
  thursday: { open: '09:00', close: '19:00', isClosed: false },
  friday: { open: '09:00', close: '19:00', isClosed: false },
  saturday: { open: '09:00', close: '19:00', isClosed: false },
  sunday: { open: null, close: null, isClosed: true }
};

export const ORACLE_STORE_DETAILS = {
  name: 'Cordonnerie - Le Millot',
  phone: '02 41 87 23 83',
  address: 'Intermarché - 55 bd jacques millot Angers',
  email: 'jeremy.veille@hotmail.fr'
};

export const ORACLE_PUCK_WIDGETS = [
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
  'ContactForm',
  'OpeningHours',
  'GoogleMapEmbed',
  'HtmlBlock'
];

export const ORACLE_VIEWPORTS = [
  { width: 375, label: 'Mobile' },
  { width: 768, label: 'Tablette' },
  { width: 1200, label: 'Desktop' },
  { width: 1440, label: 'Grand Écran' }
];

export const ORACLE_DESIGN_SYSTEM = {
  colors: {
    chocolate: '#715839',
    caramel: '#C7804A',
    gold: '#D8960C',
    yellow: '#E5E000',
    green: '#1B6C30',
    red: '#FA2D2D'
  },
  fonts: {
    heading: 'Audiowide',
    body: 'Roboto',
    secondary: 'Roboto Slab'
  },
  shadow: '7px 7px 0px 0px #715839',
  pureCssProperties: [
    '--cordo-chocolate',
    '--cordo-caramel',
    '--cordo-gold',
    '--cordo-yellow',
    '--cordo-green',
    '--cordo-red',
    '--cordo-shadow'
  ]
};

/**
 * Checks business hours status at a given Date or day/hour
 * @param {number} day 0 for Sunday, 1 for Monday, etc.
 * @param {number} hour 0 to 23
 * @param {number} minute 0 to 59
 * @returns {{ isOpen: boolean, label: string, color: string }}
 */
export function evaluateBusinessHours(day, hour, minute = 0) {
  const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayKey = daysMap[day];
  const schedule = ORACLE_BUSINESS_HOURS[dayKey];
  if (!schedule || schedule.isClosed) {
    return { isOpen: false, label: 'Fermé', color: '#FA2D2D' };
  }
  const currentMinutes = hour * 60 + minute;
  const [openH, openM] = schedule.open.split(':').map(Number);
  const [closeH, closeM] = schedule.close.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return { isOpen: true, label: 'Ouvert', color: '#1B6C30' };
  }
  return { isOpen: false, label: 'Fermé', color: '#FA2D2D' };
}

/**
 * In-memory simulator for IPageStorageService interface
 * Implements draftData vs publishedData separation, debouncing, and seeds
 */
export class MemoryPageStorageService {
  constructor(initialData = null) {
    this.pages = new Map();
    if (initialData && Array.isArray(initialData)) {
      for (const p of initialData) {
        this.pages.set(p.id, JSON.parse(JSON.stringify(p)));
      }
    } else {
      // Seed default 4 pages
      for (const oraclePage of ORACLE_PAGES) {
        this.pages.set(oraclePage.id, {
          id: oraclePage.id,
          slug: oraclePage.slug,
          title: oraclePage.title,
          status: 'published',
          publishedData: { root: { props: { title: oraclePage.title } }, content: [] },
          draftData: { root: { props: { title: oraclePage.title } }, content: [] },
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString()
        });
      }
    }
  }

  async getPages() {
    return Array.from(this.pages.values()).map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status,
      updatedAt: p.updatedAt
    }));
  }

  async getPageById(id) {
    const page = this.pages.get(id);
    return page ? JSON.parse(JSON.stringify(page)) : null;
  }

  async getPageBySlug(slug) {
    const cleanSlug = slug === '/' ? 'a-angers' : slug.replace(/^\//, '');
    for (const page of this.pages.values()) {
      if (page.slug === cleanSlug || (cleanSlug === 'accueil' && page.slug === 'a-angers')) {
        return JSON.parse(JSON.stringify(page));
      }
    }
    return null;
  }

  async saveDraft(id, draftData) {
    const page = this.pages.get(id);
    if (!page) throw new Error(`Page with ID ${id} not found`);
    page.draftData = JSON.parse(JSON.stringify(draftData));
    page.status = 'modified';
    page.updatedAt = new Date().toISOString();
  }

  async publishPage(id, data = null) {
    const page = this.pages.get(id);
    if (!page) throw new Error(`Page with ID ${id} not found`);
    if (data) {
      page.draftData = JSON.parse(JSON.stringify(data));
    }
    page.publishedData = JSON.parse(JSON.stringify(page.draftData));
    page.status = 'published';
    page.publishedAt = new Date().toISOString();
    page.updatedAt = page.publishedAt;
  }

  async createPage(title, slug) {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw new Error('Title is required');
    }
    const cleanSlug = (slug || title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    for (const page of this.pages.values()) {
      if (page.slug === cleanSlug) {
        throw new Error(`A page with slug "${cleanSlug}" already exists`);
      }
    }

    const id = String(Date.now());
    const newPage = {
      id,
      title: title.trim(),
      slug: cleanSlug,
      status: 'draft',
      draftData: { root: { props: { title: title.trim() } }, content: [] },
      publishedData: { root: { props: { title: title.trim() } }, content: [] },
      updatedAt: new Date().toISOString()
    };
    this.pages.set(id, newPage);
    return JSON.parse(JSON.stringify(newPage));
  }

  async deletePage(id) {
    if (id === '83') {
      throw new Error('Cannot delete the root homepage');
    }
    if (!this.pages.has(id)) {
      throw new Error(`Page with ID ${id} not found`);
    }
    this.pages.delete(id);
  }

  async duplicatePage(id) {
    const original = this.pages.get(id);
    if (!original) throw new Error(`Page with ID ${id} not found`);
    const newId = String(Date.now() + Math.floor(Math.random() * 1000));
    const newSlug = `${original.slug}-copie-${newId.slice(-4)}`;
    const duplicate = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      slug: newSlug,
      title: `${original.title} (Copie)`,
      status: 'draft',
      updatedAt: new Date().toISOString(),
      publishedAt: undefined
    };
    this.pages.set(newId, duplicate);
    return JSON.parse(JSON.stringify(duplicate));
  }
}

/**
 * Puck Editor State History Manager Simulator
 */
export class PuckHistoryEngine {
  constructor(initialData) {
    this.history = [JSON.parse(JSON.stringify(initialData))];
    this.index = 0;
  }

  get current() {
    return JSON.parse(JSON.stringify(this.history[this.index]));
  }

  canUndo() {
    return this.index > 0;
  }

  canRedo() {
    return this.index < this.history.length - 1;
  }

  pushState(newData) {
    // Truncate redo tree if we branched
    this.history = this.history.slice(0, this.index + 1);
    this.history.push(JSON.parse(JSON.stringify(newData)));
    this.index++;
  }

  undo() {
    if (this.canUndo()) {
      this.index--;
      return this.current;
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.index++;
      return this.current;
    }
    return null;
  }
}

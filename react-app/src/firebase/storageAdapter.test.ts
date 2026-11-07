import test from 'node:test';
import assert from 'node:assert/strict';

// Setup Mock Web Storage for Node environment
const mockStorage = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      mockStorage.set(key, String(value));
    },
    removeItem: (key: string) => {
      mockStorage.delete(key);
    },
    clear: () => {
      mockStorage.clear();
    },
  };
}
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { storageAdapter } from './storageAdapter';

test('StorageAdapter — Initial seed pages are populated', async () => {
  const pages = await storageAdapter.getPages();
  assert.ok(Array.isArray(pages));
  assert.ok(pages.length >= 4, `Expected at least 4 seed pages, found ${pages.length}`);

  const slugs = pages.map((p) => p.slug);
  assert.ok(slugs.includes('/'), 'Missing homepage "/"');
  assert.ok(slugs.includes('lexique-des-cuirs'), 'Missing "lexique-des-cuirs"');
  assert.ok(slugs.includes('lexique-semelles-exterieurs'), 'Missing "lexique-semelles-exterieurs"');
  assert.ok(slugs.includes('lexique-chaussures'), 'Missing "lexique-chaussures"');
});

test('StorageAdapter — getPageById retrieves existing page', async () => {
  const home = await storageAdapter.getPageById('83');
  assert.ok(home !== null);
  assert.equal(home.id, '83');
  assert.equal(home.slug, '/');
  assert.equal(home.status, 'published');
});

test('StorageAdapter — getPageById returns null for unknown ID', async () => {
  const unknown = await storageAdapter.getPageById('non-existent-9999');
  assert.equal(unknown, null);
});

test('StorageAdapter — getPageBySlug handles leading/trailing slashes', async () => {
  const pageWithSlash = await storageAdapter.getPageBySlug('/lexique-des-cuirs');
  const pageWithoutSlash = await storageAdapter.getPageBySlug('lexique-des-cuirs');

  assert.ok(pageWithSlash !== null);
  assert.ok(pageWithoutSlash !== null);
  assert.equal(pageWithSlash.id, '888');
  assert.equal(pageWithoutSlash.id, '888');
});

test('StorageAdapter — saveDraft updates draft data and marks status as modified', async () => {
  const newPuckData = {
    content: [
      {
        type: 'Heading',
        props: { id: 'test-h1', text: 'Titre Modifié en Brouillon' },
      },
    ],
    root: { props: { title: 'Titre Modifié' } },
  };

  await storageAdapter.saveDraft('83', newPuckData as any);
  const updated = await storageAdapter.getPageById('83');

  assert.ok(updated !== null);
  assert.equal(updated.status, 'modified');
  assert.equal(updated.draftData.content[0].props.text, 'Titre Modifié en Brouillon');
});

test('StorageAdapter — publishPage updates publishedData and sets status to published', async () => {
  const publishPuckData = {
    content: [
      {
        type: 'Heading',
        props: { id: 'test-pub', text: 'Titre Officiellement Publié' },
      },
    ],
    root: { props: { title: 'Titre Publié' } },
  };

  await storageAdapter.publishPage('83', publishPuckData as any);
  const published = await storageAdapter.getPageById('83');

  assert.ok(published !== null);
  assert.equal(published.status, 'published');
  assert.equal(published.publishedData.content[0].props.text, 'Titre Officiellement Publié');
  assert.equal(published.draftData.content[0].props.text, 'Titre Officiellement Publié');
});

test('StorageAdapter — createPage and deletePage lifecycle', async () => {
  const created = await storageAdapter.createPage('Nouveaux Tarifs 2026', 'tarifs-2026');
  assert.ok(created.id.startsWith('page_'));
  assert.equal(created.title, 'Nouveaux Tarifs 2026');
  assert.equal(created.slug, 'tarifs-2026');
  assert.equal(created.status, 'draft');

  // Verify page can be queried by ID and slug
  const fetched = await storageAdapter.getPageById(created.id);
  assert.ok(fetched !== null);

  const fetchedBySlug = await storageAdapter.getPageBySlug('tarifs-2026');
  assert.ok(fetchedBySlug !== null);
  assert.equal(fetchedBySlug.id, created.id);

  // Delete page
  await storageAdapter.deletePage(created.id);
  const afterDelete = await storageAdapter.getPageById(created.id);
  assert.equal(afterDelete, null);
});

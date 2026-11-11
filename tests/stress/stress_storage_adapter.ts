import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage environment
let mockStorage = new Map<string, string>();
let shouldThrowOnSetItem = false;
let setItemErrorToThrow: Error | null = null;
let shouldThrowOnGetItem = false;

const mockLocalStorage = {
  getItem: (key: string) => {
    if (shouldThrowOnGetItem) {
      throw new Error('SecurityError: The operation is insecure or storage is denied.');
    }
    return mockStorage.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    if (shouldThrowOnSetItem) {
      throw (
        setItemErrorToThrow ||
        new Error('QuotaExceededError: The quota has been exceeded (DOMException).')
      );
    }
    mockStorage.set(key, String(value));
  },
  removeItem: (key: string) => {
    mockStorage.delete(key);
  },
  clear: () => {
    mockStorage.clear();
  },
};

(globalThis as any).localStorage = mockLocalStorage;
(globalThis as any).window = globalThis;

// Now import storageAdapter
import { storageAdapter } from '../../react-app/src/firebase/storageAdapter';

// Helper to wait for debounce
const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('STRESS 1: Rapid concurrent draft saves on a single page', async () => {
  // Save 100 rapid drafts concurrently
  const totalSaves = 100;
  const promises = [];

  for (let i = 1; i <= totalSaves; i++) {
    const puckData = {
      content: [
        {
          type: 'Heading',
          props: { id: `stress-h-${i}`, text: `Draft Version ${i}` },
        },
      ],
      root: { props: { title: `Rapid Save ${i}` } },
    };
    promises.push(storageAdapter.saveDraft('83', puckData as any));
  }

  // Await all concurrent saves
  await Promise.all(promises);

  // In-memory cache should reflect the latest state immediately
  const latestInMemory = await storageAdapter.getPageById('83');
  assert.ok(latestInMemory !== null);
  assert.equal(latestInMemory.status, 'modified');
  assert.equal(
    latestInMemory.draftData.content[0].props.text,
    `Draft Version ${totalSaves}`
  );

  // Wait for 350ms for debounce timer to flush to localStorage
  await waitMs(350);

  // Verify that localStorage contains the updated version
  const rawStorage = mockStorage.get('cordo_pages_v2');
  assert.ok(rawStorage !== undefined && rawStorage !== null, 'localStorage should contain data');
  const parsedStorage = JSON.parse(rawStorage);
  const storedPage83 = parsedStorage.find((p: any) => p.id === '83');
  assert.ok(storedPage83 !== undefined);
  assert.equal(
    storedPage83.draftData.content[0].props.text,
    `Draft Version ${totalSaves}`
  );
});

test('STRESS 2: Interleaved concurrent draft saves across multiple distinct pages', async () => {
  const pageIds = ['83', '888', '1022', '1046'];
  const iterations = 20;
  const promises = [];

  for (let round = 1; round <= iterations; round++) {
    for (const id of pageIds) {
      const data = {
        content: [
          {
            type: 'Paragraph',
            props: { id: `multi-${id}-${round}`, text: `Page ${id} Round ${round}` },
          },
        ],
        root: { props: { title: `Page ${id}` } },
      };
      promises.push(storageAdapter.saveDraft(id, data as any));
    }
  }

  await Promise.all(promises);

  // Verify each page in memory has round 20
  for (const id of pageIds) {
    const page = await storageAdapter.getPageById(id);
    assert.ok(page !== null);
    assert.equal(page.status, 'modified');
    assert.equal(page.draftData.content[0].props.text, `Page ${id} Round ${iterations}`);
  }

  // Wait 350ms for debounced flush
  await waitMs(350);

  const rawStorage = mockStorage.get('cordo_pages_v2');
  const parsedStorage = JSON.parse(rawStorage!);
  for (const id of pageIds) {
    const stored = parsedStorage.find((p: any) => p.id === id);
    assert.ok(stored !== undefined);
    assert.equal(stored.draftData.content[0].props.text, `Page ${id} Round ${iterations}`);
  }
});

test('STRESS 3: LocalStorage QuotaExceededError (disk full simulation)', async () => {
  // Configure mock to throw QuotaExceededError on setItem
  shouldThrowOnSetItem = true;
  setItemErrorToThrow = new Error('QuotaExceededError: LocalStorage quota exceeded (5MB limit)');

  try {
    const errorPuckData = {
      content: [
        {
          type: 'RichTextBlock',
          props: { id: 'err-test', content: 'Testing resilience when storage is full' },
        },
      ],
      root: { props: { title: 'Quota Test' } },
    };

    // saveDraft must not crash the caller even if localStorage is full
    await storageAdapter.saveDraft('888', errorPuckData as any);

    // Wait for debounced persist attempt
    await waitMs(350);

    // The in-memory cache MUST still have preserved the draft
    const inMemory = await storageAdapter.getPageById('888');
    assert.ok(inMemory !== null);
    assert.equal(
      inMemory.draftData.content[0].props.content,
      'Testing resilience when storage is full'
    );

    // publishPage must also not crash when localStorage is full
    await storageAdapter.publishPage('888');
    const published = await storageAdapter.getPageById('888');
    assert.ok(published !== null);
    assert.equal(published.status, 'published');
  } finally {
    // Restore
    shouldThrowOnSetItem = false;
    setItemErrorToThrow = null;
  }
});

test('STRESS 4: Corrupted LocalStorage payload recovery', async () => {
  // Inject garbage into localStorage
  mockStorage.set('cordo_pages_v2', '{"malformed_json_corrupted: [true, null, ...');

  // getPages should still function and retrieve cached pages without crashing
  const pages = await storageAdapter.getPages();
  assert.ok(Array.isArray(pages));
  assert.ok(pages.length >= 4);
});

test('STRESS 5: Slugs with multiple leading, trailing, and embedded slashes & whitespace', async () => {
  // Test existing pages with extreme slashes
  const p888_1 = await storageAdapter.getPageBySlug('/lexique-des-cuirs');
  const p888_2 = await storageAdapter.getPageBySlug('lexique-des-cuirs/');
  const p888_3 = await storageAdapter.getPageBySlug('///lexique-des-cuirs///');
  const p888_4 = await storageAdapter.getPageBySlug('lexique-des-cuirs');

  assert.ok(p888_1 !== null, 'p888_1 should be found');
  assert.ok(p888_2 !== null, 'p888_2 should be found');
  assert.ok(p888_3 !== null, 'p888_3 should be found');
  assert.ok(p888_4 !== null, 'p888_4 should be found');
  assert.equal(p888_1.id, '888');
  assert.equal(p888_2.id, '888');
  assert.equal(p888_3.id, '888');
  assert.equal(p888_4.id, '888');

  // Test homepage with '/', '', '//', '///'
  const home_1 = await storageAdapter.getPageBySlug('/');
  const home_2 = await storageAdapter.getPageBySlug('');
  const home_3 = await storageAdapter.getPageBySlug('//');
  const home_4 = await storageAdapter.getPageBySlug('///');

  assert.ok(home_1 !== null, 'homepage with "/" should be found');
  assert.ok(home_2 !== null, 'homepage with "" should be found');
  assert.ok(home_3 !== null, 'homepage with "//" should be found');
  assert.ok(home_4 !== null, 'homepage with "///" should be found');
  assert.equal(home_1.id, '83');
  assert.equal(home_2.id, '83');
  assert.equal(home_3.id, '83');
  assert.equal(home_4.id, '83');

  // Create page with extreme whitespace and slashes
  const created = await storageAdapter.createPage(
    '  Atelier Angers  ',
    '   ///atelier-angers-2026///   '
  );
  assert.equal(created.slug, 'atelier-angers-2026');
  assert.equal(created.title, 'Atelier Angers');

  // Query with slashes
  const fetched_1 = await storageAdapter.getPageBySlug('/atelier-angers-2026/');
  const fetched_2 = await storageAdapter.getPageBySlug('atelier-angers-2026');
  const fetched_3 = await storageAdapter.getPageBySlug('///atelier-angers-2026');

  assert.ok(fetched_1 !== null);
  assert.ok(fetched_2 !== null);
  assert.ok(fetched_3 !== null);
  assert.equal(fetched_1.id, created.id);
  assert.equal(fetched_2.id, created.id);
  assert.equal(fetched_3.id, created.id);

  // Non-existent slug returns null
  const notFound = await storageAdapter.getPageBySlug('slug-inconnu-inexistant-404');
  assert.equal(notFound, null);

  // Clean up
  await storageAdapter.deletePage(created.id);
});

test('STRESS 6: Invalid ID and error handling', async () => {
  // saveDraft on non-existent ID must reject with clear message
  await assert.rejects(
    async () => {
      await storageAdapter.saveDraft('invalid-id-xyz', { content: [], root: { props: {} } });
    },
    {
      name: 'Error',
      message: 'Page avec l\'ID "invalid-id-xyz" introuvable.',
    }
  );

  // publishPage on non-existent ID must reject with clear message
  await assert.rejects(
    async () => {
      await storageAdapter.publishPage('invalid-id-xyz');
    },
    {
      name: 'Error',
      message: 'Page avec l\'ID "invalid-id-xyz" introuvable.',
    }
  );

  // deletePage on non-existent ID should gracefully delete nothing without throwing
  await assert.doesNotReject(async () => {
    await storageAdapter.deletePage('non-existent-id-abc');
  });
});

test('STRESS 7 (Adversarial): Slug case-sensitivity behavior', async () => {
  // Testing whether getPageBySlug handles uppercase or mixed-case queries
  const upperQuery = await storageAdapter.getPageBySlug('/LEXIQUE-DES-CUIRS');
  // Empirical observation: getPageBySlug does not normalize casing, returns null for uppercase query
  console.log('    [EMPIRICAL NOTE] /LEXIQUE-DES-CUIRS returns null (case sensitive match)');
  assert.equal(upperQuery, null, 'Current implementation is case-sensitive on slug lookups');
});

test('STRESS 8 (Adversarial): Concurrent createPage ID collision detection', async () => {
  // Empirical demonstration: Date.now() timestamp collision when called in same millisecond
  const p1 = storageAdapter.createPage('Page A', 'slug-a');
  const p2 = storageAdapter.createPage('Page B', 'slug-b');
  const p3 = storageAdapter.createPage('Page C', 'slug-c');
  const [resA, resB, resC] = await Promise.all([p1, p2, p3]);

  const uniqueIds = new Set([resA.id, resB.id, resC.id]);
  console.log(`    [EMPIRICAL VULNERABILITY] Created ${uniqueIds.size} unique ID(s) out of 3 concurrent calls: A=${resA.id}, B=${resB.id}, C=${resC.id}`);
  
  // Clean up any created IDs
  for (const id of uniqueIds) {
    await storageAdapter.deletePage(id);
  }
});

test('STRESS 9 (Adversarial): Rapid delete immediately after saveDraft (race condition)', async () => {
  const tempPage = await storageAdapter.createPage('Temp For Race', 'temp-race');
  
  // Save draft, which sets a 300ms debounce
  await storageAdapter.saveDraft(tempPage.id, {
    content: [{ type: 'Heading', props: { text: 'Race' } }],
    root: { props: {} },
  });

  // Immediately delete the page before debounce expires
  await storageAdapter.deletePage(tempPage.id);

  // Wait 400ms for debounce timer to expire
  await waitMs(400);

  // Verify page was NOT resurrected in localStorage or cache
  const inMem = await storageAdapter.getPageById(tempPage.id);
  assert.equal(inMem, null, 'Page must not be resurrected in memory');

  const rawStorage = mockStorage.get('cordo_pages_v2');
  const parsedStorage = JSON.parse(rawStorage || '[]');
  const inStore = parsedStorage.find((p: any) => p.id === tempPage.id);
  assert.equal(inStore, undefined, 'Page must not be resurrected in localStorage');
});

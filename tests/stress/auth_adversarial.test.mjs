import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Mock Web Storage for Node environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStorage.get(key) ?? null,
  setItem: (key, value) => {
    mockStorage.set(key, String(value));
  },
  removeItem: (key) => {
    mockStorage.delete(key);
  },
  clear: () => {
    mockStorage.clear();
  },
};
globalThis.window = globalThis;

import { pathToFileURL } from 'node:url';

const authModulePath = path.resolve(__dirname, '../../react-app/src/firebase/auth.ts');
const {
  loginWithCredentials,
  logoutUser,
  getCurrentSession,
  getSavedDemoSession,
  subscribeAuth,
} = await import(pathToFileURL(authModulePath).href);

test('Adversarial Auth — Case insensitivity and trimming on email', async () => {
  mockStorage.clear();
  const session = await loginWithCredentials(
    '  ADMIN@CORDONNERIE-LEMILLOT.FR  ',
    'demo123456'
  );
  assert.equal(session.email, 'admin@cordonnerie-lemillot.fr');
  assert.equal(getCurrentSession()?.email, 'admin@cordonnerie-lemillot.fr');
  await logoutUser();
});

test('Adversarial Auth — SQL Injection strings in email/password rejected', async () => {
  await assert.rejects(
    async () => {
      await loginWithCredentials("' OR '1'='1", "' OR '1'='1");
    },
    { message: /Identifiants invalides/ }
  );
  assert.equal(getCurrentSession(), null);
});

test('Adversarial Auth — Empty inputs and whitespace-only passwords rejected', async () => {
  await assert.rejects(
    async () => {
      await loginWithCredentials('', '');
    },
    { message: /Identifiants invalides/ }
  );

  await assert.rejects(
    async () => {
      await loginWithCredentials('admin@cordonnerie-lemillot.fr', '           ');
    },
    { message: /Identifiants invalides/ }
  );
});

test('Adversarial Auth — Idempotent logout when no session exists', async () => {
  mockStorage.clear();
  // Multiple logouts in a row should never throw
  await logoutUser();
  await logoutUser();
  await logoutUser();
  assert.equal(getCurrentSession(), null);
});

test('Adversarial Auth — LocalStorage corrupted JSON does not throw in getSavedDemoSession', () => {
  mockStorage.set('cordo_admin_session', '{{{{corrupted-json-payload-from-xss');
  const session = getSavedDemoSession();
  assert.equal(session, null);
});

test('Adversarial Auth — Concurrent login attempts resolve consistently without race condition', async () => {
  const promises = Array.from({ length: 20 }, () =>
    loginWithCredentials('admin@cordonnerie-lemillot.fr', 'demo123456')
  );
  const results = await Promise.all(promises);
  for (const res of results) {
    assert.equal(res.email, 'admin@cordonnerie-lemillot.fr');
    assert.equal(res.isDemo, true);
  }
  assert.equal(getCurrentSession()?.email, 'admin@cordonnerie-lemillot.fr');
  await logoutUser();
});

test('Adversarial Auth — subscribeAuth unsubscribe prevents subsequent notifications', async () => {
  let callCount = 0;
  const unsubscribe = subscribeAuth(() => {
    callCount++;
  });

  // initial trigger on subscribe
  assert.equal(callCount, 1);

  await loginWithCredentials('admin@cordonnerie-lemillot.fr', 'demo123456');
  assert.equal(callCount, 2);

  // Unsubscribe
  unsubscribe();

  await logoutUser();
  // callCount should still be 2 since listener was removed
  assert.equal(callCount, 2);
});

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

import {
  loginWithCredentials,
  logoutUser,
  getCurrentSession,
  subscribeAuth,
} from './auth';

test('Auth — Demo credentials succeed and return valid session', async () => {
  const session = await loginWithCredentials(
    'admin@cordonnerie-lemillot.fr',
    'demo123456'
  );

  assert.ok(session !== null);
  assert.equal(session.email, 'admin@cordonnerie-lemillot.fr');
  assert.equal(session.isDemo, true);
  assert.equal(getCurrentSession()?.email, 'admin@cordonnerie-lemillot.fr');
});

test('Auth — Invalid credentials throw error', async () => {
  await assert.rejects(
    async () => {
      await loginWithCredentials('hacker@malicious.com', 'wrongpassword');
    },
    {
      name: 'Error',
      message: /Identifiants invalides/,
    }
  );
});

test('Auth — Logout clears current session', async () => {
  // Login first
  await loginWithCredentials('admin@cordonnerie-lemillot.fr', 'demo123456');
  assert.ok(getCurrentSession() !== null);

  // Logout
  await logoutUser();
  assert.equal(getCurrentSession(), null);
});

test('Auth — subscribeAuth notifies listeners on state changes', async () => {
  let latestSessionEmail: string | null | undefined = undefined;

  const unsubscribe = subscribeAuth((user) => {
    latestSessionEmail = user ? user.email : null;
  });

  await loginWithCredentials('admin@cordonnerie-lemillot.fr', 'demo123456');
  assert.equal(latestSessionEmail, 'admin@cordonnerie-lemillot.fr');

  await logoutUser();
  assert.equal(latestSessionEmail, null);

  unsubscribe();
});

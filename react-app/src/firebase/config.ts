import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Safe environment variables accessor supporting both Vite (import.meta.env) and Node.js test runners
const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
const safeEnv: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env as any)
    : proc && proc.env
    ? (proc.env as any)
    : {};

// Environment variables or fallback defaults for react-cordonnerie-lemillot
const firebaseConfig = {
  apiKey: safeEnv.VITE_FIREBASE_API_KEY || 'AIzaSyDemoDummyKeyForLocalDev1234567890',
  authDomain: safeEnv.VITE_FIREBASE_AUTH_DOMAIN || 'react-cordonnerie-lemillot.firebaseapp.com',
  projectId: safeEnv.VITE_FIREBASE_PROJECT_ID || 'react-cordonnerie-lemillot',
  storageBucket: safeEnv.VITE_FIREBASE_STORAGE_BUCKET || 'react-cordonnerie-lemillot.appspot.com',
  messagingSenderId: safeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: safeEnv.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

// Check if a real API key was provided via env
export const isFirebaseConfigured = Boolean(
  safeEnv.VITE_FIREBASE_API_KEY && safeEnv.VITE_FIREBASE_API_KEY.length > 20
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn('[Firebase] Initialization warning (running in offline fallback mode):', error);
}

export { app, auth, db };

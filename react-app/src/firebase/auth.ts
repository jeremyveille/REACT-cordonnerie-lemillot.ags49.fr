import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import type { UserSession } from '../types/page';

const DEMO_EMAIL = 'admin@cordonnerie-lemillot.fr';
const DEMO_PASSWORD = 'demo123456';
const DEMO_SESSION_KEY = 'cordo_admin_session';

type AuthListener = (user: UserSession | null) => void;
const listeners = new Set<AuthListener>();

function notifyListeners(user: UserSession | null) {
  listeners.forEach((listener) => listener(user));
}

// Check local storage for demo session
export function getSavedDemoSession(): UserSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw) as UserSession;
    }
  } catch (e) {
    console.error('Error reading saved session from localStorage', e);
  }
  return null;
}

// Active session state
let currentSession: UserSession | null = getSavedDemoSession();

// Listen to Firebase auth changes if auth is initialized
if (auth) {
  try {
    onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        currentSession = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Administrateur',
          isDemo: false,
        };
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(currentSession));
      } else {
        // Only clear if not in an active demo session
        if (!currentSession?.isDemo) {
          currentSession = null;
          localStorage.removeItem(DEMO_SESSION_KEY);
        }
      }
      notifyListeners(currentSession);
    });
  } catch (err) {
    console.warn('[Auth] Firebase onAuthStateChanged listener setup error:', err);
  }
}

/**
 * Sign in helper supporting real Firebase Auth and offline demo fallback
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<UserSession> {
  const normalizedEmail = email.trim().toLowerCase();

  // If Firebase is configured, try Firebase Auth first
  if (isFirebaseConfigured && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;
      currentSession = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Administrateur',
        isDemo: false,
      };
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(currentSession));
      notifyListeners(currentSession);
      return currentSession;
    } catch (fbError) {
      // If Firebase failed, check if it matches the demo credentials as fallback
      if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
        return activateDemoSession();
      }
      throw fbError;
    }
  }

  // Offline / Demo mode check
  if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
    return activateDemoSession();
  }

  throw new Error('Identifiants invalides. Utilisez admin@cordonnerie-lemillot.fr / demo123456 en mode démo.');
}

function activateDemoSession(): UserSession {
  const demoUser: UserSession = {
    uid: 'demo-admin-49',
    email: DEMO_EMAIL,
    displayName: 'Artisan Cordonnier Le Millot (Démo)',
    isDemo: true,
  };
  currentSession = demoUser;
  try {
    localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
  } catch (e) {
    console.error('LocalStorage write failed', e);
  }
  notifyListeners(currentSession);
  return demoUser;
}

/**
 * Sign out helper
 */
export async function logoutUser(): Promise<void> {
  if (auth && !currentSession?.isDemo) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signout warning:', err);
    }
  }
  currentSession = null;
  try {
    localStorage.removeItem(DEMO_SESSION_KEY);
  } catch (e) {
    console.error('LocalStorage removeItem failed', e);
  }
  notifyListeners(null);
}

/**
 * Subscribe to auth state changes
 */
export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  // Emit current state immediately
  listener(currentSession);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Get synchronous current user session
 */
export function getCurrentSession(): UserSession | null {
  return currentSession;
}

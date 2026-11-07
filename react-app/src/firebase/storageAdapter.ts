import type { PageRecord, IPageStorageService, PuckData, PageStatus } from '../types/page';
import initialPagesData from '../data/initialPages.json';
import { db, isFirebaseConfigured } from './config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const STORAGE_KEY = 'cordo_pages_v6';
const FIRESTORE_COLLECTION = 'pages';

function normalizePuckData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const content = Array.isArray(data.content)
    ? data.content.map((item: any) => {
        if (item && item.children && item.props) {
          return {
            ...item,
            props: {
              ...item.props,
              items: item.children,
            },
          };
        }
        return item;
      })
    : [];
  return { ...data, content };
}

// Default initial pages seed based on WordPress audit and extracted Elementor/Puck data
const DEFAULT_SEED_PAGES: PageRecord[] = (initialPagesData as any[]).map((page) => ({
  id: String(page.id),
  slug: page.slug === '/' ? '/' : page.slug.replace(/^\/+|\/+$/g, ''),
  title: page.title,
  status: (page.status || 'published') as PageStatus,
  publishedData: normalizePuckData(page.publishedData) || { content: [], root: { props: { title: page.title } } },
  draftData: normalizePuckData(page.draftData || page.publishedData) || { content: [], root: { props: { title: page.title } } },
  updatedAt: page.updatedAt || new Date().toISOString(),
}));

class HybridPageStorageService implements IPageStorageService {
  private cache: Map<string, PageRecord> = new Map();
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private isLoadedFromStorage = false;

  constructor() {
    this.initFromLocalStorage();
  }

  private initFromLocalStorage(): void {
    if (typeof window === 'undefined') {
      DEFAULT_SEED_PAGES.forEach((page) => this.cache.set(page.id, page));
      this.isLoadedFromStorage = true;
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PageRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((page) => this.cache.set(page.id, page));
          this.isLoadedFromStorage = true;
          return;
        }
      }
    } catch (err) {
      console.warn('[StorageAdapter] Failed to parse localStorage cache:', err);
    }

    // Seed defaults if nothing in localStorage
    DEFAULT_SEED_PAGES.forEach((page) => this.cache.set(page.id, page));
    this.persistCacheToLocalStorage();
    this.isLoadedFromStorage = true;
  }

  private persistCacheToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const records = Array.from(this.cache.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('[StorageAdapter] LocalStorage write error:', err);
    }
  }

  public async getPages(): Promise<PageRecord[]> {
    if (!this.isLoadedFromStorage) {
      this.initFromLocalStorage();
    }

    // Attempt to pull latest pages from Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        const colRef = collection(db, FIRESTORE_COLLECTION);
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as PageRecord;
            this.cache.set(data.id, data);
          });
          this.persistCacheToLocalStorage();
        }
      } catch (err) {
        console.info('[StorageAdapter] Firestore unreachable, using LocalStorage cache fallback:', err);
      }
    }

    return Array.from(this.cache.values());
  }

  public async getPageById(id: string): Promise<PageRecord | null> {
    if (!this.isLoadedFromStorage) {
      this.initFromLocalStorage();
    }

    if (this.cache.has(id)) {
      return this.cache.get(id) || null;
    }

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const page = docSnap.data() as PageRecord;
          this.cache.set(page.id, page);
          this.persistCacheToLocalStorage();
          return page;
        }
      } catch (err) {
        console.info('[StorageAdapter] Firestore getPageById fallback to memory/cache:', err);
      }
    }

    return null;
  }

  public async getPageBySlug(slug: string): Promise<PageRecord | null> {
    const pages = await this.getPages();
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    return (
      pages.find((p) => {
        const pSlug = p.slug.replace(/^\/+|\/+$/g, '');
        if (pSlug === cleanSlug) return true;
        if ((cleanSlug === '' || cleanSlug === 'a-angers') && (p.id === '83' || pSlug === '' || pSlug === 'a-angers')) return true;
        if (Array.isArray((p as any).slugAliases)) {
          const aliases = (p as any).slugAliases.map((a: string) => a.replace(/^\/+|\/+$/g, ''));
          if (aliases.includes(cleanSlug)) return true;
        }
        return false;
      }) || null
    );
  }

  public async saveDraft(id: string, data: PuckData): Promise<void> {
    const existing = await this.getPageById(id);
    if (!existing) {
      throw new Error(`Page avec l'ID "${id}" introuvable.`);
    }

    const updated: PageRecord = {
      ...existing,
      draftData: data,
      status: existing.status === 'published' ? 'modified' : existing.status,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(id, updated);

    // Debounce the local storage flush (300ms)
    if (this.debounceTimers.has(id)) {
      clearTimeout(this.debounceTimers.get(id)!);
    }

    const timer = setTimeout(() => {
      this.persistCacheToLocalStorage();
      this.debounceTimers.delete(id);
    }, 300);
    this.debounceTimers.set(id, timer);

    // Sync to Firestore in background if available
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, id);
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        console.warn('[StorageAdapter] Background Firestore saveDraft sync error:', err);
      }
    }
  }

  public async publishPage(id: string, data?: PuckData): Promise<void> {
    const existing = await this.getPageById(id);
    if (!existing) {
      throw new Error(`Page avec l'ID "${id}" introuvable.`);
    }

    const puckDataToPublish = data || existing.draftData;

    const updated: PageRecord = {
      ...existing,
      draftData: puckDataToPublish,
      publishedData: puckDataToPublish,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(id, updated);
    this.persistCacheToLocalStorage();

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, id);
        await setDoc(docRef, updated);
      } catch (err) {
        console.warn('[StorageAdapter] Firestore publishPage sync error:', err);
      }
    }
  }

  public async createPage(title: string, slug: string): Promise<PageRecord> {
    const cleanSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
    const newId = `page_${Date.now()}`;

    const emptyPuckData: PuckData = {
      content: [],
      root: { props: { title } },
    };

    const newPage: PageRecord = {
      id: newId,
      slug: cleanSlug || `nouvelle-page-${Date.now()}`,
      title: title.trim() || 'Sans Titre',
      status: 'draft',
      draftData: emptyPuckData,
      publishedData: emptyPuckData,
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(newId, newPage);
    this.persistCacheToLocalStorage();

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, newId);
        await setDoc(docRef, newPage);
      } catch (err) {
        console.warn('[StorageAdapter] Firestore createPage sync error:', err);
      }
    }

    return newPage;
  }

  public async duplicatePage(id: string): Promise<PageRecord> {
    const source = await this.getPageById(id);
    if (!source) {
      throw new Error(`Page avec l'ID "${id}" introuvable.`);
    }

    const timestamp = Date.now();
    const baseSlug = (source.slug === '/' || !source.slug) ? 'a-angers' : source.slug.replace(/^\/+|\/+$/g, '');
    const newSlug = `${baseSlug}-copie-${timestamp}`;
    const newId = `page_${timestamp}`;
    const newTitle = `${source.title} (Copie)`;

    const duplicated: PageRecord = {
      id: newId,
      slug: newSlug,
      title: newTitle,
      status: 'draft',
      draftData: JSON.parse(JSON.stringify(source.draftData || source.publishedData)),
      publishedData: JSON.parse(JSON.stringify(source.publishedData)),
      updatedAt: new Date().toISOString(),
    };

    this.cache.set(newId, duplicated);
    this.persistCacheToLocalStorage();

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, newId);
        await setDoc(docRef, duplicated);
      } catch (err) {
        console.warn('[StorageAdapter] Firestore duplicatePage sync error:', err);
      }
    }

    return duplicated;
  }

  public async deletePage(id: string): Promise<void> {
    this.cache.delete(id);
    this.persistCacheToLocalStorage();

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('[StorageAdapter] Firestore deletePage error:', err);
      }
    }
  }
}

// Singleton storage adapter instance
export const storageAdapter: IPageStorageService = new HybridPageStorageService();
export default storageAdapter;

import type { Data as PuckData } from '@measured/puck';

export type { PuckData };

export type PageStatus = 'published' | 'draft' | 'modified';

export interface PageRecord {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  publishedData: PuckData;
  draftData: PuckData;
  updatedAt: string;
}

export interface IPageStorageService {
  getPages(): Promise<PageRecord[]>;
  getPageById(id: string): Promise<PageRecord | null>;
  getPageBySlug(slug: string): Promise<PageRecord | null>;
  saveDraft(id: string, data: PuckData): Promise<void>;
  publishPage(id: string, data?: PuckData): Promise<void>;
  createPage(title: string, slug: string): Promise<PageRecord>;
  duplicatePage(id: string): Promise<PageRecord>;
  deletePage(id: string): Promise<void>;
}

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  isDemo?: boolean;
}

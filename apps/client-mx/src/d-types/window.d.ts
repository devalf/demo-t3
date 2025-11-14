/**
 * Definition of modern browser API `CookieStore` that still is not the standard
 */

interface CookieListItem {
  name: string;
  value: string;
  domain?: string | null;
  path?: string;
  expires?: DOMTimeStamp | null;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

interface CookieStore {
  get(name: string): Promise<CookieListItem | null>;
  get(options?: { name: string }): Promise<CookieListItem | null>;
  getAll(name?: string): Promise<CookieListItem[]>;
  getAll(options?: { name?: string }): Promise<CookieListItem[]>;
  set(name: string, value: string): Promise<void>;
  set(options: {
    name: string;
    value: string;
    expires?: DOMTimeStamp | null;
    domain?: string;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none';
    secure?: boolean;
  }): Promise<void>;
  delete(name: string): Promise<void>;
  delete(options: {
    name: string;
    domain?: string;
    path?: string;
  }): Promise<void>;
}

interface Window {
  cookieStore: CookieStore;
}

// Reading and writing the cart in localStorage.
// Stored data is untrusted: it may be corrupted, outdated or edited by hand,
// so it is validated on every read and never crashes the page.
import type { Product } from '../types.ts';
import { normalizeGrams } from './cart.ts';
import type { Cart, CartItem } from './cart.ts';

const VERSION = 1;

export type CartStorage = Pick<Storage, 'getItem' | 'setItem'>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Validates stored data: drops malformed entries, duplicates and products
 * that are no longer in the catalog; snaps weights to the product rules.
 */
export function parseCart(data: unknown, products: readonly Product[]): Cart {
  if (!isRecord(data) || data.version !== VERSION) return [];
  if (!Array.isArray(data.items)) return [];

  const byId = new Map(products.map((product) => [product.id, product]));
  const cart: CartItem[] = [];
  const seen = new Set<string>();

  for (const entry of data.items as unknown[]) {
    if (!isRecord(entry)) continue;
    const { id, grams } = entry;
    if (typeof id !== 'string' || typeof grams !== 'number') continue;

    const product = byId.get(id);
    if (!product || seen.has(id)) continue;

    seen.add(id);
    cart.push({ id, grams: normalizeGrams(product, grams) });
  }
  return cart;
}

export function loadCart(
  storage: CartStorage | null,
  key: string,
  products: readonly Product[]
): Cart {
  if (!storage) return [];
  try {
    const raw = storage.getItem(key);
    return raw === null ? [] : parseCart(JSON.parse(raw), products);
  } catch {
    return [];
  }
}

export function saveCart(
  storage: CartStorage | null,
  key: string,
  cart: Cart
): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify({ version: VERSION, items: cart }));
  } catch {
    // Quota exceeded or storage disabled: the cart lives in memory only.
  }
}

/** localStorage, or null when the browser blocks it (e.g. privacy mode). */
export function getBrowserStorage(): CartStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

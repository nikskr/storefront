// Server-side order validation. Nothing from the browser is trusted:
// the phone is re-checked, products and prices come from src/data,
// and the total is recalculated.
import {
  getCartLines,
  getCartTotal,
  normalizeGrams,
} from '../../src/lib/cart.ts';
import type { CartItem, CartLine } from '../../src/lib/cart.ts';
import { MAX_ORDER_ITEMS } from '../../src/lib/order.ts';
import type { OrderErrorCode } from '../../src/lib/order.ts';
import { normalizePhone } from '../../src/lib/phone.ts';
import type { Kopecks, Product } from '../../src/types.ts';

export interface ValidOrder {
  orderId: string;
  phone: string;
  lines: CartLine[];
  total: Kopecks;
}

export type ValidationResult =
  | { ok: true; order: ValidOrder }
  /** A bot filled the honeypot: answer "ok" but send nothing. */
  | { ok: true; spam: true }
  | { ok: false; error: OrderErrorCode; status: number };

const ORDER_ID = /^[\w-]{8,64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fail = (error: OrderErrorCode, status = 400): ValidationResult => ({
  ok: false,
  error,
  status,
});

export function validateOrder(
  data: unknown,
  products: readonly Product[]
): ValidationResult {
  if (!isRecord(data)) return fail('invalid_request');

  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return { ok: true, spam: true };
  }

  const { orderId, phone, consent, items, total } = data;

  if (typeof orderId !== 'string' || !ORDER_ID.test(orderId)) {
    return fail('invalid_request');
  }
  if (consent !== true) return fail('consent_required');

  const normalizedPhone =
    typeof phone === 'string' ? normalizePhone(phone) : null;
  if (!normalizedPhone) return fail('invalid_phone');

  const cart = parseItems(items, products);
  if (!cart) return fail('invalid_items');

  const lines = getCartLines(cart, products);
  const serverTotal = getCartTotal(lines);
  // Prices changed since the page was loaded (e.g. after a deploy).
  if (total !== serverTotal) return fail('price_changed', 409);

  return {
    ok: true,
    order: { orderId, phone: normalizedPhone, lines, total: serverTotal },
  };
}

/** Returns the cart only if every item is a known product with a valid weight. */
function parseItems(
  items: unknown,
  products: readonly Product[]
): CartItem[] | null {
  if (!Array.isArray(items)) return null;
  if (items.length === 0 || items.length > MAX_ORDER_ITEMS) return null;

  const byId = new Map(products.map((product) => [product.id, product]));
  const seen = new Set<string>();
  const cart: CartItem[] = [];

  for (const item of items as unknown[]) {
    if (!isRecord(item)) return null;
    const { id, grams } = item;
    if (typeof id !== 'string' || typeof grams !== 'number') return null;

    const product = byId.get(id);
    if (!product || seen.has(id)) return null;
    // The site only sends weights that follow the product rules.
    if (normalizeGrams(product, grams) !== grams) return null;

    seen.add(id);
    cart.push({ id, grams });
  }
  return cart;
}

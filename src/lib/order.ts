// Order request contract between the site and the Netlify Function
// (POST /api/order). Shared by both sides, so it must stay free of DOM code.
import type { Grams, Kopecks } from '../types.ts';
import type { Cart, CartLine } from './cart.ts';
import { getCartTotal } from './cart.ts';

export interface OrderRequest {
  /** Random id of one checkout attempt: lets the seller spot a resent order. */
  orderId: string;
  /** Normalized phone, "+375XXXXXXXXX". */
  phone: string;
  /** The buyer ticked the personal data consent checkbox. */
  consent: true;
  items: { id: string; grams: Grams }[];
  /** Total the buyer saw, in kopecks. The server recalculates and compares. */
  total: Kopecks;
  /** Honeypot: hidden field, real users leave it empty. */
  website: string;
}

export type OrderErrorCode =
  | 'invalid_request'
  | 'invalid_phone'
  | 'consent_required'
  | 'invalid_items'
  | 'price_changed'
  | 'method_not_allowed'
  | 'unsupported_media_type'
  | 'payload_too_large'
  | 'forbidden'
  | 'rate_limited'
  | 'server_error'
  | 'delivery_failed'
  | 'network'
  | 'timeout';

export type OrderResponse =
  { ok: true; orderId: string } | { ok: false; error: OrderErrorCode };

/** Max distinct products in one order: protects the function from abuse. */
export const MAX_ORDER_ITEMS = 50;

export function buildOrderRequest(params: {
  orderId: string;
  phone: string;
  cart: Cart;
  lines: readonly CartLine[];
  website?: string;
}): OrderRequest {
  return {
    orderId: params.orderId,
    phone: params.phone,
    consent: true,
    items: params.cart.map(({ id, grams }) => ({ id, grams })),
    total: getCartTotal(params.lines),
    website: params.website ?? '',
  };
}

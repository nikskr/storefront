// Pure cart operations. A cart is an ordered list of { id, grams };
// every function returns a new cart (or the same one if nothing changed).
import type { Grams, Kopecks, Product } from '../types.ts';

export interface CartItem {
  readonly id: string;
  readonly grams: Grams;
}

export type Cart = readonly CartItem[];

export interface CartLine {
  product: Product;
  grams: Grams;
  cost: Kopecks;
}

/** Clamps grams to [min, max] and snaps them to the product's step. */
export function normalizeGrams(product: Product, grams: number): Grams {
  const { min, step, max } = product.weight;
  if (!Number.isFinite(grams)) return min;
  const steps = Math.round((grams - min) / step);
  return Math.min(max, Math.max(min, min + steps * step));
}

export function findItem(cart: Cart, id: string): CartItem | undefined {
  return cart.find((item) => item.id === id);
}

/** Sets the weight of an item that is already in the cart. */
export function setItemGrams(cart: Cart, product: Product, grams: number) {
  const next = normalizeGrams(product, grams);
  const item = findItem(cart, product.id);
  if (!item || item.grams === next) return cart;
  return cart.map((it) => (it.id === product.id ? { ...it, grams: next } : it));
}

/** Adds the minimal weight, or one more step if the product is in the cart. */
export function incrementItem(cart: Cart, product: Product): Cart {
  const item = findItem(cart, product.id);
  if (!item) return [...cart, { id: product.id, grams: product.weight.min }];
  return setItemGrams(cart, product, item.grams + product.weight.step);
}

export const addToCart = incrementItem;

/** Removes one step; below the minimal weight the item leaves the cart. */
export function decrementItem(cart: Cart, product: Product): Cart {
  const item = findItem(cart, product.id);
  if (!item) return cart;
  const next = item.grams - product.weight.step;
  if (next < product.weight.min) return removeFromCart(cart, product.id);
  return setItemGrams(cart, product, next);
}

export function removeFromCart(cart: Cart, id: string): Cart {
  return findItem(cart, id) ? cart.filter((item) => item.id !== id) : cart;
}

export function canIncrement(product: Product, grams: Grams): boolean {
  return grams < product.weight.max;
}

/** Price per kg × weight, rounded to whole kopecks. */
export function lineCost(pricePerKg: Kopecks, grams: Grams): Kopecks {
  return Math.round((pricePerKg * grams) / 1000);
}

/** Joins the cart with product data; unknown ids are skipped. */
export function getCartLines(
  cart: Cart,
  products: readonly Product[]
): CartLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return cart.flatMap(({ id, grams }) => {
    const product = byId.get(id);
    return product
      ? [{ product, grams, cost: lineCost(product.pricePerKg, grams) }]
      : [];
  });
}

export function getCartTotal(lines: readonly CartLine[]): Kopecks {
  return lines.reduce((sum, line) => sum + line.cost, 0);
}

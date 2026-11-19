import { describe, expect, it } from 'vitest';
import type { Product } from '../types.ts';
import {
  addToCart,
  canIncrement,
  decrementItem,
  getCartLines,
  getCartTotal,
  incrementItem,
  lineCost,
  normalizeGrams,
  removeFromCart,
  setItemGrams,
} from './cart.ts';
import type { Cart } from './cart.ts';

const product = (id: string, overrides: Partial<Product> = {}): Product => ({
  id,
  name: id,
  description: '',
  pricePerKg: 150,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
  ...overrides,
});

const carrot = product('carrot');
const potato = product('potato', {
  pricePerKg: 199,
  weight: { min: 1000, step: 1000, max: 3000 },
});

describe('normalizeGrams', () => {
  it('clamps to min and max', () => {
    expect(normalizeGrams(carrot, 100)).toBe(500);
    expect(normalizeGrams(carrot, 99_000)).toBe(2000);
  });

  it('snaps to the nearest step', () => {
    expect(normalizeGrams(carrot, 1200)).toBe(1000);
    expect(normalizeGrams(carrot, 1300)).toBe(1500);
  });

  it('falls back to min for non-numbers', () => {
    expect(normalizeGrams(carrot, Number.NaN)).toBe(500);
    expect(normalizeGrams(carrot, Infinity)).toBe(500);
  });
});

describe('addToCart / incrementItem', () => {
  it('adds a new product with the minimal weight', () => {
    expect(addToCart([], potato)).toEqual([{ id: 'potato', grams: 1000 }]);
  });

  it('adds one step to a product already in the cart', () => {
    const cart: Cart = [{ id: 'carrot', grams: 500 }];
    expect(incrementItem(cart, carrot)).toEqual([
      { id: 'carrot', grams: 1000 },
    ]);
  });

  it('does not exceed max and keeps the same cart object', () => {
    const cart: Cart = [{ id: 'carrot', grams: 2000 }];
    expect(incrementItem(cart, carrot)).toBe(cart);
  });

  it('keeps the order of items', () => {
    const cart = addToCart(addToCart([], carrot), potato);
    expect(incrementItem(cart, carrot).map((item) => item.id)).toEqual([
      'carrot',
      'potato',
    ]);
  });
});

describe('decrementItem', () => {
  it('removes one step', () => {
    const cart: Cart = [{ id: 'carrot', grams: 1500 }];
    expect(decrementItem(cart, carrot)).toEqual([
      { id: 'carrot', grams: 1000 },
    ]);
  });

  it('removes the item below the minimal weight', () => {
    const cart: Cart = [{ id: 'carrot', grams: 500 }];
    expect(decrementItem(cart, carrot)).toEqual([]);
  });

  it('ignores products that are not in the cart', () => {
    const cart: Cart = [];
    expect(decrementItem(cart, carrot)).toBe(cart);
  });
});

describe('setItemGrams / removeFromCart', () => {
  it('normalizes the new weight', () => {
    const cart: Cart = [{ id: 'carrot', grams: 500 }];
    expect(setItemGrams(cart, carrot, 1400)).toEqual([
      { id: 'carrot', grams: 1500 },
    ]);
  });

  it('removes an item by id', () => {
    const cart: Cart = [
      { id: 'carrot', grams: 500 },
      { id: 'potato', grams: 1000 },
    ];
    expect(removeFromCart(cart, 'carrot')).toEqual([
      { id: 'potato', grams: 1000 },
    ]);
  });
});

describe('canIncrement', () => {
  it('is false at the maximal weight', () => {
    expect(canIncrement(carrot, 1500)).toBe(true);
    expect(canIncrement(carrot, 2000)).toBe(false);
  });
});

describe('lines and total', () => {
  it('rounds the line cost to whole kopecks', () => {
    // 1.99 руб./кг × 0.5 кг = 0.995 руб. → 1.00 руб.
    expect(lineCost(199, 500)).toBe(100);
  });

  it('joins the cart with products and sums the total', () => {
    const cart: Cart = [
      { id: 'carrot', grams: 1500 },
      { id: 'potato', grams: 2000 },
      { id: 'removed-from-catalog', grams: 1000 },
    ];
    const lines = getCartLines(cart, [carrot, potato]);

    expect(lines.map((line) => [line.product.id, line.cost])).toEqual([
      ['carrot', 225],
      ['potato', 398],
    ]);
    expect(getCartTotal(lines)).toBe(623);
  });
});

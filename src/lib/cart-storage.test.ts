import { beforeEach, describe, expect, it } from 'vitest';
import type { Product } from '../types.ts';
import { loadCart, parseCart, saveCart } from './cart-storage.ts';
import type { CartStorage } from './cart-storage.ts';

const KEY = 'test:cart';

const carrot: Product = {
  id: 'carrot',
  name: 'Морковь',
  description: '',
  pricePerKg: 180,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
};
const products = [carrot];

beforeEach(() => {
  localStorage.clear();
});

describe('saveCart + loadCart', () => {
  it('round-trips a cart through localStorage', () => {
    saveCart(localStorage, KEY, [{ id: 'carrot', grams: 1500 }]);
    expect(loadCart(localStorage, KEY, products)).toEqual([
      { id: 'carrot', grams: 1500 },
    ]);
  });

  it('returns an empty cart when nothing is stored', () => {
    expect(loadCart(localStorage, KEY, products)).toEqual([]);
  });

  it('returns an empty cart for corrupted JSON', () => {
    localStorage.setItem(KEY, '{not json');
    expect(loadCart(localStorage, KEY, products)).toEqual([]);
  });

  it('works without storage', () => {
    expect(loadCart(null, KEY, products)).toEqual([]);
    expect(() => saveCart(null, KEY, [])).not.toThrow();
  });

  it('survives a storage that throws', () => {
    const broken: CartStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(loadCart(broken, KEY, products)).toEqual([]);
    expect(() =>
      saveCart(broken, KEY, [{ id: 'carrot', grams: 500 }])
    ).not.toThrow();
  });
});

describe('parseCart', () => {
  it.each([
    ['null', null],
    ['an array', []],
    ['a wrong version', { version: 99, items: [] }],
    ['items that are not an array', { version: 1, items: 'x' }],
  ])('rejects %s', (_label, data) => {
    expect(parseCart(data, products)).toEqual([]);
  });

  it('drops malformed entries, unknown products and duplicates', () => {
    const data = {
      version: 1,
      items: [
        { id: 'carrot', grams: 1000 },
        { id: 'carrot', grams: 2000 },
        { id: 'unknown', grams: 500 },
        { id: 42, grams: 500 },
        { id: 'carrot' },
        'junk',
      ],
    };
    expect(parseCart(data, products)).toEqual([{ id: 'carrot', grams: 1000 }]);
  });

  it('snaps stored weights to the product rules', () => {
    const data = { version: 1, items: [{ id: 'carrot', grams: 99_999 }] };
    expect(parseCart(data, products)).toEqual([{ id: 'carrot', grams: 2000 }]);
  });
});

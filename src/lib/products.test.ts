import { describe, expect, it } from 'vitest';
import type { Product } from '../types.ts';
import { pickProducts } from './products.ts';

const product = (id: string): Product => ({
  id,
  name: id,
  description: '',
  pricePerKg: 100,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 1000 },
});

describe('pickProducts', () => {
  const all = [product('a'), product('b'), product('c')];

  it('keeps the order of the requested ids', () => {
    expect(pickProducts(all, ['c', 'a']).map((p) => p.id)).toEqual(['c', 'a']);
  });

  it('skips unknown ids', () => {
    expect(pickProducts(all, ['x', 'b']).map((p) => p.id)).toEqual(['b']);
  });
});

import { describe, expect, it } from 'vitest';
import { featuredProductIds, products } from './products.ts';

// Guards the product data: real data will replace the mocks,
// and a typo there would silently break the catalog or order totals.
describe('products data', () => {
  it('has unique ids', () => {
    const ids = products.map((product) => product.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(products)('$id: price is a positive whole number of kopecks', (p) => {
    expect(Number.isInteger(p.pricePerKg)).toBe(true);
    expect(p.pricePerKg).toBeGreaterThan(0);
  });

  it.each(products)('$id: weight rules are consistent', ({ weight }) => {
    expect(Number.isInteger(weight.min)).toBe(true);
    expect(Number.isInteger(weight.step)).toBe(true);
    expect(weight.step).toBeGreaterThan(0);
    expect(weight.min).toBeGreaterThan(0);
    expect(weight.max).toBeGreaterThanOrEqual(weight.min);
    expect((weight.max - weight.min) % weight.step).toBe(0);
  });

  it.each(products)('$id: has name, description and image alt', (p) => {
    expect(p.name.trim()).not.toBe('');
    expect(p.description.trim()).not.toBe('');
    expect(p.image.alt.trim()).not.toBe('');
  });

  it('featured products exist in the catalog', () => {
    const ids = new Set(products.map((product) => product.id));
    for (const id of featuredProductIds) {
      expect(ids.has(id)).toBe(true);
    }
  });
});

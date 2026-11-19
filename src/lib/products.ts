import type { Product } from '../types.ts';

/** Returns products in the order of `ids`, skipping unknown ids. */
export function pickProducts(
  all: readonly Product[],
  ids: readonly string[]
): Product[] {
  const byId = new Map(all.map((product) => [product.id, product]));
  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}

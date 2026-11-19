import { cartContent } from '../data/content.ts';
import type { Grams } from '../types.ts';
import { formatWeight } from './format.ts';

/** Screen reader message after the weight of a product changed. */
export function cartChangeMessage(name: string, grams: Grams | undefined) {
  return grams === undefined
    ? `${cartContent.removed}: ${name}`
    : `${name}: ${formatWeight(grams)} в корзине`;
}

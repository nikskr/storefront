import { catalogContent } from '../data/content.ts';
import { findItem } from '../lib/cart.ts';
import { cartChangeMessage } from '../lib/cart-messages.ts';
import type { CartStore } from '../lib/cart-store.ts';
import { el } from '../lib/dom.ts';
import type { Product } from '../types.ts';
import { createProductCard } from './product-card.ts';

interface CatalogOptions {
  products: readonly Product[];
  store: CartStore;
  /** Sends a message to the screen reader live region. */
  announce: (message: string) => void;
  content?: typeof catalogContent;
}

/** Catalog heading and product cards synced with the cart store. */
export function createCatalog(
  root: HTMLElement,
  { products, store, announce, content = catalogContent }: CatalogOptions
) {
  const weightOf = (id: string) => findItem(store.getCart(), id)?.grams;

  const announceWeight = (product: Product) =>
    announce(cartChangeMessage(product.name, weightOf(product.id)));

  const cards = products.map((product) => {
    const run = (action: (id: string) => void) => () => {
      action(product.id);
      announceWeight(product);
    };
    return {
      id: product.id,
      card: createProductCard({
        product,
        addLabel: content.addButton,
        onAdd: run(store.add),
        onIncrement: run(store.increment),
        onDecrement: run(store.decrement),
      }),
    };
  });

  root.replaceChildren(
    el('h1', {
      className: 'catalog__title',
      text: content.title,
      attrs: { id: 'catalog-title' },
    }),
    el('p', { className: 'catalog__text', text: content.text }),
    el(
      'ul',
      { className: 'catalog__list' },
      cards.map(({ card }) =>
        el('li', { className: 'catalog__item' }, [card.element])
      )
    )
  );

  const sync = () => {
    for (const { id, card } of cards) card.update(weightOf(id));
  };
  store.subscribe(sync);
  sync();
}

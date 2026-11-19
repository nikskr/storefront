// Small cart indicators: the header link with a counter (all pages)
// and the bottom bar on mobile (catalog page).
import { cartContent } from '../data/content.ts';
import type { CartStore } from '../lib/cart-store.ts';
import { formatPrice, pluralize } from '../lib/format.ts';

/** Updates the header cart link: counter badge and accessible label. */
export function initHeaderCart(
  link: HTMLAnchorElement,
  badge: HTMLElement,
  store: CartStore
) {
  const render = () => {
    const count = store.getCart().length;
    badge.textContent = String(count);
    badge.hidden = count === 0;
    link.setAttribute(
      'aria-label',
      count === 0
        ? cartContent.linkLabel
        : `${cartContent.linkLabel}: ${pluralize(count, cartContent.itemForms)}`
    );
  };
  store.subscribe(render);
  render();
}

/** Fixed bottom bar "Корзина · 3 товара · 12,40 руб." shown on mobile. */
export function initCartBar(bar: HTMLElement, store: CartStore) {
  const render = () => {
    const count = store.getCart().length;
    bar.hidden = count === 0;
    bar.textContent = [
      cartContent.linkLabel,
      pluralize(count, cartContent.itemForms),
      formatPrice(store.getTotal()),
    ].join(' · ');
  };
  store.subscribe(render);
  render();
}

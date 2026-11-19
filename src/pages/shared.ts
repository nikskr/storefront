// Parts every page has: cart store, header cart link, footer
// and cart sync between browser tabs.
import { initHeaderCart } from '../components/cart-summary.ts';
import { renderFooter } from '../components/footer.ts';
import { CART } from '../config.ts';
import { products } from '../data/products.ts';
import { getBrowserStorage } from '../lib/cart-storage.ts';
import { createCartStore } from '../lib/cart-store.ts';
import type { CartStore } from '../lib/cart-store.ts';
import { requireElement } from '../lib/dom.ts';

export function initPage(): CartStore {
  const store = createCartStore({ products, storage: getBrowserStorage() });

  initHeaderCart(
    requireElement<HTMLAnchorElement>('[data-header-cart]'),
    requireElement('[data-header-cart-count]'),
    store
  );
  renderFooter(requireElement('[data-footer]'));

  // Another tab changed the cart: re-read it so all tabs show the same.
  window.addEventListener('storage', (event) => {
    if (event.key === CART.storageKey) store.reload();
  });

  return store;
}

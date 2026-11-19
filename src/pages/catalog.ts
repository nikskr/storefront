// Entry point of catalog.html: product cards and the cart.
import { createCartView } from '../components/cart.ts';
import { initCartBar } from '../components/cart-summary.ts';
import { createCatalog } from '../components/catalog.ts';
import { createCheckout } from '../components/checkout.ts';
import { products } from '../data/products.ts';
import { requireElement } from '../lib/dom.ts';
import { initPage } from './shared.ts';

const store = initPage();

const status = requireElement('[data-cart-status]');
const announce = (message: string) => {
  status.textContent = message;
};

createCatalog(requireElement('[data-catalog]'), { products, store, announce });
createCartView(requireElement('[data-cart]'), { store, announce });
createCheckout(requireElement('[data-checkout]'), { store });
initCartBar(requireElement('[data-cart-bar]'), store);

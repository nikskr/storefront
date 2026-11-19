import { beforeEach, describe, expect, it } from 'vitest';
import { createCartStore } from '../lib/cart-store.ts';
import type { CartStore } from '../lib/cart-store.ts';
import type { Product } from '../types.ts';
import { initCartBar, initHeaderCart } from './cart-summary.ts';

const product = (id: string): Product => ({
  id,
  name: id,
  description: '',
  pricePerKg: 200,
  image: { src: '', alt: id },
  weight: { min: 500, step: 500, max: 2000 },
});

let store: CartStore;

beforeEach(() => {
  localStorage.clear();
  store = createCartStore({
    products: [product('a'), product('b')],
    storage: localStorage,
    key: 't',
  });
});

describe('initHeaderCart', () => {
  it('hides the counter for an empty cart and shows it otherwise', () => {
    document.body.innerHTML =
      '<a data-link href="#cart">Корзина <span data-badge></span></a>';
    const link = document.querySelector('[data-link]') as HTMLAnchorElement;
    const badge = document.querySelector('[data-badge]') as HTMLElement;
    initHeaderCart(link, badge, store);

    expect(badge.hidden).toBe(true);
    expect(link.getAttribute('aria-label')).toBe('Корзина');

    store.add('a');
    store.add('b');

    expect(badge.hidden).toBe(false);
    expect(badge.textContent).toBe('2');
    expect(link.getAttribute('aria-label')).toBe('Корзина: 2 товара');
  });
});

describe('initCartBar', () => {
  it('shows count and total only when the cart is not empty', () => {
    document.body.innerHTML = '<a data-bar href="#cart"></a>';
    const bar = document.querySelector('[data-bar]') as HTMLElement;
    initCartBar(bar, store);

    expect(bar.hidden).toBe(true);

    store.add('a');
    expect(bar.hidden).toBe(false);
    expect(bar.textContent).toBe('Корзина · 1 товар · 1,00 руб.');
  });
});

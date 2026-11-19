import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { CART } from '../config.ts';
import { products } from '../data/products.ts';

// Smoke test: the real catalog.html markup + the page script work together.
beforeAll(async () => {
  localStorage.clear();
  // Node path helpers: in jsdom `URL` is jsdom's class, not Node's.
  const here = dirname(fileURLToPath(import.meta.url));
  const html = readFileSync(join(here, '..', 'catalog.html'), 'utf8');
  document.body.innerHTML =
    /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  await import('./catalog.ts');
});

const firstProduct = products[0];

describe('catalog page', () => {
  it('renders a card for every product', () => {
    expect(document.querySelectorAll('.product-card')).toHaveLength(
      products.length
    );
  });

  it('starts with an empty cart', () => {
    expect(document.querySelector<HTMLElement>('.cart__empty')?.hidden).toBe(
      false
    );
    expect(document.querySelector<HTMLElement>('[data-cart-bar]')?.hidden).toBe(
      true
    );
  });

  it('adding a product updates the cart, header, bar, status and storage', () => {
    if (!firstProduct) throw new Error('no products');
    document
      .querySelector<HTMLButtonElement>(
        `#${firstProduct.id} .product-card__add`
      )
      ?.click();

    expect(document.querySelectorAll('.cart-item')).toHaveLength(1);
    expect(
      document.querySelector('[data-header-cart-count]')?.textContent
    ).toBe('1');
    expect(document.querySelector<HTMLElement>('[data-cart-bar]')?.hidden).toBe(
      false
    );
    expect(document.querySelector('[data-cart-status]')?.textContent).toContain(
      firstProduct.name
    );
    expect(localStorage.getItem(CART.storageKey)).toContain(firstProduct.id);
  });

  it('shows the checkout form once the cart has items', () => {
    expect(document.querySelector<HTMLElement>('[data-checkout]')?.hidden).toBe(
      false
    );
    expect(document.querySelector('#checkout-phone')).not.toBeNull();
    expect(
      document.querySelector<HTMLInputElement>('#checkout-consent')?.checked
    ).toBe(false);
  });

  it('every section is labelled by an existing heading', () => {
    for (const region of document.querySelectorAll('[aria-labelledby]')) {
      const id = region.getAttribute('aria-labelledby') ?? '';
      expect(document.getElementById(id), id).not.toBeNull();
    }
  });
});

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { advantagesContent, contacts, hero } from '../data/content.ts';
import { featuredProductIds } from '../data/products.ts';

// Smoke test: the real index.html markup + the page script work together.
beforeAll(async () => {
  // Node path helpers: in jsdom `URL` is jsdom's class, not Node's.
  const here = dirname(fileURLToPath(import.meta.url));
  const html = readFileSync(join(here, '..', 'index.html'), 'utf8');
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  document.body.innerHTML = body;
  await import('./home.ts');
});

describe('home page', () => {
  it('renders the hero with a link to the catalog', () => {
    expect(document.querySelector('.hero__title')?.textContent).toBe(
      hero.title
    );
    expect(document.querySelector('.hero__button')?.getAttribute('href')).toBe(
      'catalog.html'
    );
  });

  it('renders a slide for every featured product', () => {
    expect(document.querySelectorAll('.slider__slide')).toHaveLength(
      featuredProductIds.length
    );
  });

  it('renders all advantages', () => {
    expect(document.querySelectorAll('.advantages__item')).toHaveLength(
      advantagesContent.items.length
    );
  });

  it('renders contact phones in the footer', () => {
    expect(document.querySelectorAll('.footer__phone')).toHaveLength(
      contacts.phones.length
    );
  });

  it('every section is labelled by an existing heading', () => {
    for (const section of document.querySelectorAll('section')) {
      const id = section.getAttribute('aria-labelledby') ?? '';
      expect(document.getElementById(id), id).not.toBeNull();
    }
  });
});

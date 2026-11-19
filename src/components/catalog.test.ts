import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCartStore } from '../lib/cart-store.ts';
import type { CartStore } from '../lib/cart-store.ts';
import type { Product } from '../types.ts';
import { createCatalog } from './catalog.ts';

const product = (id: string, name: string): Product => ({
  id,
  name,
  description: 'Описание',
  pricePerKg: 180,
  image: { src: 'images/placeholder.svg', alt: name },
  weight: { min: 500, step: 500, max: 1000 },
});

const products = [product('carrot', 'Морковь'), product('beet', 'Свёкла')];

let root: HTMLElement;
let store: CartStore;
let announce: ReturnType<typeof vi.fn<(message: string) => void>>;

const card = (id: string) =>
  root.querySelector<HTMLElement>(`#${id}`) as HTMLElement;
const addButton = (id: string) =>
  card(id).querySelector<HTMLButtonElement>(
    '.product-card__add'
  ) as HTMLButtonElement;
const stepper = (id: string) =>
  card(id).querySelector<HTMLElement>('.stepper') as HTMLElement;
const stepperButtons = (id: string) =>
  stepper(id).querySelectorAll<HTMLButtonElement>('.stepper__button');

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<section data-catalog></section>';
  root = document.querySelector<HTMLElement>('[data-catalog]') as HTMLElement;
  store = createCartStore({ products, storage: localStorage, key: 't' });
  announce = vi.fn<(message: string) => void>();
  createCatalog(root, { products, store, announce });
});

describe('createCatalog', () => {
  it('renders the title and a card per product with an anchor id', () => {
    expect(root.querySelector('#catalog-title')?.textContent).toBe('Каталог');
    expect(root.querySelectorAll('.product-card')).toHaveLength(2);
    expect(
      card('carrot').querySelector('.product-card__price')?.textContent
    ).toBe('1,80 руб./кг');
  });

  it('shows the add button for products out of the cart', () => {
    expect(addButton('carrot').hidden).toBe(false);
    expect(stepper('carrot').hidden).toBe(true);
  });

  it('adds the minimal weight and swaps the button for a stepper', () => {
    addButton('carrot').focus();
    addButton('carrot').click();

    expect(store.getCart()).toEqual([{ id: 'carrot', grams: 500 }]);
    expect(addButton('carrot').hidden).toBe(true);
    expect(stepper('carrot').hidden).toBe(false);
    expect(stepper('carrot').textContent).toContain('0,5 кг');
    expect(announce).toHaveBeenLastCalledWith('Морковь: 0,5 кг в корзине');
    // Focus moved to "+" so keyboard users can keep adjusting the weight.
    expect(document.activeElement).toBe(stepperButtons('carrot')[1]);
  });

  it('stepper changes weight; "+" is disabled at max', () => {
    addButton('carrot').click();
    stepperButtons('carrot')[1]?.click();

    expect(store.getCart()).toEqual([{ id: 'carrot', grams: 1000 }]);
    expect(stepperButtons('carrot')[1]?.disabled).toBe(true);
  });

  it('removing below the minimal weight brings the add button back', () => {
    addButton('carrot').click();
    stepperButtons('carrot')[0]?.focus();
    stepperButtons('carrot')[0]?.click();

    expect(store.getCart()).toEqual([]);
    expect(addButton('carrot').hidden).toBe(false);
    expect(document.activeElement).toBe(addButton('carrot'));
    expect(announce).toHaveBeenLastCalledWith('Удалено из корзины: Морковь');
  });

  it('reflects changes made elsewhere (e.g. in the cart panel)', () => {
    store.add('beet');
    expect(stepper('beet').hidden).toBe(false);
  });
});

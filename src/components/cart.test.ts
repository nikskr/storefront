import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCartStore } from '../lib/cart-store.ts';
import type { CartStore } from '../lib/cart-store.ts';
import type { Product } from '../types.ts';
import { createCartView } from './cart.ts';

const product = (id: string, name: string, pricePerKg: number): Product => ({
  id,
  name,
  description: '',
  pricePerKg,
  image: { src: '', alt: name },
  weight: { min: 500, step: 500, max: 2000 },
});

const products = [
  product('carrot', 'Морковь', 180),
  product('tomato', 'Томаты', 690),
];

let root: HTMLElement;
let store: CartStore;
let announce: ReturnType<typeof vi.fn<(message: string) => void>>;

const q = <T extends Element = HTMLElement>(selector: string) =>
  root.querySelector<T>(selector) as T;
const rows = () => [...root.querySelectorAll<HTMLElement>('.cart-item')];

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<aside data-cart></aside>';
  root = document.querySelector<HTMLElement>('[data-cart]') as HTMLElement;
  store = createCartStore({ products, storage: localStorage, key: 't' });
  announce = vi.fn<(message: string) => void>();
  createCartView(root, { store, announce });
});

describe('createCartView', () => {
  it('shows the empty state and hides the summary', () => {
    expect(q('.cart__empty').hidden).toBe(false);
    expect(q('.cart__list').hidden).toBe(true);
    expect(q('.cart__total').hidden).toBe(true);
    expect(q('.cart__clear').hidden).toBe(true);
  });

  it('lists items with weight, line cost and the total', () => {
    store.add('carrot');
    store.increment('carrot'); // 1 кг × 1,80
    store.add('tomato'); // 0,5 кг × 6,90

    expect(q('.cart__empty').hidden).toBe(true);
    expect(
      rows().map((row) => row.querySelector('.cart-item__name')?.textContent)
    ).toEqual(['Морковь', 'Томаты']);
    expect(rows()[0]?.querySelector('.stepper__value')?.textContent).toBe(
      '1 кг'
    );
    expect(rows()[1]?.querySelector('.cart-item__cost')?.textContent).toBe(
      '3,45 руб.'
    );
    expect(q('.cart__total-value').textContent).toBe('5,25 руб.');
  });

  it('updates rows in place so focus is not lost', () => {
    store.add('carrot');
    const row = rows()[0];
    const plus =
      row?.querySelectorAll<HTMLButtonElement>('.stepper__button')[1];
    plus?.focus();
    plus?.click();

    expect(rows()[0]).toBe(row);
    expect(document.activeElement).toBe(plus);
    expect(row?.querySelector('.stepper__value')?.textContent).toBe('1 кг');
    expect(announce).toHaveBeenLastCalledWith('Морковь: 1 кг в корзине');
  });

  it('removes an item and moves focus to the cart title', () => {
    store.add('carrot');
    const remove = q<HTMLButtonElement>('.cart-item__remove');
    expect(remove.getAttribute('aria-label')).toBe('Удалить: Морковь');

    remove.focus();
    remove.click();

    expect(store.getCart()).toEqual([]);
    expect(rows()).toHaveLength(0);
    expect(document.activeElement).toBe(q('#cart-title'));
    expect(announce).toHaveBeenLastCalledWith('Удалено из корзины: Морковь');
  });

  it('clears the cart', () => {
    store.add('carrot');
    store.add('tomato');
    q<HTMLButtonElement>('.cart__clear').click();

    expect(store.getCart()).toEqual([]);
    expect(q('.cart__empty').hidden).toBe(false);
    expect(announce).toHaveBeenLastCalledWith('Корзина очищена');
  });
});

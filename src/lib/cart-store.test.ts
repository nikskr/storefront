import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types.ts';
import { createCartStore } from './cart-store.ts';

const KEY = 'test:cart';

const carrot: Product = {
  id: 'carrot',
  name: 'Морковь',
  description: '',
  pricePerKg: 180,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 1000 },
};

const createStore = () =>
  createCartStore({ products: [carrot], storage: localStorage, key: KEY });

beforeEach(() => {
  localStorage.clear();
});

describe('createCartStore', () => {
  it('adds, increments, decrements and removes items', () => {
    const store = createStore();

    store.add('carrot');
    expect(store.getCart()).toEqual([{ id: 'carrot', grams: 500 }]);
    store.increment('carrot');
    expect(store.getCart()).toEqual([{ id: 'carrot', grams: 1000 }]);
    store.decrement('carrot');
    store.decrement('carrot');
    expect(store.getCart()).toEqual([]);
  });

  it('computes lines and total', () => {
    const store = createStore();
    store.add('carrot');
    store.increment('carrot');

    expect(store.getLines()).toHaveLength(1);
    expect(store.getTotal()).toBe(180);
  });

  it('ignores unknown product ids', () => {
    const store = createStore();
    store.add('unknown');
    expect(store.getCart()).toEqual([]);
  });

  it('persists changes and restores them in a new store', () => {
    createStore().add('carrot');
    expect(createStore().getCart()).toEqual([{ id: 'carrot', grams: 500 }]);
  });

  it('notifies subscribers only on real changes', () => {
    const store = createStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.add('carrot');
    store.increment('carrot');
    store.increment('carrot'); // already at max: no change
    store.clear();
    store.clear(); // already empty: no change

    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    store.add('carrot');
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('reload picks up changes made in another tab', () => {
    const store = createStore();
    createStore().add('carrot');

    expect(store.getCart()).toEqual([]);
    store.reload();
    expect(store.getCart()).toEqual([{ id: 'carrot', grams: 500 }]);
  });
});

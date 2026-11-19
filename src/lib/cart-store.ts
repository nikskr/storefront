// Cart state shared by all components on a page: keeps the current cart,
// saves every change to storage and notifies subscribers.
import { CART } from '../config.ts';
import type { Kopecks, Product } from '../types.ts';
import {
  addToCart,
  decrementItem,
  getCartLines,
  getCartTotal,
  incrementItem,
  removeFromCart,
} from './cart.ts';
import type { Cart, CartLine } from './cart.ts';
import { loadCart, saveCart } from './cart-storage.ts';
import type { CartStorage } from './cart-storage.ts';

type Listener = (cart: Cart) => void;

export interface CartStore {
  getCart(): Cart;
  getLines(): CartLine[];
  getTotal(): Kopecks;
  add(id: string): void;
  increment(id: string): void;
  decrement(id: string): void;
  remove(id: string): void;
  clear(): void;
  /** Re-reads storage, e.g. after the cart changed in another tab. */
  reload(): void;
  /** Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void;
}

interface CartStoreOptions {
  products: readonly Product[];
  storage: CartStorage | null;
  key?: string;
}

export function createCartStore({
  products,
  storage,
  key = CART.storageKey,
}: CartStoreOptions): CartStore {
  const byId = new Map(products.map((product) => [product.id, product]));
  const listeners = new Set<Listener>();
  let cart = loadCart(storage, key, products);

  function commit(next: Cart, persist = true) {
    if (next === cart) return;
    cart = next;
    if (persist) saveCart(storage, key, cart);
    for (const listener of listeners) listener(cart);
  }

  function update(id: string, change: (cart: Cart, product: Product) => Cart) {
    const product = byId.get(id);
    if (product) commit(change(cart, product));
  }

  return {
    getCart: () => cart,
    getLines: () => getCartLines(cart, products),
    getTotal: () => getCartTotal(getCartLines(cart, products)),
    add: (id) => update(id, addToCart),
    increment: (id) => update(id, incrementItem),
    decrement: (id) => update(id, decrementItem),
    remove: (id) => commit(removeFromCart(cart, id)),
    clear: () => commit(cart.length ? [] : cart),
    reload: () => commit(loadCart(storage, key, products), false),
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

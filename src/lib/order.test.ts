import { describe, expect, it } from 'vitest';
import type { Product } from '../types.ts';
import { getCartLines } from './cart.ts';
import type { Cart } from './cart.ts';
import { buildOrderRequest } from './order.ts';

const carrot: Product = {
  id: 'carrot',
  name: 'Морковь',
  description: '',
  pricePerKg: 180,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
};

describe('buildOrderRequest', () => {
  it('builds the request from the cart', () => {
    const cart: Cart = [{ id: 'carrot', grams: 1500 }];

    expect(
      buildOrderRequest({
        orderId: 'abc',
        phone: '+375291234567',
        cart,
        lines: getCartLines(cart, [carrot]),
      })
    ).toEqual({
      orderId: 'abc',
      phone: '+375291234567',
      consent: true,
      items: [{ id: 'carrot', grams: 1500 }],
      total: 270,
      website: '',
    });
  });
});

import { describe, expect, it } from 'vitest';
import type { Product } from '../../src/types.ts';
import { validateOrder } from './order-validation.ts';

const carrot: Product = {
  id: 'carrot',
  name: 'Морковь',
  description: '',
  pricePerKg: 180,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
};
const tomato: Product = {
  ...carrot,
  id: 'tomato',
  name: 'Томаты',
  pricePerKg: 690,
};
const products = [carrot, tomato];

const valid = {
  orderId: 'order-12345678',
  phone: '+375291234567',
  consent: true,
  items: [
    { id: 'carrot', grams: 1500 },
    { id: 'tomato', grams: 500 },
  ],
  total: 270 + 345,
  website: '',
};

const withChanges = (changes: Record<string, unknown>) => ({
  ...valid,
  ...changes,
});

describe('validateOrder', () => {
  it('accepts a valid order and recalculates lines', () => {
    const result = validateOrder(valid, products);

    expect(result.ok && 'order' in result && result.order).toMatchObject({
      orderId: 'order-12345678',
      phone: '+375291234567',
      total: 615,
    });
  });

  it('normalizes the phone', () => {
    const result = validateOrder(
      withChanges({ phone: '8 (029) 123-45-67' }),
      products
    );
    expect(result.ok && 'order' in result && result.order.phone).toBe(
      '+375291234567'
    );
  });

  it('flags a filled honeypot as spam without other checks', () => {
    expect(
      validateOrder({ website: 'https://spam.example' }, products)
    ).toEqual({ ok: true, spam: true });
  });

  it.each([
    ['not an object', 'text', 'invalid_request'],
    [
      'missing order id',
      withChanges({ orderId: undefined }),
      'invalid_request',
    ],
    ['bad order id', withChanges({ orderId: '<script>' }), 'invalid_request'],
    ['no consent', withChanges({ consent: undefined }), 'consent_required'],
    [
      'consent as a string',
      withChanges({ consent: 'true' }),
      'consent_required',
    ],
    ['bad phone', withChanges({ phone: '+48 123 456 789' }), 'invalid_phone'],
    [
      'phone not a string',
      withChanges({ phone: 375291234567 }),
      'invalid_phone',
    ],
    ['empty items', withChanges({ items: [] }), 'invalid_items'],
    [
      'unknown product',
      withChanges({ items: [{ id: 'x', grams: 500 }] }),
      'invalid_items',
    ],
    [
      'duplicate product',
      withChanges({
        items: [
          { id: 'carrot', grams: 500 },
          { id: 'carrot', grams: 500 },
        ],
      }),
      'invalid_items',
    ],
    [
      'weight off-step',
      withChanges({ items: [{ id: 'carrot', grams: 700 }] }),
      'invalid_items',
    ],
    [
      'weight over max',
      withChanges({ items: [{ id: 'carrot', grams: 9000 }] }),
      'invalid_items',
    ],
    [
      'too many items',
      withChanges({
        items: Array.from({ length: 51 }, () => ({ id: 'carrot', grams: 500 })),
      }),
      'invalid_items',
    ],
  ])('rejects %s', (_label, data, error) => {
    const result = validateOrder(data, products);
    expect(result).toMatchObject({ ok: false, error, status: 400 });
  });

  it('rejects a total that differs from server prices with 409', () => {
    expect(validateOrder(withChanges({ total: 1 }), products)).toEqual({
      ok: false,
      error: 'price_changed',
      status: 409,
    });
  });
});

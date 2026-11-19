import { describe, expect, it } from 'vitest';
import type { Product } from '../../src/types.ts';
import { escapeHtml, formatOrderMessage } from './telegram-message.ts';

const product = (name: string, pricePerKg: number): Product => ({
  id: name,
  name,
  description: '',
  pricePerKg,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
});

describe('escapeHtml', () => {
  it('escapes Telegram HTML special characters', () => {
    expect(escapeHtml('<b>Tom & Jerry</b>')).toBe(
      '&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;'
    );
  });
});

describe('formatOrderMessage', () => {
  // 15:30 UTC = 18:30 in Minsk (UTC+3).
  const receivedAt = new Date('2026-11-19T15:30:05Z');

  const message = formatOrderMessage(
    {
      orderId: 'a1b2c3d4-e5f6-7890',
      phone: '+375291234567',
      lines: [
        { product: product('Морковь', 180), grams: 1500, cost: 270 },
        { product: product('Лук <красный>', 190), grams: 500, cost: 95 },
      ],
      total: 365,
    },
    receivedAt
  );

  it('contains phone, Minsk time, items and total', () => {
    expect(message).toContain('<code>a1b2c3d4</code>');
    expect(message).toContain('📞 Телефон: +375 (29) 123-45-67');
    expect(message).toContain('🕒 Время заказа: 19.11.2026, 18:30:05');
    expect(message).toContain('• Морковь: 1,5 кг × 1,80 руб./кг = 2,70 руб.');
    expect(message).toContain('<b>Итого: 3,65 руб.</b>');
  });

  it('records the consent with its time', () => {
    expect(message).toContain(
      '✅ Согласие на обработку персональных данных получено 19.11.2026, 18:30:05'
    );
  });

  it('escapes product names', () => {
    expect(message).toContain('Лук &lt;красный&gt;');
    expect(message).not.toContain('<красный>');
  });
});

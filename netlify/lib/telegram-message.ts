// Text of the order message for the seller (Telegram HTML parse mode).
import { CURRENCY } from '../../src/config.ts';
import {
  formatPhone,
  formatPrice,
  formatPricePerKg,
  formatWeight,
} from '../../src/lib/format.ts';
import type { ValidOrder } from './order-validation.ts';

/** Seller's time zone: order times are shown in Minsk time. */
export const TIME_ZONE = 'Europe/Minsk';

const dateTime = new Intl.DateTimeFormat(CURRENCY.locale, {
  timeZone: TIME_ZONE,
  dateStyle: 'short',
  timeStyle: 'medium',
});

/** Escapes text for Telegram HTML: only &, < and > are special. */
export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function formatOrderMessage(order: ValidOrder, receivedAt: Date) {
  const time = dateTime.format(receivedAt);

  const lines = order.lines.map(
    ({ product, grams, cost }) =>
      `• ${escapeHtml(product.name)}: ${formatWeight(grams)} × ` +
      `${formatPricePerKg(product.pricePerKg)} = ${formatPrice(cost)}`
  );

  return [
    `🛒 <b>Новый заказ</b> <code>${escapeHtml(order.orderId.slice(0, 8))}</code>`,
    '',
    `📞 Телефон: ${escapeHtml(formatPhone(order.phone))}`,
    `🕒 Время заказа: ${time}`,
    '',
    ...lines,
    '',
    `<b>Итого: ${formatPrice(order.total)}</b>`,
    '',
    `✅ Согласие на обработку персональных данных получено ${time}`,
  ].join('\n');
}

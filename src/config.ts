/**
 * Technical settings. Business content (texts, products, contacts)
 * lives in src/data/.
 */

export const CURRENCY = {
  code: 'BYN',
  locale: 'ru-BY',
  /** Short label shown next to prices. */
  label: 'руб.',
} as const;

export const PHONE = {
  countryCode: '375',
  /** Belarusian mobile operator codes: A1, MTS, life. */
  operatorCodes: ['25', '29', '33', '44'],
  /** Subscriber number length after the operator code. */
  subscriberLength: 7,
  placeholder: '+375 (29) 123-45-67',
} as const;

export const CART = {
  storageKey: 'agro:cart',
} as const;

export const ORDER = {
  endpoint: '/api/order',
  timeoutMs: 15_000,
} as const;

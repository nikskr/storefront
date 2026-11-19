import { CURRENCY } from '../config.ts';
import type { Grams, Kopecks } from '../types.ts';

const moneyFormat = new Intl.NumberFormat(CURRENCY.locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 150 → "1,50 руб." */
export function formatPrice(amount: Kopecks): string {
  return `${moneyFormat.format(amount / 100)} ${CURRENCY.label}`;
}

/** 150 → "1,50 руб./кг" */
export function formatPricePerKg(amount: Kopecks): string {
  return `${formatPrice(amount)}/кг`;
}

const weightFormat = new Intl.NumberFormat(CURRENCY.locale, {
  maximumFractionDigits: 3,
});

/** 500 → "0,5 кг", 1000 → "1 кг" */
export function formatWeight(grams: Grams): string {
  return `${weightFormat.format(grams / 1000)} кг`;
}

export interface PluralForms {
  /** 1, 21, 31… товар */
  one: string;
  /** 2–4, 22–24… товара */
  few: string;
  /** 0, 5–20, 25–30… товаров */
  many: string;
}

const pluralRules = new Intl.PluralRules(CURRENCY.locale);

/** (3, forms) → "3 товара" */
export function pluralize(count: number, forms: PluralForms): string {
  const rule = pluralRules.select(count);
  const word =
    rule === 'one' ? forms.one : rule === 'few' ? forms.few : forms.many;
  return `${count} ${word}`;
}

const BY_PHONE = /^\+375(\d{2})(\d{3})(\d{2})(\d{2})$/;

/** "+375290000001" → "+375 (29) 000-00-01". Unknown formats are returned as is. */
export function formatPhone(e164: string): string {
  const match = BY_PHONE.exec(e164);
  if (!match) return e164;
  const [, code, first, second, third] = match;
  return `+375 (${code}) ${first}-${second}-${third}`;
}

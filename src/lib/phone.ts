// Belarusian mobile phone validation. Shared by the site and the
// Netlify Function, so it must stay free of DOM code.
import { PHONE } from '../config.ts';

const operatorCodes: readonly string[] = PHONE.operatorCodes;

/**
 * Normalizes user input to "+375XXXXXXXXX", or returns null if the number
 * is not a Belarusian mobile one. Accepts spaces, brackets and dashes and
 * the common prefixes: +375, 375, 80 and a bare 9-digit number.
 *   "+375 (29) 123-45-67" → "+375291234567"
 *   "8 029 123 45 67"     → "+375291234567"
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!/^[+\d\s()-]+$/.test(trimmed)) return null;
  if (trimmed.indexOf('+') > 0) return null;

  const digits = trimmed.replace(/\D/g, '');
  const national = toNational(digits);
  if (national === null) return null;

  const code = national.slice(0, 2);
  const subscriber = national.slice(2);
  if (!operatorCodes.includes(code)) return null;
  if (subscriber.length !== PHONE.subscriberLength) return null;

  return `+${PHONE.countryCode}${national}`;
}

/** Strips the country or trunk prefix, leaving "operator code + number". */
function toNational(digits: string): string | null {
  const nationalLength = 2 + PHONE.subscriberLength;
  if (digits.startsWith(PHONE.countryCode)) {
    return digits.slice(PHONE.countryCode.length);
  }
  if (digits.startsWith('80') && digits.length === nationalLength + 2) {
    return digits.slice(2);
  }
  if (digits.length === nationalLength) return digits;
  return null;
}

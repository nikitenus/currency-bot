import { toCurrencyCode } from '../domain/currencyCode.js';

export function detectCurrencyCode(text) {
  const words = text.toUpperCase().split(/[^A-Z]+/);

  for (const word of words) {
    const code = toCurrencyCode(word);
    if (code) return code;
  }

  return null;
}

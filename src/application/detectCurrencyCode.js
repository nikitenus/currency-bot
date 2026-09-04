import { toCurrencyCode } from '../domain/currencyCode.js';

function wordsOf(text) {
  return text.toUpperCase().split(/[^A-Z]+/);
}

export function detectCurrencyCode(text) {
  for (const word of wordsOf(text)) {
    const code = toCurrencyCode(word);
    if (code) return code;
  }

  return null;
}

export function findCodeCandidate(text) {
  for (const word of wordsOf(text)) {
    if (/^[A-Z]{3}$/.test(word)) return word;
  }

  return null;
}

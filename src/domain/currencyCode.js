export const CODE_PATTERN = /^[A-Z]{3}$/;

export const SUPPORTED_CURRENCIES = Object.freeze([
  'AUD', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD',
  'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK',
  'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR',
]);

export function isSupportedCurrency(code) {
  return SUPPORTED_CURRENCIES.includes(code);
}

export function toCurrencyCode(candidate) {
  const code = candidate.toUpperCase();
  return isSupportedCurrency(code) ? code : null;
}

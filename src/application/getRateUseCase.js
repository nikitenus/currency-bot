import { detectCurrencyCode, findCodeCandidate } from './detectCurrencyCode.js';
import { QUOTE_CURRENCY, formatSameCurrency, formatRate, formatHint, formatUnknownCode, formatRateError } from './rateFormatter.js';

/**
 * @param {{ ratesProvider: RatesProvider }} deps
 */
export function createGetRateUseCase({ ratesProvider }) {
  async function handle(text) {
    const code = detectCurrencyCode(text);

    if (!code) {
      const candidate = findCodeCandidate(text);
      return candidate ? formatUnknownCode(candidate) : formatHint();
    }
    if (code === QUOTE_CURRENCY) return formatSameCurrency(code);

    try {
      const rateInfo = await ratesProvider.getRate(code, QUOTE_CURRENCY);
      return formatRate(rateInfo);
    } catch {
      return formatRateError(code);
    }
  }

  return { handle };
}

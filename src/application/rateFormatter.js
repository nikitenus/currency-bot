const RATE_PRECISION = 4;

export const QUOTE_CURRENCY = 'USD';

export function formatSameCurrency(code) {
  return `1 ${code} = 1.0000 ${code} — вы указали валюту, которая и так является базовой (${code}).`;
}

export function formatRate({ code, quote, rate, date }) {
  return `Курс ${code} → ${quote} на ${date}: 1 ${code} = ${rate.toFixed(RATE_PRECISION)} ${quote}`;
}

export function formatHint() {
  return `Напишите трёхбуквенный код валюты, и я покажу её курс к USD. Например: курс EUR, GBP, JPY…`;
}

export function formatRateError(code) {
  return `Не удалось получить курс ${code}. Попробуйте ещё раз чуть позже.`;
}

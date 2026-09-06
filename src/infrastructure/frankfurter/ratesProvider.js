export const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev/v1';

export function createRatesProvider({ baseUrl = FRANKFURTER_BASE_URL } = {}) {
  async function getRate(code, quote) {
    const url = `${baseUrl}/latest?from=${code}&to=${quote}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Frankfurter API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const rate = data.rates?.[quote];

    if (typeof rate !== 'number') {
      throw new Error(`Frankfurter API error: нет курса ${code} → ${quote}`);
    }

    return { code, quote, rate, date: data.date };
  }

  return { getRate };
}

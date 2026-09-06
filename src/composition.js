import { createGetRateUseCase } from './application/getRateUseCase.js';
import { createRatesProvider } from './infrastructure/frankfurter/ratesProvider.js';
import { createTelegramSender } from './infrastructure/telegram/sender.js';

export function createBot({ botToken }) {
  const ratesProvider = createRatesProvider();
  const replySender = createTelegramSender({ botToken });
  const getRateUseCase = createGetRateUseCase({ ratesProvider });

  return { getRateUseCase, replySender };
}

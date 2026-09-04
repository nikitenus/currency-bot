import Fastify from 'fastify';

import { createGetRateUseCase } from './application/getRateUseCase.js';
import { createRatesProvider } from './infrastructure/frankfurter/ratesProvider.js';
import { createTelegramSender } from './infrastructure/telegram/sender.js';
import { registerWebhook } from './delivery/webhookController.js';

export function buildApp({ botToken }) {
  const app = Fastify({ logger: true });

  const ratesProvider = createRatesProvider();
  const replySender = createTelegramSender({ botToken });
  const getRateUseCase = createGetRateUseCase({ ratesProvider });

  registerWebhook(app, { getRateUseCase, replySender });

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

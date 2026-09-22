import Fastify from 'fastify';

import { createBot } from './composition.js';
import { registerWebhook } from './delivery/webhookController.js';

export function buildApp({ botToken, supabaseUrl, supabaseKey }) {
  const app = Fastify({ logger: true });
  const bot = createBot({ botToken, supabaseUrl, supabaseKey });

  registerWebhook(app, bot);

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

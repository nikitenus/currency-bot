import { parseUpdate } from './updateParser.js';

export function registerWebhook(app, { getRateUseCase, replySender }) {
  app.post('/webhook/telegram', async (req, reply) => {
    const incoming = parseUpdate(req.body);

    if (incoming) {
      const replyText = await getRateUseCase.handle(incoming.text);
      await replySender.send(incoming.chatId, replyText);
    }

    return reply.code(200).send({ ok: true });
  });
}

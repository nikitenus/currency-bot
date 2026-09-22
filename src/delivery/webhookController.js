import { parseUpdate } from './updateParser.js';

export function registerWebhook(app, { getRateUseCase, replySender, conversations }) {
  app.post('/webhook/telegram', async (req, reply) => {
    const incoming = parseUpdate(req.body);

    if (incoming) {
      const replyText = await getRateUseCase.handle(incoming.text);
      await replySender.send(incoming.chatId, replyText);

      try {
        await conversations.record({ ...incoming, reply: replyText });
      } catch (err) {
        req.log.error(`[supabase] ${err.message}`);
      }
    }

    return reply.code(200).send({ ok: true });
  });
}

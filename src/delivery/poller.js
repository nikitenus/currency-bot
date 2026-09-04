import { TELEGRAM_API_URL } from '../infrastructure/telegram/sender.js';
import { parseUpdate } from './updateParser.js';

export function createPoller({ botToken, getRateUseCase, replySender, log = console }) {
  let offset = 0;

  async function pollOnce() {
    const res = await fetch(`${TELEGRAM_API_URL}${botToken}/getUpdates?timeout=25&offset=${offset}`);

    if (!res.ok) {
      throw new Error(`getUpdates error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    for (const update of data.result ?? []) {
      offset = update.update_id + 1;

      const incoming = parseUpdate(update);
      if (!incoming) continue;

      log.info(`[poller] ${incoming.chatId}: «${incoming.text}»`);
      const replyText = await getRateUseCase.handle(incoming.text);
      await replySender.send(incoming.chatId, replyText);
      log.info(`[poller] → ${replyText}`);
    }
  }

  async function start() {
    log.info('Poller запущен. Напишите боту сообщение в Telegram.');

    while (true) {
      try {
        await pollOnce();
      } catch (err) {
        log.error(`[poller] ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  return { start };
}

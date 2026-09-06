export const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export function createTelegramSender({ botToken }) {
  async function send(chatId, text) {
    const res = await fetch(`${TELEGRAM_API_URL}${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!res.ok) {
      throw new Error(`Telegram sendMessage error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  }

  return { send };
}

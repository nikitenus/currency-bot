export function parseUpdate(update) {
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text;

  if (typeof text !== 'string' || typeof chatId !== 'number') {
    return null;
  }

  return { chatId, text: text.trim() };
}

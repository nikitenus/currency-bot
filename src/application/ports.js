/**
 * Контракты (порты) чистой архитектуры.
 * В JavaScript контракт — это не класс, а описание ожидаемого интерфейса.
 * Реализации живут в src/infrastructure и внедряются в Use Case
 * в composition root (src/app.js).
 */

/**
 * @typedef {Object} RateInfo
 * @property {string} code - код валюты, для которой получен курс
 * @property {string} quote - код валюты котировки (всегда USD)
 * @property {number} rate - сколько единиц quote стоит 1 code
 * @property {string} date - дата курса в формате YYYY-MM-DD
 */

/**
 * Порт источника курсов. Контракт: getRate(code, quote) -> Promise<RateInfo>
 * @typedef {Object} RatesProvider
 */

/**
 * Порт отправки ответа в Telegram. Контракт: send(chatId, text) -> Promise<void>
 * Используется delivery-слоем, не Use Case.
 * @typedef {Object} ReplySender
 */

export {};

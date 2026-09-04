# Архитектура Currency Bot

Задание: Telegram-бот находит код валюты во входящем тексте и отвечает её курсом к USD.
Курсы: https://api.frankfurter.dev/v1/latest · Бэкенд: Fastify · Деплой: Vercel.

C4-диаграммы: [context](./c4/01-context.md) → [container](./c4/02-container.md) → [components](./c4/03-components.md).

## План структуры кода (JS)

```
.
├── docs/c4/                  # C4-диаграммы (Mermaid)
├── api/index.js              # вход для Vercel: Fastify-приложение как serverless-функция
├── src/
│   ├── server.js             # точка входа: локально — poller, на Vercel — экспорт handler
│   ├── app.js                # [main] composition root: Fastify + ручной DI
│   ├── config/env.js         # чтение BOT_TOKEN и пр. из окружения
│   ├── delivery/
│   │   ├── webhookController.js   # Fastify route POST /webhook/telegram
│   │   ├── updateParser.js        # Telegram update → IncomingMessage { chatId, text }
│   │   └── poller.js              # dev: бесконечный getUpdates + тот же Use Case
│   ├── application/
│   │   ├── ports.js               # контракты: ratesProvider.getRate / replySender.send
│   │   ├── getRateUseCase.js      # оркестратор сценария
│   │   ├── detectCurrencyCode.js  # поиск ISO-кода в тексте
│   │   └── rateFormatter.js       # текст ответа
│   ├── infrastructure/
│   │   ├── frankfurter/ratesProvider.js  # HTTP к api.frankfurter.dev
│   │   └── telegram/sender.js            # sendMessage через Bot API
│   └── domain/
│       └── currencyCode.js       # валидация кода + список поддерживаемых
├── vercel.json               # настройка деплоя Vercel
├── .env                      # локально: BOT_TOKEN (в gitignore)
├── .env.example
└── package.json
```

## Сценарий (Use Case)

1. `IncomingMessage { chatId, text }` попадает в `getRateUseCase.handle(...)`.
2. Детектор ищет трёхбуквенный код валюты: если кода нет или он не в списке — ответ-подсказка («напишите код валюты, например EUR»).
3. `ratesProvider.getRate(code)` → Frankfurter `GET /v1/latest?from=<CODE>&to=USD` → `rates[USD]`.
   - Особый случай: пользователь написал USD → отвечаем 1 USD = 1.0000 USD (без запроса к API).
4. `rateFormatter` собирает «Курс EUR → USD на 2026-09-03: 1 EUR = 1.0869 USD».
5. Use Case **возвращает** готовый текст; delivery отправляет его через порт `replySender` → Bot API `sendMessage`.

## Тесты

Чистые модули не зависят от сети: `npm test` (встроенный `node:test`) гоняет
детектор кода и Use Case с фейковым `ratesProvider`.

## Ключевые решения

| Вопрос | Решение | Почему |
|---|---|---|
| Как получать сообщения в проде | **Webhook** (POST на наш эндпоинт) | Vercel — serverless: функция живёт один запрос, `while (true)` с getUpdates невозможен |
| Как разрабатывать локально | **Dev Poller** (long polling) | не нужен публичный URL; тот же Use Case, что и у webhook |
| Слои | delivery → application → domain; infrastructure реализует порты | чистая архитектура: Use Case не знает ни про Fastify, ни про Frankfurter, ни про Telegram |
| DI | ручной, в одном месте (composition root, `app.js`) | проект маленький, фреймворки DI избыточны |
| Состояние | stateless, без БД | Frankfurter обновляет курсы раз в день, БД не нужна; webhook-режим сам отслеживает доставку |
| Код валюты | 3 буквы ISO из списка `/v1/currencies` | детектор не доверяет любому тексту, только валидным кодам |
| Секрет webhook | заголовок `X-Telegram-Bot-Api-Secret-Token` | Vercel-URL публичный; секрет не даёт слать в бота «фейковые» обновления |

## Деплой (Vercel)

1. Репозиторий на GitHub → Import в Vercel (фреймворк Other, root — проект).
2. Env-переменные в Vercel: `BOT_TOKEN` (и `WEBHOOK_SECRET` при желании).
3. Vercel собирает serverless-функцию из `api/index.js`, в которой Fastify обрабатывает запрос.
4. Один раз зарегистрировать URL бота у Telegram:
   `curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project>.vercel.app/webhook/telegram"`.
5. Локально: `WEBHOOK_MODE=0 node src/server.js` — работает polling без webhook.

## Шаги реализации (порядок)

1. `package.json`, установка `fastify`, настройка `vercel.json` — скелет сервера.
2. `domain` + `application`: детектор кода, порты, Use Case, форматтер (чистые модули, тестируются без сети).
3. `infrastructure`: Frankfurter-адаптер и Telegram Sender.
4. `delivery`: Update Parser + webhook route; ручной запуск и проверка.
5. Dev Poller — локальная разработка без webhook.
6. Деплой на Vercel + `setWebhook`; проверка в Telegram.

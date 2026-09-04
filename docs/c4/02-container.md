# C4 — уровень 2: Container

```mermaid
C4Container
title Контейнеры системы Currency Bot

Person(user, "Пользователь", "Пишет боту сообщение с кодом валюты")
System_Ext(telegram, "Telegram", "Мессенджер: webhook на входе, Bot API на выходе")
System_Ext(frankfurter, "Frankfurter API", "REST API курсов ЕЦБ")

System_Boundary(bot, "Currency Bot") {
  Container(webhook, "Bot API (Fastify)", "JavaScript, Node.js, Fastify, Vercel Serverless Function", "Продакшн-контейнер: принимает Telegram-обновления через webhook, обрабатывает сценарий «курс валюты» и отправляет ответ. Полностью stateless, без БД")

  Container(poller, "Dev Poller", "JavaScript, Node.js, CLI-скрипт", "Контейнер только для локальной разработки: вместо webhook тянет обновления через long polling (getUpdates) и прогоняет их через тот же сценарий, что и webhook")
}

Rel(user, telegram, "пишет сообщение", "Telegram")
Rel(telegram, webhook, "POST /webhook/telegram", "HTTPS")
Rel(webhook, telegram, "sendMessage (ответ)", "HTTPS")
Rel(webhook, frankfurter, "GET /v1/latest?from=XXX&to=USD", "HTTPS")

Rel(telegram, poller, "getUpdates (long polling)", "HTTPS")
Rel(poller, frankfurter, "GET /v1/latest?from=XXX&to=USD", "HTTPS")
Rel(poller, telegram, "sendMessage (ответ)", "HTTPS")
```

## Словами

- **Bot API (Fastify)** — единственный продакшн-контейнер. Живёт как serverless-функция на Vercel: Vercel принимает HTTPS-запрос от Telegram и отдаёт его Fastify-приложению.
- **Dev Poller** — не попадает в продакшн. Нужен, чтобы разрабатывать локально без публичного URL и webhook. Важно: это не второй бот, а второй «вход» в одну и ту же логику (см. компоненты).
- Почему webhook, а не polling в проде: serverless-функция живёт не дольше одного запроса — держать бесконечный цикл `getUpdates` там нельзя. Webhook — единственный нормальный режим для Vercel.

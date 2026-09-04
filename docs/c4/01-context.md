# C4 — уровень 1: Context

> Диаграмму можно открыть в https://mermaid.live (вставить код ниже) или в редакторе с поддержкой Mermaid и экспортировать в PNG/SVG для сдачи.

```mermaid
C4Context
title Контекст системы Currency Bot

Person(user, "Пользователь", "Пишет боту сообщение, содержащее код валюты, например: «сколько стоит EUR?»")
System(bot, "Currency Bot", "Telegram-бот: находит код валюты во входящем тексте и отвечает её курсом относительно USD (источник курсов — Frankfurter API)")

System_Ext(telegram, "Telegram", "Мессенджер. Доставляет сообщения пользователя в наш бот (webhook / long polling) и отправляет ответы бота")
System_Ext(frankfurter, "Frankfurter API", "Публичное REST API с курсами валют Европейского центробанка, обновляется ежедневно")

Rel(user, telegram, "пишет сообщение «курс EUR»", "Telegram")
Rel(telegram, bot, "POST /webhook/telegram (обновление с текстом)", "HTTPS")
Rel(bot, frankfurter, "GET /v1/latest?from=EUR&to=USD", "HTTPS")
Rel(bot, telegram, "sendMessage: «1 EUR = 1.08 USD»", "HTTPS")
```

## Словами

- **Пользователь** — внешний человек, единственный источник запросов.
- **Currency Bot** — система, которую мы пишем. Она ничего не хранит, не имеет БД: получила сообщение → сходила за курсом → ответила.
- **Telegram** — внешняя платформа: и вход (сообщения пользователя), и выход (наши ответы).
- **Frankfurter API** — внешний источник данных о курсах (все валюты заданы относительно USD через параметры `from`/`to`).

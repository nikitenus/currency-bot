# C4 — уровень 3: Component (внутри контейнера Bot API)

Слои чистой архитектуры помечены в квадратных скобках у компонентов. Зависимости направлены **внутрь**: delivery → application → domain; инфраструктура реализует порты, а не наоборот.

```mermaid
C4Component
title Компоненты контейнера Bot API (Fastify)

Person(user, "Пользователь")
System_Ext(telegram, "Telegram", "Webhook + Bot API")
System_Ext(frankfurter, "Frankfurter API", "REST")

Container_Boundary(api, "Bot API (Fastify)") {

  Component(controller, "Webhook Controller", "[delivery] Fastify route POST /webhook/telegram", "Принимает обновление от Telegram, возвращает 200 как можно быстрее")

  Component(parser, "Update Parser", "[delivery] обычный JS-модуль", "Превращает «сырой» update Telegram во внутренний объект IncomingMessage { chatId, text }")

  Component(usecase, "GetRate Use Case", "[application] оркестратор", "Сценарий: если код валюты найден — запросить курс и сформировать ответ; если нет — ответить подсказкой")

  Component(detector, "Currency Code Detector", "[application] сервис", "Ищет в тексте трёхбуквенный код валюты и проверяет его по списку поддерживаемых")

  Component(formatter, "Rate Formatter", "[application] сервис", "Собирает человекопонятный текст ответа: «1 EUR = 1.08 USD (на 2026-09-03)»")

  Component(portRates, "RatesProvider (port)", "[application] контракт", "getRate(code): число — сколько code стоит в USD. Реализацию подставляет composition root")

  Component(portSender, "ReplySender (port)", "[application] контракт", "send(chatId, text). Реализацию подставляет composition root")

  Component(adapterRates, "Frankfurter Rates Adapter", "[infrastructure]", "Реализует порт RatesProvider: HTTP-запрос к api.frankfurter.dev")

  Component(adapterSender, "Telegram Sender", "[infrastructure]", "Реализует порт ReplySender: вызывает Bot API sendMessage")

  Component(root, "Composition Root (app.js)", "[main]", "Собирает приложение: создаёт Fastify, адаптеры и внедряет их в Use Case (ручной DI)")
}

Rel(telegram, controller, "POST /webhook/telegram", "HTTPS")
Rel(controller, parser, "update")
Rel(parser, usecase, "IncomingMessage { chatId, text }")
Rel(usecase, detector, "ищет код в тексте")
Rel(usecase, portRates, "getRate(code)")
Rel(portRates, adapterRates, "реализует", "DI")
Rel(adapterRates, frankfurter, "GET /v1/latest?from=XXX&to=USD", "HTTPS")
Rel(usecase, formatter, "format(rate)")
Rel(usecase, portSender, "send(chatId, replyText)")
Rel(portSender, adapterSender, "реализует", "DI")
Rel(adapterSender, telegram, "sendMessage", "HTTPS")
Rel(root, usecase, "создаёт и внедряет порты")
```

## Как читать (слои)

| Слой | Что лежит | Кто на кого смотрит |
|---|---|---|
| `domain` | правила: код валюты = 3 буквы, список поддерживаемых | ни на кого |
| `application` | Use Case, детектор, форматтер, **порты** (контракты) | только на domain |
| `infrastructure` | Frankfurter-адаптер, Telegram Sender | реализуют порты application |
| `delivery` | webhook-контроллер, poller | вызывают Use Case |
| `main` (composition root) | сборка, DI | знает про все слои — единственное место, где они встречаются |

Стрелки на диаграмме рисуют зависимости *использования*. Порт и адаптер показаны парой, чтобы было видно инверсию: application определяет интерфейс, infrastructure его реализует.

## Один Use Case — два входа

Webhook Controller и Dev Poller — оба «driving adapter». Поэтому на уровне компонентов poller показывает те же стрелки в Use Case; логика бота написана один раз и не знает, откуда пришло сообщение.

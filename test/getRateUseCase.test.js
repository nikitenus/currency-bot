import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createGetRateUseCase } from '../src/application/getRateUseCase.js';

const RATE_INFO = { code: 'EUR', quote: 'USD', rate: 1.0869, date: '2026-09-03' };

function fakeProvider(impl = async () => RATE_INFO) {
  return { getRate: impl };
}

test('находит код и возвращает текст курса', async () => {
  const useCase = createGetRateUseCase({ ratesProvider: fakeProvider() });
  const reply = await useCase.handle('курс EUR');

  assert.equal(reply, 'Курс EUR → USD на 2026-09-03: 1 EUR = 1.0869 USD');
});

test('вызывает провайдер с (code, USD)', async () => {
  const calls = [];
  const provider = fakeProvider(async (code, quote) => {
    calls.push({ code, quote });
    return RATE_INFO;
  });

  const useCase = createGetRateUseCase({ ratesProvider: provider });
  await useCase.handle('сколько стоит GBP');

  assert.deepEqual(calls, [{ code: 'GBP', quote: 'USD' }]);
});

test('нет кода валюты — возвращает подсказку и не трогает провайдер', async () => {
  let called = false;
  const provider = fakeProvider(async () => {
    called = true;
    return RATE_INFO;
  });

  const useCase = createGetRateUseCase({ ratesProvider: provider });
  const reply = await useCase.handle('привет!');

  assert.ok(reply.includes('трёхбуквенный код'));
  assert.equal(called, false);
});

test('код не из списка — явное сообщение, а не общая подсказка', async () => {
  let called = false;
  const provider = fakeProvider(async () => {
    called = true;
    return RATE_INFO;
  });

  const useCase = createGetRateUseCase({ ratesProvider: provider });
  const reply = await useCase.handle('курс RUB');

  assert.ok(reply.includes('RUB не поддерживается'));
  assert.equal(called, false);
});

test('USD — базовая валюта, провайдер не вызывается', async () => {
  let called = false;
  const provider = fakeProvider(async () => {
    called = true;
    return RATE_INFO;
  });

  const useCase = createGetRateUseCase({ ratesProvider: provider });
  const reply = await useCase.handle('курс USD');

  assert.ok(reply.includes('1 USD = 1.0000 USD'));
  assert.equal(called, false);
});

test('ошибка провайдера — вежливое сообщение об ошибке', async () => {
  const provider = fakeProvider(async () => {
    throw new Error('Frankfurter is down');
  });

  const useCase = createGetRateUseCase({ ratesProvider: provider });
  const reply = await useCase.handle('курс EUR');

  assert.ok(reply.includes('Не удалось получить курс EUR'));
});

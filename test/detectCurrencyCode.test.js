import { test } from 'node:test';
import assert from 'node:assert/strict';

import { detectCurrencyCode } from '../src/application/detectCurrencyCode.js';
import { SUPPORTED_CURRENCIES } from '../src/domain/currencyCode.js';

test('находит код валюты в начале, середине и конце текста', () => {
  assert.equal(detectCurrencyCode('курс EUR'), 'EUR');
  assert.equal(detectCurrencyCode('сколько стоит eur?'), 'EUR');
  assert.equal(detectCurrencyCode('мне нужен курс GBP сегодня'), 'GBP');
  assert.equal(detectCurrencyCode('курс  EUR  '), 'EUR');
});

test('возвращает null, если кода валюты нет', () => {
  assert.equal(detectCurrencyCode('привет'), null);
  assert.equal(detectCurrencyCode(''), null);
  assert.equal(detectCurrencyCode('курс abc'), null);
  assert.equal(detectCurrencyCode('usa'), null);
});

test('не считает случайное трёхбуквенное слово кодом', () => {
  assert.equal(detectCurrencyCode('это был dog и cat'), null);
});

test('детектор и домен знают одинаковые коды', () => {
  assert.ok(SUPPORTED_CURRENCIES.length > 20);
  for (const code of SUPPORTED_CURRENCIES) {
    assert.equal(detectCurrencyCode(code), code);
  }
});

import { createGetRateUseCase } from './application/getRateUseCase.js';
import { createRatesProvider } from './infrastructure/frankfurter/ratesProvider.js';
import { createTelegramSender } from './infrastructure/telegram/sender.js';
import { createSupabaseStore, createNullStore } from './infrastructure/supabase/store.js';

export function createBot({ botToken, supabaseUrl, supabaseKey }) {
  const ratesProvider = createRatesProvider();
  const replySender = createTelegramSender({ botToken });
  const conversations = supabaseUrl && supabaseKey
    ? createSupabaseStore({ url: supabaseUrl, key: supabaseKey })
    : createNullStore();
  const getRateUseCase = createGetRateUseCase({ ratesProvider });

  return { getRateUseCase, replySender, conversations };
}

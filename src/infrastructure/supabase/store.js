import { createClient } from '@supabase/supabase-js';

const MESSENGER_TYPE = 'telegram';

export function createSupabaseStore({ url, key }) {
  const supabase = createClient(url, key);

  async function upsertClient({ chatId, firstName, lastName }) {
    const { data, error } = await supabase
      .from('clients')
      .upsert(
        {
          user_telegram_id: String(chatId),
          first_name: firstName ?? null,
          last_name: lastName ?? null,
          last_message_at: new Date().toISOString(),
        },
        { onConflict: 'user_telegram_id' },
      )
      .select('id')
      .single();

    if (error) throw new Error(`Supabase clients upsert error: ${error.message}`);
    return data.id;
  }

  async function insertMessage({ clientId, chatId, author, body }) {
    const { error } = await supabase.from('messages').insert({
      client_id: clientId,
      author,
      body,
      messenger_user_id: String(chatId),
      messenger_type: MESSENGER_TYPE,
    });

    if (error) throw new Error(`Supabase messages insert error: ${error.message}`);
  }

  async function record({ chatId, firstName, lastName, text, reply }) {
    const clientId = await upsertClient({ chatId, firstName, lastName });
    await insertMessage({ clientId, chatId, author: 'client', body: text });
    if (reply != null) {
      await insertMessage({ clientId, chatId, author: 'bot', body: reply });
    }
  }

  return { record };
}

export function createNullStore() {
  async function record() {}
  return { record };
}

// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      Deno.env.get('SUPABASE_SECRET_KEY');

    if (!url || !key) {
      return json({ error: 'missing env', url: !!url, key: !!key }, 500);
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      return json({ error: error.message }, 500);
    }

    return json(data);
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 500);
  }
});

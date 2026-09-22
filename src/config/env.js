function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Отсутствует переменная окружения: ${name}`);
  }
  return value;
}

export function loadConfig() {
  return {
    botToken: requireEnv('BOT_TOKEN'),
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

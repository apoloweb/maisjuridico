// Cliente Supabase para uso NO SERVIDOR (Server Components / Server Actions).
// Usa a SERVICE ROLE key — NUNCA importar isto em código de cliente.
// Inicialização LAZY: só cria o cliente (e exige as env vars) no primeiro uso,
// para que o `next build` não falhe quando as variáveis ainda não estão setadas.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (veja .env.example).',
    );
  }
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

// Proxy: adia a criação do cliente até o primeiro acesso de propriedade (runtime).
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});

// Cliente Supabase para uso NO SERVIDOR (Server Components / Server Actions).
// Usa a SERVICE ROLE key — NUNCA importar isto em código de cliente.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // Mensagem clara em dev caso falte configurar o .env.local
  throw new Error(
    'Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (veja .env.example).',
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

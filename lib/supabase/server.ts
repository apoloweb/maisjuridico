// Cliente Supabase com SESSÃO (cookies) para auth — usa a anon/publishable key.
// Server Components / Server Actions. Respeita RLS (ao contrário do supabaseAdmin).
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // chamado de um Server Component — ignorado (o middleware renova a sessão)
          }
        },
      },
    },
  );
}

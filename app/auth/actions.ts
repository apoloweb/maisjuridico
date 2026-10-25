'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?erro=' + encodeURIComponent(error.message));
  redirect('/dashboard');
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect('/signup?erro=' + encodeURIComponent(error.message));
  redirect('/login?novo=1');
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

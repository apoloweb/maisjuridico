import Link from 'next/link';
import { signupAction } from '@/app/auth/actions';
import { Button, Field, Input } from '@/components/ui';

export default function SignupPage({ searchParams }: { searchParams: { erro?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-bg p-6 shadow-card">
        <div className="mb-6">
          <div className="text-lg font-bold text-accent">MaisJurídico</div>
          <h1 className="mt-2 text-xl font-bold text-text">Criar conta</h1>
          <p className="text-sm text-muted">Crie o acesso do seu escritório.</p>
        </div>
        {searchParams.erro && <p className="mb-4 rounded-sm bg-danger/10 px-3 py-2 text-sm text-danger">{searchParams.erro}</p>}
        <form action={signupAction} className="grid gap-4">
          <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required autoComplete="email" /></Field>
          <Field label="Senha" htmlFor="password" hint="Mínimo 6 caracteres."><Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" /></Field>
          <Button type="submit" variant="cta" size="lg">Criar conta</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Já tem conta? <Link href="/login" className="text-accent hover:underline">Entrar</Link>
        </p>
        <p className="mt-3 text-center text-xs text-muted">
          Se a confirmação de e-mail estiver ativa no Supabase, confirme pelo link enviado antes de entrar.
        </p>
      </div>
    </div>
  );
}

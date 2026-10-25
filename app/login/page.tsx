import Link from 'next/link';
import { loginAction } from '@/app/auth/actions';
import { Button, Field, Input } from '@/components/ui';

export default function LoginPage({ searchParams }: { searchParams: { erro?: string; novo?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-bg p-6 shadow-card">
        <div className="mb-6">
          <div className="text-lg font-bold text-accent">MaisJurídico</div>
          <h1 className="mt-2 text-xl font-bold text-text">Faça seu login</h1>
          <p className="text-sm text-muted">Acesse o painel do seu escritório.</p>
        </div>
        {searchParams.novo && <p className="mb-4 rounded-sm bg-success/10 px-3 py-2 text-sm text-success">Conta criada. Faça login.</p>}
        {searchParams.erro && <p className="mb-4 rounded-sm bg-danger/10 px-3 py-2 text-sm text-danger">{searchParams.erro}</p>}
        <form action={loginAction} className="grid gap-4">
          <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required autoComplete="email" /></Field>
          <Field label="Senha" htmlFor="password"><Input id="password" name="password" type="password" required autoComplete="current-password" /></Field>
          <Button type="submit" variant="primary" size="lg">Entrar</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Não tem conta? <Link href="/signup" className="text-accent hover:underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}

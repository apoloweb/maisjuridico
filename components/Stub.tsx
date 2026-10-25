import { PageHeader, Card } from '@/components/ui';

// Placeholder de tela ainda não construída (mantém a navegação completa do recon).
export function Stub({ title, nota }: { title: string; nota?: string }) {
  return (
    <>
      <PageHeader title={title} subtitle="Módulo mapeado no recon — tela a construir." />
      <Card className="p-8">
        <p className="text-sm text-muted">
          {nota ?? 'Esta tela faz parte do blueprint e será implementada nos próximos marcos do build.'}
        </p>
      </Card>
    </>
  );
}

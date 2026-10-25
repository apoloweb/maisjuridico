import { PageHeader, Card, Button } from '@/components/ui';
import { Lock } from 'lucide-react';

// Estado "recurso bloqueado por plano" (gating observado no original: redireciona para planos).
export default function Page() {
  return (
    <>
      <PageHeader title="Diário Oficial" subtitle="Publicações por nome/OAB" />
      <Card className="p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Lock size={28} className="text-warning" />
          <h2 className="text-lg font-semibold text-text">Recurso disponível em planos pagos</h2>
          <p className="max-w-md text-sm text-muted">
            O monitoramento de publicações dos diários oficiais (por nome e OAB) está disponível a partir do plano Individual.
            Faça upgrade para ativar.
          </p>
          <Button variant="cta">Conhecer os planos</Button>
        </div>
      </Card>
    </>
  );
}

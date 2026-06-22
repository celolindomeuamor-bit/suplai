import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileBarChart } from "lucide-react";
import { useStockGuard } from "@/lib/stockguard-store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/relatorios/")({
  component: ReportsPage,
});

type Kind = "DIARIO" | "SEMANAL" | "MENSAL";

function ReportsPage() {
  const { reports } = useStockGuard();
  const [kind, setKind] = useState<Kind>("SEMANAL");
  const filtered = reports.filter((r) => r.kind === kind);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Relatórios automáticos gerados pela IA via n8n.
        </p>
      </header>

      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)}>
        <TabsList className="bg-surface border border-border">
          <TabsTrigger value="DIARIO">Diário</TabsTrigger>
          <TabsTrigger value="SEMANAL">Semanal</TabsTrigger>
          <TabsTrigger value="MENSAL">Mensal</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-10 text-center text-muted-foreground text-sm">
          Nenhum relatório recebido ainda. Os relatórios serão enviados automaticamente pelo sistema.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-md border border-border bg-surface p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="h-12 w-12 grid place-items-center rounded-md bg-primary/10 text-primary shrink-0">
                <FileBarChart className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{r.title}</h3>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  Gerado por IA · {r.generatedAt}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {r.itemsAnalyzed} itens analisados · {r.alertsCount} alertas · {r.correctionsCount} correções
                </div>
              </div>
              <Link
                to="/relatorios/$reportId"
                params={{ reportId: r.id }}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 text-center"
              >
                Ver Relatório Completo
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

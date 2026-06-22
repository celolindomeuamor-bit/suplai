import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileBarChart } from "lucide-react";
import { useStockGuard } from "@/lib/stockguard-store";

export const Route = createFileRoute("/relatorios/$reportId")({
  component: ReportDetail,
});

function ReportDetail() {
  const { reportId } = useParams({ from: "/relatorios/$reportId" });
  const { reports } = useStockGuard();
  const report = reports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Relatório não encontrado.</p>
        <Link to="/relatorios" className="text-primary text-sm">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/relatorios" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para relatórios
        </Link>
      </div>

      <header className="flex items-start gap-4">
        <div className="h-12 w-12 grid place-items-center rounded-md bg-primary/10 text-primary shrink-0">
          <FileBarChart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <p className="text-sm text-muted-foreground font-mono">
            Período: {report.period} · Gerado em {report.generatedAt}
          </p>
        </div>
      </header>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-xs uppercase font-mono text-muted-foreground tracking-wider mb-2">
          Resumo Executivo
        </h2>
        <p className="text-sm leading-relaxed">{report.summary}</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Total de alertas" value={report.alertsCount} />
        <Metric label="Itens verificados" value={report.itemsAnalyzed} />
        <Metric label="Correções enviadas" value={report.correctionsCount} />
        <Metric label="Vencendo em 30 dias" value={report.expiringIn30} color="var(--priority-high)" />
      </div>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold mb-3">Itens com maior problema na semana</h2>
        <ul className="space-y-2 text-sm">
          {report.topProblems.map((p, i) => (
            <li key={i} className="flex items-start gap-3 border-b border-border last:border-0 pb-2 last:pb-0">
              <span className="font-mono text-xs text-primary mt-0.5">#{i + 1}</span>
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.reason}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-md border border-border bg-surface p-5 overflow-x-auto">
        <h2 className="text-sm font-semibold mb-3">Correções de estoque registradas</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase font-mono text-muted-foreground border-b border-border">
              <th className="py-2 pr-3">Produto</th>
              <th className="py-2 px-3">Qtd. anterior</th>
              <th className="py-2 px-3">Qtd. corrigida</th>
              <th className="py-2 pl-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {report.corrections.map((c, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-2 pr-3">{c.name}</td>
                <td className="py-2 px-3 font-mono">{c.previous}</td>
                <td className="py-2 px-3 font-mono text-primary">{c.corrected}</td>
                <td className="py-2 pl-3 font-mono text-muted-foreground">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold mb-2">Previsões e Recomendações da IA</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{report.predictions}</p>
      </section>

      {report.recurringErrors.length > 0 && (
        <section className="rounded-md border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold mb-3">Erros recorrentes</h2>
          <div className="flex flex-wrap gap-2">
            {report.recurringErrors.map((e) => (
              <span key={e} className="px-3 py-1 rounded-full text-xs border border-priority-critical text-priority-critical bg-priority-critical/10">
                {e}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-mono">{label}</div>
      <div className="text-2xl font-bold font-mono mt-1" style={{ color: color ?? "var(--color-foreground)" }}>
        {value}
      </div>
    </div>
  );
}

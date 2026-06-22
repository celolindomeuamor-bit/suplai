import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStockGuard } from "@/lib/stockguard-store";
import { PRIORITY_META, PRIORITY_ORDER, type Priority } from "@/lib/stockguard-types";
import { AlertCard } from "@/components/alert-card";
import { VerificationModal } from "@/components/verification-modal";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alertas — StockGuard" },
      { name: "description", content: "Alertas inteligentes de estoque ordenados por prioridade." },
    ],
  }),
  component: AlertsPage,
});

function AlertsPage() {
  const { alerts, products, getProduct } = useStockGuard();
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [secao, setSecao] = useState<string>("ALL");
  const [grupo, setGrupo] = useState<string>("ALL");
  const [limit, setLimit] = useState(10);
  const [verifyId, setVerifyId] = useState<string | null>(null);

  const secoes = useMemo(() => Array.from(new Set(products.map((p) => p.SECAO))).sort(), [products]);
  const grupos = useMemo(() => Array.from(new Set(products.map((p) => p.GRUPO))).sort(), [products]);

  const filtered = useMemo(() => {
    return alerts
      .filter((a) => priority === "ALL" || a.priority === priority)
      .filter((a) => {
        const p = getProduct(a.productId);
        if (!p) return false;
        if (secao !== "ALL" && p.SECAO !== secao) return false;
        if (grupo !== "ALL" && p.GRUPO !== grupo) return false;
        return true;
      })
      .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
  }, [alerts, priority, secao, grupo, getProduct]);

  const visible = filtered.slice(0, limit);
  const verifyAlert = verifyId ? alerts.find((a) => a.id === verifyId) ?? null : null;
  const verifyProduct = verifyAlert ? getProduct(verifyAlert.productId) ?? null : null;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} alerta{filtered.length === 1 ? "" : "s"} ordenado{filtered.length === 1 ? "" : "s"} por prioridade.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityChip label="Todos" active={priority === "ALL"} onClick={() => setPriority("ALL")} />
        {PRIORITY_ORDER.map((p) => (
          <PriorityChip
            key={p}
            label={`${PRIORITY_META[p].dot} ${PRIORITY_META[p].label}`}
            color={PRIORITY_META[p].color}
            active={priority === p}
            onClick={() => setPriority(p)}
          />
        ))}
        <div className="ml-auto flex gap-2">
          <Select value={secao} onValueChange={setSecao}>
            <SelectTrigger className="w-[180px] bg-surface border-border">
              <SelectValue placeholder="Seção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas as seções</SelectItem>
              {secoes.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={grupo} onValueChange={setGrupo}>
            <SelectTrigger className="w-[200px] bg-surface border-border">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os grupos</SelectItem>
              {grupos.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-12 text-center">
          <ShieldCheck className="h-12 w-12 mx-auto text-priority-low" />
          <p className="mt-3 text-base font-medium">Nenhum alerta no momento.</p>
          <p className="text-sm text-muted-foreground">Estoque sob controle.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const p = getProduct(a.productId);
            if (!p) return null;
            return <AlertCard key={a.id} alert={a} product={p} onVerify={() => setVerifyId(a.id)} />;
          })}
        </div>
      )}

      {filtered.length > limit && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit((n) => n + 10)}>
            Carregar mais alertas
          </Button>
        </div>
      )}

      <VerificationModal
        open={!!verifyId}
        onOpenChange={(v) => { if (!v) setVerifyId(null); }}
        product={verifyProduct}
        alert={verifyAlert}
      />
    </div>
  );
}

function PriorityChip({ label, color, active, onClick }: {
  label: string; color?: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
      style={
        active
          ? { background: color ? `${color}22` : "var(--color-primary)", borderColor: color ?? "var(--color-primary)", color: color ?? "var(--color-primary-foreground)" }
          : { background: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }
      }
    >
      {label}
    </button>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useStockGuard } from "@/lib/stockguard-store";
import { PRIORITY_META } from "@/lib/stockguard-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VerificationModal } from "@/components/verification-modal";
import { SwipeableAlertRow } from "@/components/swipeable-alert-row";

export const Route = createFileRoute("/campo")({
  head: () => ({
    meta: [
      { title: "Verificação de Campo — StockGuard" },
      { name: "description", content: "Itens pendentes de verificação no estoque físico." },
    ],
  }),
  component: FieldPage,
});

type Filter = "PENDENTES" | "VERIFICADOS" | "CORRIGIDOS" | "ADIADOS";

function FieldPage() {
  const { alerts, getProduct, verifications, registerVerification } = useStockGuard();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("PENDENTES");
  const [verifyId, setVerifyId] = useState<string | null>(null);
  const [postponedIds, setPostponedIds] = useState<Set<string>>(new Set());

  const verifiedIds = new Set(verifications.map((v) => v.productId));
  const correctedIds = new Set(verifications.filter((v) => !v.correct).map((v) => v.productId));

  const list = useMemo(() => {
    return alerts
      .filter((a) => {
        if (filter === "PENDENTES") return !verifiedIds.has(a.productId) && !postponedIds.has(a.id);
        if (filter === "VERIFICADOS") return verifiedIds.has(a.productId);
        if (filter === "ADIADOS") return postponedIds.has(a.id);
        return correctedIds.has(a.productId);
      })
      .filter((a) => {
        if (!q) return true;
        const p = getProduct(a.productId);
        return p?.NOME.toLowerCase().includes(q.toLowerCase());
      });
  }, [alerts, filter, q, verifiedIds, correctedIds, postponedIds, getProduct]);

  const total = alerts.length;
  const verified = verifiedIds.size;
  const pct = total ? Math.round((verified / total) * 100) : 0;

  const verifyAlert = verifyId ? alerts.find((a) => a.id === verifyId) ?? null : null;
  const verifyProduct = verifyAlert ? getProduct(verifyAlert.productId) ?? null : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Verificação de Campo</h1>
        <p className="text-sm text-muted-foreground">Itens pendentes de verificação hoje.</p>
      </header>

      <div className="rounded-md border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-mono">{verified} de {total} itens verificados hoje</span>
          <span className="font-mono text-primary">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2 bg-background" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto..."
            className="pl-9 bg-surface border-border"
          />
        </div>
        <div className="flex gap-2">
          {(["PENDENTES", "VERIFICADOS", "CORRIGIDOS"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-primary text-primary-foreground" : ""}
            >
              {f === "PENDENTES" ? "Pendentes" : f === "VERIFICADOS" ? "Verificados hoje" : "Com correção enviada"}
            </Button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-10 text-center text-muted-foreground text-sm">
          Nenhum item nesta categoria.
        </div>
      ) : (
        <div className="grid gap-2">
          {list.map((a) => {
            const p = getProduct(a.productId);
            if (!p) return null;
            const meta = PRIORITY_META[a.priority];
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-md border border-border bg-surface p-3 hover:border-muted-foreground/30"
                style={{ borderLeft: `3px solid ${meta.color}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.NOME}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {p.SECAO} · Estoque: {p.QTDE}
                  </div>
                </div>
                <div className="hidden sm:block text-xs font-mono" style={{ color: meta.color }}>
                  {a.title}
                </div>
                <Button size="sm" onClick={() => setVerifyId(a.id)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Verificar
                </Button>
              </div>
            );
          })}
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

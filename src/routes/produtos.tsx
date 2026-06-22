import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { useStockGuard } from "@/lib/stockguard-store";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VerificationModal } from "@/components/verification-modal";
import type { Product } from "@/lib/stockguard-types";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — StockGuard" },
      { name: "description", content: "Todos os produtos do estoque." },
    ],
  }),
  component: ProductsPage,
});

type Status = "NORMAL" | "ATENCAO" | "CRITICO" | "VENCENDO";

function statusFor(p: Product, hasAlert: boolean, alertPriority?: string): Status {
  const vencDate = parseBR(p.VALIDADE);
  if (vencDate) {
    const diff = (vencDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff <= 30) return "VENCENDO";
  }
  if (alertPriority === "CRITICO") return "CRITICO";
  if (hasAlert) return "ATENCAO";
  return "NORMAL";
}

function parseBR(d: string): Date | null {
  const [dd, mm, yy] = d.split("/").map(Number);
  if (!dd || !mm || !yy) return null;
  return new Date(yy, mm - 1, dd);
}

const STATUS_META: Record<Status, { label: string; color: string }> = {
  NORMAL: { label: "Normal", color: "var(--priority-low)" },
  ATENCAO: { label: "Atenção", color: "var(--priority-medium)" },
  CRITICO: { label: "Crítico", color: "var(--priority-critical)" },
  VENCENDO: { label: "Vencendo", color: "var(--priority-high)" },
};

type SortKey = keyof Pick<Product, "NOME" | "SECAO" | "GRUPO" | "QTDE" | "PRECO" | "DT_ULTINVENT" | "DT_ULTENTRADA" | "DT_ULTSAIDA" | "VALIDADE">;

function ProductsPage() {
  const { products, alerts, getAlertForProduct } = useStockGuard();
  const [q, setQ] = useState("");
  const [secao, setSecao] = useState("ALL");
  const [grupo, setGrupo] = useState("ALL");
  const [status, setStatus] = useState<"ALL" | Status>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("NOME");
  const [sortAsc, setSortAsc] = useState(true);
  const [verifyId, setVerifyId] = useState<string | null>(null);

  const secoes = Array.from(new Set(products.map((p) => p.SECAO))).sort();
  const grupos = Array.from(new Set(products.map((p) => p.GRUPO))).sort();

  const rows = useMemo(() => {
    const list = products
      .map((p) => {
        const a = getAlertForProduct(p.id);
        const st = statusFor(p, !!a, a?.priority);
        return { p, a, st };
      })
      .filter(({ p, st }) => {
        if (q && !p.NOME.toLowerCase().includes(q.toLowerCase())) return false;
        if (secao !== "ALL" && p.SECAO !== secao) return false;
        if (grupo !== "ALL" && p.GRUPO !== grupo) return false;
        if (status !== "ALL" && st !== status) return false;
        return true;
      });

    list.sort((x, y) => {
      const a = x.p[sortKey]; const b = y.p[sortKey];
      let cmp = 0;
      if (typeof a === "number" && typeof b === "number") cmp = a - b;
      else cmp = String(a).localeCompare(String(b), "pt-BR");
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [products, q, secao, grupo, status, sortKey, sortAsc, getAlertForProduct, alerts]);

  const verifyProduct = verifyId ? products.find((p) => p.id === verifyId) ?? null : null;
  const verifyAlert = verifyId ? getAlertForProduct(verifyId) ?? null : null;

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc((v) => !v);
    else { setSortKey(k); setSortAsc(true); }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        <p className="text-sm text-muted-foreground">{products.length} produtos cadastrados no estoque.</p>
      </header>

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
        <Select value={secao} onValueChange={setSecao}>
          <SelectTrigger className="w-[180px] bg-surface border-border"><SelectValue placeholder="Seção" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as seções</SelectItem>
            {secoes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={grupo} onValueChange={setGrupo}>
          <SelectTrigger className="w-[200px] bg-surface border-border"><SelectValue placeholder="Grupo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os grupos</SelectItem>
            {grupos.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as "ALL" | Status)}>
          <SelectTrigger className="w-[160px] bg-surface border-border"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos status</SelectItem>
            {(Object.keys(STATUS_META) as Status[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase font-mono text-muted-foreground border-b border-border">
              {(
                [
                  ["NOME", "Nome"],
                  ["SECAO", "Seção"],
                  ["GRUPO", "Grupo"],
                  ["QTDE", "Estoque"],
                  ["PRECO", "Preço"],
                  ["DT_ULTINVENT", "Últ. Invent."],
                  ["DT_ULTENTRADA", "Últ. Entrada"],
                  ["DT_ULTSAIDA", "Últ. Saída"],
                  ["VALIDADE", "Vencimento"],
                ] as [SortKey, string][]
              ).map(([k, l]) => (
                <th key={k} className="py-3 px-3 whitespace-nowrap">
                  <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
                    {l} <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, st }) => {
              const meta = STATUS_META[st];
              return (
                <tr
                  key={p.id}
                  onClick={() => setVerifyId(p.id)}
                  className="border-b border-border last:border-0 hover:bg-background cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-medium">{p.NOME}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{p.SECAO}</td>
                  <td className="py-2.5 px-3 text-muted-foreground">{p.GRUPO}</td>
                  <td className="py-2.5 px-3 font-mono">{p.QTDE}</td>
                  <td className="py-2.5 px-3 font-mono">R$ {p.PRECO.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{p.DT_ULTINVENT}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{p.DT_ULTENTRADA}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{p.DT_ULTSAIDA}</td>
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{p.VALIDADE}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className="text-[10px] font-mono uppercase px-2 py-1 rounded-sm whitespace-nowrap"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div>
        )}
      </div>

      <VerificationModal
        open={!!verifyId}
        onOpenChange={(v) => { if (!v) setVerifyId(null); }}
        product={verifyProduct}
        alert={verifyAlert}
      />
    </div>
  );
}

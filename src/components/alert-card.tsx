import { AlertTriangle, ArrowRight, Boxes, CalendarClock, Eye, PackageX, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { PRIORITY_META } from "@/lib/stockguard-types";
import type { Alert, Product, AlertType } from "@/lib/stockguard-types";
import { Button } from "@/components/ui/button";

const ICON_FOR_TYPE: Record<AlertType, typeof AlertTriangle> = {
  RUPTURA: PackageX,
  ERRO_ENTRADA_SAIDA: ShieldAlert,
  PROXIMO_VENCIMENTO: CalendarClock,
  PRODUTO_PARADO: TrendingDown,
  DIVERGENCIA_INVENTARIO: AlertTriangle,
  ENTRADA_SEM_SAIDA: Boxes,
  ESTOQUE_ELEVADO: TrendingUp,
  SEM_MOVIMENTACAO: Eye,
};

export function AlertCard({
  alert,
  product,
  onVerify,
}: {
  alert: Alert;
  product: Product;
  onVerify: () => void;
}) {
  const meta = PRIORITY_META[alert.priority];
  const Icon = ICON_FOR_TYPE[alert.type];

  return (
    <div
      className="relative rounded-md bg-surface border border-border overflow-hidden hover:border-muted-foreground/30 transition-colors"
      style={{ borderLeft: `4px solid ${meta.color}` }}
    >
      <div className="p-4 md:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 grid place-items-center rounded-md shrink-0"
            style={{ background: `${meta.color}1A`, color: meta.color }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">{alert.title}</h3>
              <span
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm"
                style={{ background: `${meta.color}22`, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <div className="text-sm text-foreground mt-0.5 truncate">{product.NOME}</div>
            <div className="text-xs text-muted-foreground font-mono">
              Seção: {product.SECAO} · {product.GRUPO}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono border-t border-border pt-3">
          <Field label="Estoque" value={String(product.QTDE)} />
          <Field label="Últ. Invent." value={`${product.QT_ULTINVENT} · ${product.DT_ULTINVENT}`} />
          <Field label="Últ. Entrada" value={`${product.QT_ULTENTRADA} · ${product.DT_ULTENTRADA}`} />
          <Field label="Vencimento" value={product.VALIDADE} />
        </div>

        <div className="flex items-start gap-2 text-sm border-t border-border pt-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: meta.color }} />
          <p className="text-muted-foreground flex-1">{alert.reason}</p>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            onClick={onVerify}
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            Verificar Produto
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-foreground truncate">{value}</div>
    </div>
  );
}

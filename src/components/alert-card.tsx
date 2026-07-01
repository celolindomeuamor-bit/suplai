import { AlertTriangle, ArrowRight, Boxes, CalendarClock, Eye, PackageX, ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";
import { PRIORITY_META } from "@/lib/stockguard-types";
import type { Alert, Product, AlertType } from "@/lib/stockguard-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


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
  index = 0,
}: {
  alert: Alert;
  product: Product;
  onVerify: () => void;
  index?: number;
}) {
  const meta = PRIORITY_META[alert.priority];
  const Icon = ICON_FOR_TYPE[alert.type];
  const isCritical = alert.priority === "CRITICO";

  return (
    <div
      className={cn(
        "sg-fade-up sg-scanline group relative rounded-md bg-surface border border-border overflow-hidden transition-colors hover:border-muted-foreground/30"
      )}
      style={{
        borderLeft: `4px solid ${meta.color}`,
        animationDelay: `${Math.min(index, 8) * 60}ms`,
        boxShadow: isCritical
          ? `inset 1px 0 0 0 ${meta.color}, 0 0 0 1px color-mix(in oklab, ${meta.color} 12%, transparent)`
          : `inset 1px 0 0 0 ${meta.color}`,
      }}
    >
      {/* subtle top hairline scan */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-40 sg-hairline" />

      <div className="p-4 md:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "h-10 w-10 grid place-items-center rounded-md shrink-0 border transition-transform group-hover:scale-[1.04]",
              isCritical && "sg-pulse-critical"
            )}
            style={{ background: `${meta.color}1A`, color: meta.color, borderColor: `${meta.color}40` }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base tracking-tight">{alert.title}</h3>
              <span
                className={cn(
                  "text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm border",
                  isCritical && "sg-badge-glow"
                )}
                style={{ background: `${meta.color}1F`, color: meta.color, borderColor: `${meta.color}55` }}
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

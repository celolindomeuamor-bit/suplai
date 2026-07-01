import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useStockGuard } from "@/lib/stockguard-store";
import { PRIORITY_META } from "@/lib/stockguard-types";
import type { Product, Alert } from "@/lib/stockguard-types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  alert?: Alert | null;
}

export function VerificationModal({ open, onOpenChange, product, alert }: Props) {
  const { registerVerification, updateProductQty } = useStockGuard();
  const [correct, setCorrect] = useState(true);
  const [correctedQty, setCorrectedQty] = useState<string>("");
  const [obs, setObs] = useState("");

  if (!product) return null;
  const meta = alert ? PRIORITY_META[alert.priority] : null;

  const reset = () => {
    setCorrect(true);
    setCorrectedQty("");
    setObs("");
  };

  const handleConfirm = () => {
    const correctedNum = correctedQty ? Number(correctedQty) : undefined;
    if (!correct && correctedNum != null && !Number.isNaN(correctedNum)) {
      updateProductQty(product.id, correctedNum);
    }
    registerVerification({
      productId: product.id,
      alertId: alert?.id ?? "—",
      correct,
      correctedQty: correctedNum,
      observation: obs || undefined,
    });
    toast.success("Verificação registrada com sucesso.", {
      description: "Dados enviados ao relatório semanal.",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl bg-surface border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Verificação de Campo — <span className="text-primary">{product.NOME}</span>
          </DialogTitle>
          <div className="text-xs text-muted-foreground font-mono mt-1">
            {product.SECAO} · {product.GRUPO}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
          <DataRow label="Estoque Atual" value={product.QTDE} />
          <DataRow label="Preço" value={`R$ ${product.PRECO.toFixed(2)}`} />
          <DataRow label="Últ. Inventário" value={`${product.QT_ULTINVENT} (${product.DT_ULTINVENT})`} />
          <DataRow label="Últ. Entrada" value={`${product.QT_ULTENTRADA} un (${product.DT_ULTENTRADA})`} />
          <DataRow label="Últ. Saída" value={product.DT_ULTSAIDA} />
          <DataRow label="Vencimento" value={product.VALIDADE} />
        </div>

        {alert && meta && (
          <div
            className="rounded-md border p-3 flex gap-3"
            style={{ borderColor: meta.color, background: `${meta.color}14` }}
          >
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" style={{ color: meta.color }} />
            <div className="text-sm">
              <div className="font-semibold" style={{ color: meta.color }}>
                {alert.title} · {meta.label}
              </div>
              <div className="text-muted-foreground mt-0.5">{alert.reason}</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Observações do gerente (opcional)
          </Label>
          <Textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex.: Produto encontrado no estoque secundário, etiqueta danificada..."
            className="bg-background border-border resize-none"
            rows={3}
          />
        </div>

        <button
          type="button"
          onClick={() => setCorrect((c) => !c)}
          className="w-full flex items-center justify-between rounded-md border border-border bg-background p-4 text-left transition-colors hover:border-muted-foreground/40 min-h-14"
        >
          <div className="flex-1 pr-4">
            <div className="text-base font-medium">As informações no sistema estão corretas?</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {correct ? "Sim — dados batem com o estoque físico" : "Não — preciso corrigir"}
            </div>
          </div>
          <Switch
            checked={correct}
            onCheckedChange={setCorrect}
            className="h-8 w-14 [&>span]:h-7 [&>span]:w-7 [&>span[data-state=checked]]:translate-x-6"
          />
        </button>

        {!correct && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Informe a quantidade correta no estoque
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={correctedQty}
                onChange={(e) => setCorrectedQty(e.target.value)}
                className="bg-background border-border font-mono text-lg h-12"
                placeholder="Ex.: 13"
              />
              <Button
                variant="outline"
                onClick={() => toast.success("Correção registrada — aguardando confirmação final.")}
                disabled={!correctedQty}
                className="h-12 px-4"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-12">
            Fechar
          </Button>
          <Button onClick={handleConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Confirmado — Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

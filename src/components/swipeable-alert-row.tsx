import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, Clock, ChevronRight } from "lucide-react";
import { PRIORITY_META } from "@/lib/stockguard-types";
import type { Alert, Product } from "@/lib/stockguard-types";
import { Button } from "@/components/ui/button";

const THRESHOLD = 96;
const MAX = 160;

export function SwipeableAlertRow({
  alert,
  product,
  onVerify,
  onPostpone,
  onOpenModal,
}: {
  alert: Alert;
  product: Product;
  onVerify: () => void;
  onPostpone: () => void;
  onOpenModal: () => void;
}) {
  const meta = PRIORITY_META[alert.priority];
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef<"x" | "y" | null>(null);
  const pointerId = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = null;
    pointerId.current = e.pointerId;
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging || pointerId.current !== e.pointerId) return;
    const rawX = e.clientX - startX.current;
    const rawY = e.clientY - startY.current;
    if (locked.current === null) {
      if (Math.abs(rawX) < 8 && Math.abs(rawY) < 8) return;
      locked.current = Math.abs(rawX) > Math.abs(rawY) ? "x" : "y";
    }
    if (locked.current !== "x") return;
    const clamped = Math.max(-MAX, Math.min(MAX, rawX));
    setDx(clamped);
  };

  const finish = () => {
    if (!dragging) return;
    setDragging(false);
    pointerId.current = null;
    if (dx >= THRESHOLD) {
      setDx(MAX);
      window.setTimeout(() => {
        onVerify();
        setDx(0);
      }, 160);
    } else if (dx <= -THRESHOLD) {
      setDx(-MAX);
      window.setTimeout(() => {
        onPostpone();
        setDx(0);
      }, 160);
    } else {
      setDx(0);
    }
    locked.current = null;
  };

  const progress = Math.min(1, Math.abs(dx) / THRESHOLD);
  const showRight = dx > 4; // swiped right → verify (green)
  const showLeft = dx < -4; // swiped left → postpone (blue)

  return (
    <div className="relative overflow-hidden rounded-md">
      {/* Background action layers */}
      <div
        className="absolute inset-0 flex items-center justify-start px-5 gap-2 rounded-md transition-opacity"
        style={{
          background: `color-mix(in oklab, var(--priority-low) ${Math.round(progress * 22)}%, transparent)`,
          opacity: showRight ? 1 : 0,
        }}
      >
        <div
          className="h-10 w-10 grid place-items-center rounded-full transition-transform"
          style={{
            background: "var(--priority-low)",
            color: "#0F1923",
            transform: `scale(${0.7 + progress * 0.5})`,
          }}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--priority-low)" }}>
          Marcar como verificado
        </span>
      </div>
      <div
        className="absolute inset-0 flex items-center justify-end px-5 gap-2 rounded-md transition-opacity"
        style={{
          background: `color-mix(in oklab, var(--priority-monitor) ${Math.round(progress * 22)}%, transparent)`,
          opacity: showLeft ? 1 : 0,
        }}
      >
        <span className="text-sm font-semibold" style={{ color: "var(--priority-monitor)" }}>
          Adiar para amanhã
        </span>
        <div
          className="h-10 w-10 grid place-items-center rounded-full transition-transform"
          style={{
            background: "var(--priority-monitor)",
            color: "#0F1923",
            transform: `scale(${0.7 + progress * 0.5})`,
          }}
        >
          <Clock className="h-5 w-5" strokeWidth={3} />
        </div>
      </div>

      {/* Foreground card */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="relative flex items-center gap-3 rounded-md border border-border bg-surface p-3 touch-pan-y select-none"
        style={{
          borderLeft: `3px solid ${meta.color}`,
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 180ms ease-out",
        }}
      >
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{product.NOME}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {product.SECAO} · Estoque: {product.QTDE}
          </div>
          <div className="sm:hidden text-[11px] font-mono mt-0.5 flex items-center gap-1 text-muted-foreground">
            <ChevronRight className="h-3 w-3" />
            arraste para verificar / adiar
          </div>
        </div>
        <div className="hidden sm:block text-xs font-mono" style={{ color: meta.color }}>
          {alert.title}
        </div>
        <Button
          size="sm"
          onClick={onOpenModal}
          className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-12 px-4 text-sm font-semibold"
        >
          Verificar
        </Button>
      </div>
    </div>
  );
}

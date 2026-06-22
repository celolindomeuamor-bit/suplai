import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product, Alert, VerificationLog, Report } from "./stockguard-types";
import { MOCK_PRODUCTS, MOCK_ALERTS, MOCK_REPORTS } from "./stockguard-mock";

interface StockGuardCtx {
  products: Product[];
  alerts: Alert[];
  reports: Report[];
  verifications: VerificationLog[];
  getProduct: (id: string) => Product | undefined;
  getAlertForProduct: (id: string) => Alert | undefined;
  registerVerification: (v: Omit<VerificationLog, "id" | "date">) => void;
  updateProductQty: (id: string, qty: number) => void;
}

const Ctx = createContext<StockGuardCtx | null>(null);

export function StockGuardProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [alerts] = useState<Alert[]>(MOCK_ALERTS);
  const [reports] = useState<Report[]>(MOCK_REPORTS);
  const [verifications, setVerifications] = useState<VerificationLog[]>([]);

  const value = useMemo<StockGuardCtx>(
    () => ({
      products,
      alerts,
      reports,
      verifications,
      getProduct: (id) => products.find((p) => p.id === id),
      getAlertForProduct: (id) => alerts.find((a) => a.productId === id),
      registerVerification: (v) => {
        setVerifications((prev) => [
          ...prev,
          { ...v, id: `v${prev.length + 1}`, date: new Date().toLocaleString("pt-BR") },
        ]);
      },
      updateProductQty: (id, qty) =>
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, QTDE: qty } : p))),
    }),
    [products, alerts, reports, verifications]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStockGuard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStockGuard must be used inside StockGuardProvider");
  return ctx;
}

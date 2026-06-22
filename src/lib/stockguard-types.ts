export type Priority = "CRITICO" | "ALTO" | "MEDIO" | "BAIXO" | "MONITORAMENTO";

export type AlertType =
  | "RUPTURA"
  | "ERRO_ENTRADA_SAIDA"
  | "PROXIMO_VENCIMENTO"
  | "PRODUTO_PARADO"
  | "DIVERGENCIA_INVENTARIO"
  | "ENTRADA_SEM_SAIDA"
  | "ESTOQUE_ELEVADO"
  | "SEM_MOVIMENTACAO";

export interface Product {
  id: string;
  NOME: string;
  QTDE: number;
  PRECO: number;
  QT_ULTINVENT: number;
  DT_ULTINVENT: string;
  QT_ULTENTRADA: number;
  DT_ULTENTRADA: string;
  DT_ULTSAIDA: string;
  SECAO: string;
  GRUPO: string;
  VALIDADE: string;
}

export interface Alert {
  id: string;
  productId: string;
  type: AlertType;
  priority: Priority;
  title: string;
  reason: string;
}

export interface VerificationLog {
  id: string;
  productId: string;
  alertId: string;
  date: string;
  correct: boolean;
  correctedQty?: number;
  observation?: string;
}

export interface Report {
  id: string;
  kind: "DIARIO" | "SEMANAL" | "MENSAL";
  title: string;
  period: string;
  generatedAt: string;
  itemsAnalyzed: number;
  alertsCount: number;
  correctionsCount: number;
  expiringIn30: number;
  summary: string;
  topProblems: { name: string; reason: string }[];
  corrections: { name: string; previous: number; corrected: number; date: string }[];
  predictions: string;
  recurringErrors: string[];
}

export const PRIORITY_META: Record<Priority, { label: string; color: string; dot: string }> = {
  CRITICO: { label: "Crítico", color: "var(--priority-critical)", dot: "🔴" },
  ALTO: { label: "Alto", color: "var(--priority-high)", dot: "🟠" },
  MEDIO: { label: "Médio", color: "var(--priority-medium)", dot: "🟡" },
  BAIXO: { label: "Baixo", color: "var(--priority-low)", dot: "🟢" },
  MONITORAMENTO: { label: "Monitoramento", color: "var(--priority-monitor)", dot: "🔵" },
};

export const PRIORITY_ORDER: Priority[] = ["CRITICO", "ALTO", "MEDIO", "BAIXO", "MONITORAMENTO"];

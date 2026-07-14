import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ShieldCheck, Bell as BellIcon, ClipboardCheck, FileBarChart, Package } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useStockGuard } from "@/lib/stockguard-store";
import { cn } from "@/lib/utils";
import suplaiLogo from "@/assets/suplai-logo.png.asset.json";

const NAV = [
  { to: "/", label: "Alertas", icon: BellIcon },
  { to: "/campo", label: "Verificação", icon: ClipboardCheck },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/produtos", label: "Produtos", icon: Package },
] as const;

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return now;
}


export function AppShell({ children }: { children: ReactNode }) {
  const { alerts } = useStockGuard();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const now = useNow();
  const dateStr = now ? now.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) : "—";
  const timeStr = now ? now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "--:--";


  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface">
        <div className="relative px-5 pt-6 pb-5 border-b border-border overflow-hidden">
          {/* Radial glow backdrop */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, var(--color-primary) 22%, transparent) 0%, transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-primary) 55%, transparent), transparent)",
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 -m-2 rounded-2xl blur-xl opacity-60"
                style={{ background: "color-mix(in oklab, var(--color-primary) 35%, transparent)" }}
              />
              <img
                src={suplaiLogo.url}
                alt="Suplai"
                className="relative h-20 w-20 rounded-2xl object-contain ring-1 ring-border shadow-lg"
              />
            </div>
            <div className="mt-3 text-lg font-bold tracking-[0.18em] uppercase text-foreground">
              Suplai
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-priority-low animate-pulse" />
              v1.0 · ops
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border text-[11px] font-mono text-muted-foreground">
          Conectado ao n8n · live
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 px-4 md:px-6 h-16 border-b border-border bg-background/95 backdrop-blur">
          <div className="md:hidden flex items-center gap-2.5">
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-0 rounded-lg blur-md opacity-70"
                style={{ background: "color-mix(in oklab, var(--color-primary) 40%, transparent)" }}
              />
              <img
                src={suplaiLogo.url}
                alt="Suplai"
                className="relative h-10 w-10 rounded-lg object-contain ring-1 ring-border"
              />
            </div>
            <span className="font-bold tracking-[0.14em] uppercase text-sm">Suplai</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-muted-foreground font-mono uppercase">{dateStr}</span>
            <span className="text-sm font-mono">{timeStr}</span>
          </div>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface">
            <span className="h-2 w-2 rounded-full bg-priority-critical animate-pulse" />
            <span className="text-xs font-mono">
              {alerts.length} <span className="text-muted-foreground">alertas ativos</span>
            </span>
          </div>
          <button className="relative h-9 w-9 grid place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-priority-critical text-[10px] font-mono text-white grid place-items-center">
              {alerts.filter((a) => a.priority === "CRITICO").length}
            </span>
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-priority-monitor grid place-items-center text-xs font-bold text-background">
            GM
          </div>
        </header>

        <main className="flex-1 px-4 md:px-6 py-6 pb-24 md:pb-6 max-w-[1400px] w-full mx-auto">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-4 border-t border-border bg-surface">
          {NAV.map((item) => {
            const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export { ShieldCheck };

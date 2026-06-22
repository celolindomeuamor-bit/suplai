import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — StockGuard" },
      { name: "description", content: "Relatórios diários, semanais e mensais gerados por IA." },
    ],
  }),
  component: () => <Outlet />,
});

export { Link };

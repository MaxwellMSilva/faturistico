"use client";

import Link from "next/link";

import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
} from "lucide-react";

import { usePathname } from "next/navigation";

type Props = {
  empresaId: string;
  empresaNome: string;
};

export function EmpresaSidebar({
  empresaId,
  empresaNome,
}: Props) {
  const pathname = usePathname();

  const baseUrl =
    `/empresa/${empresaId}`;

  const links = [
    {
      nome: "Dashboard",
      href: `${baseUrl}/dashboard`,
      icon: LayoutDashboard,
      ativo: true,
    },
    {
      nome: "Clientes",
      href: `${baseUrl}/clientes`,
      icon: Users,
      ativo: true,
    },
    {
      nome: "Produtos",
      href: `${baseUrl}/produtos`,
      icon: Package,
      ativo: true,
    },
    {
      nome: "NF-e",
      href: `${baseUrl}/nfe`,
      icon: FileText,
      ativo: true,
    },
    {
      nome: "MDF-e",
      href: `${baseUrl}/mdfe`,
      icon: Truck,
      ativo: false,
    },
    {
      nome: "Naturezas de Operação",
      href: `${baseUrl}/naturezas-operacao`,
      icon: ClipboardList,
      ativo: true,
    },
    {
      nome: "Configurações",
      href: `${baseUrl}/configuracoes`,
      icon: Settings,
      ativo: true,
    },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-5">
        <Link
          href="/painel"
          className="text-xl font-bold"
        >
          Faturístico
        </Link>

        <div className="mt-4 rounded-xl border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Empresa atual
              </p>

              <p className="truncate text-sm font-semibold">
                {empresaNome}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((item) => {
          const Icon = item.icon;

          const selecionado =
            pathname === item.href ||
            pathname.startsWith(
              `${item.href}/`
            );

          if (!item.ativo) {
            return (
              <div
                key={item.nome}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />

                  <span>
                    {item.nome}
                  </span>
                </div>

                <span className="text-[10px] uppercase">
                  Em breve
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.nome}
              href={item.href}
              className={
                selecionado
                  ? "flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
                  : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              }
            >
              <Icon size={18} />

              {item.nome}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/empresas"
          className="flex w-full items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          Trocar de empresa
        </Link>
      </div>
    </aside>
  );
}
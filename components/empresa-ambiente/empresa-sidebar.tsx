"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  Building2,
  CarFront,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { usePathname } from "next/navigation";

type Props = {
  empresaId: string;
  empresaNome: string;
};

type ItemMenu = {
  nome: string;
  href: string;
  icon: typeof LayoutDashboard;
  ativo: boolean;
};

type GrupoMenu = {
  titulo: string;
  itens: ItemMenu[];
};

export function EmpresaSidebar({
  empresaId,
  empresaNome,
}: Props) {
  const pathname = usePathname();

  const baseUrl =
    `/empresa/${empresaId}`;

  const grupos: GrupoMenu[] = [
    {
      titulo: "Visão geral",

      itens: [
        {
          nome: "Dashboard",
          href: `${baseUrl}/dashboard`,
          icon: LayoutDashboard,
          ativo: true,
        },
      ],
    },

    {
      titulo: "Cadastros",

      itens: [
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
          nome: "Naturezas de operação",
          href: `${baseUrl}/naturezas-operacao`,
          icon: ClipboardList,
          ativo: true,
        },
      ],
    },

    {
      titulo: "Documentos fiscais",

      itens: [
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
      ],
    },

    {
      titulo: "Transportes",

      itens: [
        {
          nome: "Transportadores",
          href: `${baseUrl}/transportadores`,
          icon: Building2,
          ativo: true,
        },
        {
          nome: "Veículos",
          href: `${baseUrl}/veiculos`,
          icon: CarFront,
          ativo: true,
        },
        {
          nome: "Motoristas",
          href: `${baseUrl}/motoristas`,
          icon: UserRound,
          ativo: false,
        },
      ],
    },

    {
      titulo: "Sistema",

      itens: [
        {
          nome: "Configurações",
          href: `${baseUrl}/configuracoes`,
          icon: Settings,
          ativo: true,
        },
      ],
    },
  ];

  function rotaSelecionada(
    href: string
  ) {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  const empresaExibicao =
    empresaNome.trim() ||
    "Empresa";

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-card lg:flex">
      {/* Marca */}

      <div className="border-b px-5 py-4">
        <Link
          href="/painel"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <FileText size={20} />
          </div>

          <div>
            <p className="font-bold leading-none tracking-tight">
              Faturístico
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Gestão fiscal
            </p>
          </div>
        </Link>
      </div>

      {/* Empresa atual */}

      <div className="px-4 py-4">
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Empresa atual
              </p>

              <p
                className="mt-0.5 truncate text-sm font-semibold"
                title={empresaExibicao}
              >
                {empresaExibicao}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação */}

      <nav
        aria-label="Navegação da empresa"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <section
              key={grupo.titulo}
              className="space-y-1"
            >
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {grupo.titulo}
              </p>

              {grupo.itens.map(
                (item) => {
                  const Icone =
                    item.icon;

                  const selecionado =
                    rotaSelecionada(
                      item.href
                    );

                  if (!item.ativo) {
                    return (
                      <div
                        key={item.nome}
                        aria-disabled="true"
                        className="flex h-10 cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 text-sm text-muted-foreground opacity-60"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icone
                            size={18}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {item.nome}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-full border bg-muted/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                          Em breve
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.nome}
                      href={item.href}
                      aria-current={
                        selecionado
                          ? "page"
                          : undefined
                      }
                      className={[
                        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selecionado
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {selecionado && (
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
                      )}

                      <Icone
                        size={18}
                        className={[
                          "shrink-0 transition-colors",
                          selecionado
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground",
                        ].join(" ")}
                      />

                      <span className="truncate">
                        {item.nome}
                      </span>
                    </Link>
                  );
                }
              )}
            </section>
          ))}
        </div>
      </nav>

      {/* Rodapé */}

      <div className="border-t p-4">
        <Link
          href="/empresas"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeftRight size={16} />

          Trocar de empresa
        </Link>

        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Ambiente separado por empresa
        </p>
      </div>
    </aside>
  );
}
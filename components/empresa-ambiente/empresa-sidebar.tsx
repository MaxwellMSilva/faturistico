"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  Building2,
  CarFront,
  ClipboardList,
  FileText,
  Headphones,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Sparkles,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type Props = {
  empresaId: string;
  empresaNome: string;
  usuarioNome: string;
  usuarioEmail?: string;
  permissao: string;
};

type ItemMenu = {
  nome: string;
  href: string;
  icon: typeof LayoutDashboard;
  ativo: boolean;
  badge?: number;
};

type GrupoMenu = {
  titulo: string;
  itens: ItemMenu[];
};

const nomesPermissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  VISUALIZADOR: "Visualizador",
};

export function EmpresaSidebar({
  empresaId,
  empresaNome,
  usuarioNome,
  usuarioEmail,
  permissao,
}: Props) {
  const pathname = usePathname();

  const baseUrl =
    `/empresa/${empresaId}`;

  const grupos: GrupoMenu[] = [
    {
      titulo: "Workspace",

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

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const nomePermissao =
    nomesPermissoes[permissao] ??
    permissao;

  const emailExibicao =
    usuarioEmail?.trim() ||
    nomePermissao;

  const inicial =
    usuarioExibicao
      .charAt(0)
      .toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border/60 bg-sidebar lg:flex">
      <div className="px-5 pb-4 pt-5">
        <Link
          href="/painel"
          className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
            <FileText size={18} />
          </div>

          <div>
            <p className="text-[15px] font-bold leading-none tracking-tight text-foreground">
              Faturístico
            </p>

            <p className="mt-1 text-[11px] text-muted-foreground">
              Gestão fiscal
            </p>
          </div>
        </Link>

        <div className="glass-input mt-5 flex items-center gap-2.5 px-3 py-2.5">
          <Sparkles
            size={15}
            className="shrink-0 text-primary"
          />

          <span className="text-sm text-muted-foreground">
            Busca inteligente
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
          <Search
            size={15}
            className="shrink-0 text-muted-foreground"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Empresa
            </p>

            <p
              className="truncate text-sm font-semibold text-foreground"
              title={empresaExibicao}
            >
              {empresaExibicao}
            </p>
          </div>
        </div>
      </div>

      <nav
        aria-label="Navegação da empresa"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <section
              key={grupo.titulo}
              className="space-y-0.5"
            >
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
                        className="flex h-9 cursor-not-allowed items-center justify-between gap-3 rounded-lg px-3 text-sm text-muted-foreground/60"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icone
                            size={17}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {item.nome}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
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
                      className={cn(
                        "group flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        selecionado
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <Icone
                        size={17}
                        className={cn(
                          "shrink-0",
                          selecionado
                            ? "text-sidebar-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />

                      <span className="truncate">
                        {item.nome}
                      </span>

                      {item.badge !==
                        undefined &&
                        item.badge >
                          0 && (
                          <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                            {item.badge}
                          </span>
                        )}
                    </Link>
                  );
                }
              )}
            </section>
          ))}
        </div>
      </nav>

      <div className="border-t border-border/60 p-4">
        <div className="space-y-0.5">
          <Link
            href={`${baseUrl}/configuracoes`}
            className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <Settings size={17} />

            Configurações
          </Link>

          <button
            type="button"
            className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            <Headphones size={17} />

            Suporte
          </button>
        </div>

        <Link
          href="/empresas"
          className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeftRight size={15} />

          Trocar de empresa
        </Link>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {inicial}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold text-foreground"
              title={usuarioExibicao}
            >
              {usuarioExibicao}
            </p>

            <p
              className="truncate text-[11px] text-muted-foreground"
              title={emailExibicao}
            >
              {emailExibicao}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

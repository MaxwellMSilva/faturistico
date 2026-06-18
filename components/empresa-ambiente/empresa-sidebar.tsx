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
  LoaderCircle,
  LogOut,
  Package,
  Settings,
  Truck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "next-auth/react";

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
  const [saindo, setSaindo] =
    useState(false);

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
          ativo: true,
        },
      ],
    },
    {
      titulo: "Gestão",
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

  async function handleLogout() {
    try {
      setSaindo(true);

      await signOut({
        callbackUrl: "/entrar",
      });
    } catch (error) {
      console.error(
        "Erro ao encerrar sessão:",
        error
      );

      setSaindo(false);
    }
  }

  return (
    <aside
      className="empresa-sidebar sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-empresa-sidebar lg:flex"
      style={{
        backgroundColor: "#0a1628",
        backgroundImage:
          "linear-gradient(180deg, #0c1a30 0%, #0a1628 45%, #071018 100%)",
      }}
    >
      <div className="px-5 pb-5 pt-6">
        <Link
          href="/painel"
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-[0_8px_24px_rgb(37_99_235/0.45)]">
            <Zap size={18} />
          </div>

          <div>
            <p className="text-[15px] font-bold leading-none tracking-tight text-white">
              Faturístico
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Fiscal
            </p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Navegação da empresa"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <div className="space-y-7">
          {grupos.map((grupo) => (
            <section
              key={grupo.titulo}
              className="space-y-1"
            >
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
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
                        className="flex h-10 cursor-not-allowed items-center justify-between gap-3 rounded-xl px-3 text-sm text-slate-500"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Icone
                            size={17}
                            className="shrink-0 text-slate-600"
                          />

                          <span className="truncate">
                            {item.nome}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
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
                        "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",
                        selecionado
                          ? "bg-[#1e3a5f] text-white shadow-[inset_0_0_0_1px_rgb(96_165_250/0.2)]"
                          : "text-slate-400 hover:bg-[#132337] hover:text-slate-100"
                      )}
                    >
                      <Icone
                        size={17}
                        className={cn(
                          "shrink-0",
                          selecionado
                            ? "text-blue-300"
                            : "text-slate-500 group-hover:text-slate-300"
                        )}
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

      <div className="border-t border-white/10 bg-[#081220]/80 p-4">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-[#132337] hover:text-slate-100"
        >
          <Headphones size={17} />

          Suporte
        </button>

        <Link
          href="/empresas"
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/15 hover:bg-[#132337] hover:text-white"
        >
          <ArrowLeftRight size={15} />

          Trocar de empresa
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={saindo}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/15 hover:bg-[#132337] hover:text-white disabled:opacity-60"
        >
          {saindo ? (
            <LoaderCircle
              size={15}
              className="animate-spin"
            />
          ) : (
            <LogOut size={15} />
          )}

          {saindo ? "Saindo..." : "Sair"}
        </button>

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#132337]/80 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Empresa ativa
          </p>

          <p
            className="mt-1 truncate text-sm font-semibold text-white"
            title={empresaExibicao}
          >
            {empresaExibicao}
          </p>

          <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white ring-2 ring-blue-400/30">
              {inicial}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-white"
                title={usuarioExibicao}
              >
                {usuarioExibicao}
              </p>

              <p
                className="truncate text-[11px] text-slate-400"
                title={emailExibicao}
              >
                {emailExibicao}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

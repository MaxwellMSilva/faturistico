"use client";

import Link from "next/link";

import {
  Building2,
  Headphones,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Users,
  Zap,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

type RoleUsuario =
  | "OWNER"
  | "ADMIN"
  | "USUARIO";

type Props = {
  usuarioNome: string;
  usuarioEmail?: string;
  role: RoleUsuario;
};

type ItemMenu = {
  nome: string;
  href: string;
  icon: typeof LayoutDashboard;
};

const rotulosRole = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USUARIO: "Visualizador",
} as const;

export function PortalSidebar({
  usuarioNome,
  usuarioEmail,
  role,
}: Props) {
  const pathname =
    usePathname();

  const [saindo, setSaindo] =
    useState(false);

  const podeGerenciarUsuarios =
    role === "OWNER" ||
    role === "ADMIN";

  const itens: ItemMenu[] = [
    {
      nome: "Painel",
      href: "/painel",
      icon: LayoutDashboard,
    },
    {
      nome: "Empresas",
      href: "/empresas",
      icon: Building2,
    },
    ...(podeGerenciarUsuarios
      ? [
          {
            nome: "Usuários",
            href: "/usuarios",
            icon: Users,
          } satisfies ItemMenu,
        ]
      : []),
  ];

  function rotaSelecionada(
    href: string
  ) {
    if (href === "/painel") {
      return pathname === "/painel";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const emailExibicao =
    usuarioEmail?.trim() ||
    rotulosRole[role];

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
              Plataforma
            </p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Navegação da plataforma"
        className="flex-1 overflow-y-auto px-3 pb-4"
      >
        <section className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Menu
          </p>

          {itens.map((item) => {
            const Icone = item.icon;

            const selecionado =
              rotaSelecionada(
                item.href
              );

            return (
              <Link
                key={item.href}
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
          })}
        </section>
      </nav>

      <div className="border-t border-white/10 bg-[#081220]/80 p-4">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-[#132337] hover:text-slate-100"
        >
          <Headphones size={17} />

          Suporte
        </button>

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
            Sua conta
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            {rotulosRole[role]}
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

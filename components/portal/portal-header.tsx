"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useState } from "react";

import {
  Building2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Users,
} from "lucide-react";

import { signOut } from "next-auth/react";

type RoleUsuario =
  | "OWNER"
  | "ADMIN"
  | "USUARIO";

type Props = {
  nome: string;
  role: RoleUsuario;
};

type LinkPortal = {
  href: string;
  titulo: string;
  icone: typeof Building2;

  restritoUsuarios?: boolean;
};

const links: LinkPortal[] = [
  {
    href: "/empresas",
    titulo: "Empresas",
    icone: Building2,
  },
  {
    href: "/usuarios",
    titulo: "Usuários",
    icone: Users,

    restritoUsuarios: true,
  },
];

export function PortalHeader({
  nome,
  role,
}: Props) {
  const pathname =
    usePathname();

  const [saindo, setSaindo] =
    useState(false);

  const nomeExibicao =
    nome.trim() || "Usuário";

  const inicial =
    nomeExibicao
      .charAt(0)
      .toUpperCase();

  const podeGerenciarUsuarios =
    role === "OWNER" ||
    role === "ADMIN";

  function rotaAtiva(
    href: string
  ) {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  function linkBloqueado(
    link: LinkPortal
  ) {
    return (
      link.restritoUsuarios &&
      !podeGerenciarUsuarios
    );
  }

  async function handleLogout() {
    try {
      setSaindo(true);

      await signOut({
        callbackUrl: "/entrar",
      });
    } catch (error) {
      console.error(
        "Erro ao sair:",
        error
      );

      setSaindo(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-6">
        {/* Marca e navegação */}

        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/painel"
            className="flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText size={20} />
            </div>

            <div className="hidden sm:block">
              <p className="text-base font-bold leading-none tracking-tight">
                Faturístico
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                Gestão fiscal
              </p>
            </div>
          </Link>

          {/* Navegação desktop */}

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 md:flex"
          >
            {links.map((link) => {
              const Icone =
                link.icone;

              const bloqueado =
                linkBloqueado(
                  link
                );

              const ativa =
                !bloqueado &&
                rotaAtiva(
                  link.href
                );

              if (bloqueado) {
                return (
                  <button
                    key={link.href}
                    type="button"
                    disabled
                    title="Você não possui permissão para gerenciar usuários"
                    className="relative flex h-10 cursor-not-allowed items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground opacity-45"
                  >
                    <Icone size={17} />

                    {link.titulo}

                    <LockKeyhole
                      size={13}
                      className="ml-0.5"
                    />
                  </button>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    ativa
                      ? "page"
                      : undefined
                  }
                  className={[
                    "relative flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    ativa
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Icone size={17} />

                  {link.titulo}

                  {ativa && (
                    <span className="absolute inset-x-3 -bottom-[14px] h-0.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Conta */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden max-w-48 text-right lg:block">
            <p className="truncate text-sm font-medium">
              {nomeExibicao}
            </p>

            <p className="text-xs text-muted-foreground">
              {role === "OWNER"
                ? "Proprietário"
                : role === "ADMIN"
                  ? "Administrador"
                  : "Usuário"}
            </p>
          </div>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted/30 text-sm font-semibold"
            title={nomeExibicao}
          >
            {inicial}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={saindo}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {saindo ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <LogOut size={16} />
            )}

            <span className="hidden sm:inline">
              {saindo
                ? "Saindo..."
                : "Sair"}
            </span>
          </button>
        </div>
      </div>

      {/* Navegação móvel */}

      <nav
        aria-label="Navegação móvel"
        className="border-t border-border/60 md:hidden"
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-1 px-5 py-2">
          {links.map((link) => {
            const Icone =
              link.icone;

            const bloqueado =
              linkBloqueado(
                link
              );

            const ativa =
              !bloqueado &&
              rotaAtiva(
                link.href
              );

            if (bloqueado) {
              return (
                <button
                  key={link.href}
                  type="button"
                  disabled
                  title="Você não possui permissão para gerenciar usuários"
                  className="flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg text-sm font-medium text-muted-foreground opacity-45"
                >
                  <Icone size={17} />

                  {link.titulo}

                  <LockKeyhole
                    size={13}
                  />
                </button>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  ativa
                    ? "page"
                    : undefined
                }
                className={[
                  "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  ativa
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icone size={17} />

                {link.titulo}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
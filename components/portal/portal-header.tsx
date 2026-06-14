"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useState } from "react";

import {
  Building2,
  FileText,
  LoaderCircle,
  LogOut,
  Users,
} from "lucide-react";

import { signOut } from "next-auth/react";

type Props = {
  nome: string;
};

const links = [
  {
    href: "/empresas",
    titulo: "Empresas",
    icone: Building2,
  },
  {
    href: "/usuarios",
    titulo: "Usuários",
    icone: Users,
  },
];

export function PortalHeader({
  nome,
}: Props) {
  const pathname = usePathname();

  const [saindo, setSaindo] =
    useState(false);

  const nomeExibicao =
    nome.trim() || "Usuário";

  const inicial =
    nomeExibicao
      .charAt(0)
      .toUpperCase();

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
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
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

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 md:flex"
          >
            {links.map((link) => {
              const Icone =
                link.icone;

              const ativa =
                rotaAtiva(
                  link.href
                );

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
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Icone size={17} />

                  {link.titulo}

                  {ativa && (
                    <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />
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
              Conta da plataforma
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

      {/* Navegação para celular */}

      <nav
        aria-label="Navegação móvel"
        className="border-t md:hidden"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 px-4 py-2">
          {links.map((link) => {
            const Icone =
              link.icone;

            const ativa =
              rotaAtiva(
                link.href
              );

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
                    ? "bg-primary/10 text-primary"
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
"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  LoaderCircle,
  LogOut,
} from "lucide-react";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { signOut } from "next-auth/react";

type Props = {
  empresaNome: string;
  usuarioNome: string;
};

const titulosPagina: Record<
  string,
  string
> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  produtos: "Produtos",
  "naturezas-operacao":
    "Naturezas de operação",
  nfe: "NF-e",
  mdfe: "MDF-e",
  transportadores: "Transportadores",
  veiculos: "Veículos",
  motoristas: "Motoristas",
  configuracoes: "Configurações",
};

export function EmpresaHeader({
  empresaNome,
  usuarioNome,
}: Props) {
  const pathname = usePathname();
  const [saindo, setSaindo] =
    useState(false);

  const isDashboard =
    pathname.endsWith("/dashboard");

  const empresaExibicao =
    empresaNome.trim() ||
    "Empresa";

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const inicial =
    usuarioExibicao
      .charAt(0)
      .toUpperCase();

  const segmentos =
    pathname.split("/").filter(Boolean);

  const ultimoSegmento =
    segmentos[
      segmentos.length - 1
    ] ?? "dashboard";

  const tituloPagina =
    titulosPagina[ultimoSegmento] ??
    "Painel";

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

  if (isDashboard) {
    return (
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-end gap-2 px-5 sm:px-6">
          <Link
            href="/empresas"
            className="hidden h-8 items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted md:inline-flex"
          >
            <ArrowLeftRight size={14} />

            Trocar empresa
          </Link>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
            title={usuarioExibicao}
          >
            {inicial}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={saindo}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {saindo ? (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            ) : (
              <LogOut size={14} />
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex min-h-[60px] items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            {tituloPagina}
          </h1>

          <p
            className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm"
            title={empresaExibicao}
          >
            {empresaExibicao}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/empresas"
            className="hidden h-9 items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted md:inline-flex"
          >
            <ArrowLeftRight size={15} />

            Trocar empresa
          </Link>

          <div
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary sm:flex"
            title={usuarioExibicao}
          >
            {inicial}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={saindo}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border/60 bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
          >
            {saindo ? (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            ) : (
              <LogOut size={15} />
            )}

            <span className="hidden sm:inline">
              {saindo
                ? "Saindo..."
                : "Sair"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

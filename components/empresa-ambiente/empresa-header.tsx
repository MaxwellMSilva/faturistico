"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  Building2,
  LoaderCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import { signOut } from "next-auth/react";

type Props = {
  empresaNome: string;
  usuarioNome: string;
  permissao: string;
};

const nomesPermissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  VISUALIZADOR: "Visualizador",
};

export function EmpresaHeader({
  empresaNome,
  usuarioNome,
  permissao,
}: Props) {
  const [saindo, setSaindo] =
    useState(false);

  const empresaExibicao =
    empresaNome.trim() ||
    "Empresa";

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const nomePermissao =
    nomesPermissoes[permissao] ??
    permissao;

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
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-2 sm:px-6">
        {/* Empresa atual */}

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={20} />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              Ambiente da empresa
            </p>

            <p
              className="max-w-44 truncate text-sm font-semibold sm:max-w-72 lg:max-w-md"
              title={empresaExibicao}
            >
              {empresaExibicao}
            </p>
          </div>
        </div>

        {/* Usuário e ações */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/empresas"
            className="hidden h-10 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
          >
            <ArrowLeftRight size={16} />

            Trocar empresa
          </Link>

          <div className="hidden max-w-52 text-right lg:block">
            <p
              className="truncate text-sm font-medium"
              title={usuarioExibicao}
            >
              {usuarioExibicao}
            </p>

            <p className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <ShieldCheck size={13} />

              {nomePermissao}
            </p>
          </div>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted/30 text-sm font-semibold"
            title={`${usuarioExibicao} — ${nomePermissao}`}
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

      {/* Barra móvel */}

      <div className="border-t px-4 py-2 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
              {usuarioExibicao}
            </p>

            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <ShieldCheck size={12} />

              {nomePermissao}
            </p>
          </div>

          <Link
            href="/empresas"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftRight size={14} />

            Trocar empresa
          </Link>
        </div>
      </div>
    </header>
  );
}
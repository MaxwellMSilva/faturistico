"use client";

import Link from "next/link";

import {
  Building2,
  LogOut,
} from "lucide-react";

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
  FATURAMENTO: "Faturamento",
  OPERADOR: "Operador",
  VISUALIZADOR: "Visualizador",
};

export function EmpresaHeader({
  empresaNome,
  usuarioNome,
  permissao,
}: Props) {
  const inicial =
    usuarioNome
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  async function handleLogout() {
    await signOut({
      callbackUrl: "/entrar",
    });
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <Building2
          size={19}
          className="text-muted-foreground"
        />

        <div>
          <p className="text-xs text-muted-foreground">
            Ambiente da empresa
          </p>

          <p className="text-sm font-semibold">
            {empresaNome}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/empresas"
          className="hidden rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted md:inline-flex"
        >
          Trocar empresa
        </Link>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">
            {usuarioNome}
          </p>

          <p className="text-xs text-muted-foreground">
            {nomesPermissoes[
              permissao
            ] ?? permissao}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border font-semibold">
          {inicial}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
        >
          <LogOut size={16} />

          <span className="hidden sm:inline">
            Sair
          </span>
        </button>
      </div>
    </header>
  );
}
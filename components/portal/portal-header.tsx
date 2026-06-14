"use client";

import Link from "next/link";

import {
  Building2,
  LogOut,
  Users,
} from "lucide-react";

import { signOut } from "next-auth/react";

type Props = {
  nome: string;
};

export function PortalHeader({
  nome,
}: Props) {
  async function handleLogout() {
    await signOut({
      callbackUrl: "/entrar",
    });
  }

  const inicial =
    nome.trim().charAt(0).toUpperCase();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/painel"
            className="text-xl font-bold"
          >
            Faturístico
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/empresas"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Building2 size={17} />
              Empresas
            </Link>

            <Link
              href="/usuarios"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              <Users size={17} />
              Usuários
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">
              {nome}
            </p>

            <p className="text-xs text-muted-foreground">
              Conta da plataforma
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
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
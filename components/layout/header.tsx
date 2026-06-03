"use client";

import { PanelLeft, LogOut } from "lucide-react";

import { signOut } from "next-auth/react";

import { useSidebarStore } from "@/lib/sidebar-store";

export function Header() {
  const { toggle } = useSidebarStore();

  async function handleLogout() {
    await signOut({
      callbackUrl: "/entrar",
    });
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">

      <div className="flex items-center gap-4">

        <button
          onClick={toggle}
          className="rounded-lg border p-2 hover:bg-muted"
        >
          <PanelLeft size={18} />
        </button>

      </div>

      <div className="flex items-center gap-4">

        <div className="text-right">
          <p className="text-sm font-medium">
            Maxwell
          </p>

          <p className="text-xs text-muted-foreground">
            Administrador
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border">
          M
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          <LogOut size={16} />
          Sair
        </button>

      </div>

    </header>
  );
}
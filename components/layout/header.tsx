"use client";

import { PanelLeft } from "lucide-react";
import { useSidebarStore } from "@/lib/sidebar-store";

export function Header() {
  const { toggle } = useSidebarStore();

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

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            Maxwell
          </p>

          <p className="text-xs text-muted-foreground">
            Administrador
          </p>
        </div>

        <div className="h-10 w-10 rounded-full border flex items-center justify-center">
          M
        </div>
      </div>
    </header>
  );
}
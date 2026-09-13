"use client";

import { Printer } from "lucide-react";

export function DactePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 print:hidden"
    >
      <Printer size={16} />
      Imprimir DACTE
    </button>
  );
}

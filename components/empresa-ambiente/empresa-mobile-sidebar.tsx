"use client";

import {
  Menu,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import {
  EmpresaSidebar,
  type EmpresaSidebarProps,
} from "@/components/empresa-ambiente/empresa-sidebar";

import { cn } from "@/lib/utils";

type Props = Omit<
  EmpresaSidebarProps,
  "variante" | "onNavigate"
>;

export function EmpresaMobileSidebar(
  props: Props
) {
  const pathname =
    usePathname();

  const [
    aberto,
    setAberto,
  ] = useState(false);

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    const overflowAnterior =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setAberto(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        overflowAnterior;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [aberto]);

  return (
    <>
      {/* Barra mobile */}

      <div className="flex h-14 shrink-0 items-center border-b bg-background px-4 lg:hidden">
        <button
          type="button"
          onClick={() =>
            setAberto(true)
          }
          aria-label="Abrir menu"
          aria-expanded={aberto}
          aria-controls="empresa-sidebar-mobile"
          className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu size={19} />

          Menu
        </button>

        <div className="ml-3 min-w-0">
          <p className="truncate text-sm font-semibold">
            {props.empresaNome}
          </p>

          <p className="text-xs text-muted-foreground">
            Ambiente fiscal
          </p>
        </div>
      </div>

      {/* Área do menu */}

      <div
        id="empresa-sidebar-mobile"
        aria-hidden={!aberto}
        className={cn(
          "fixed inset-0 z-[100] lg:hidden",

          aberto
            ? "pointer-events-auto"
            : "pointer-events-none"
        )}
      >
        {/* Fundo escurecido */}

        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() =>
            setAberto(false)
          }
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300",

            aberto
              ? "opacity-100"
              : "opacity-0"
          )}
        />

        {/* Painel lateral */}

        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[280px] max-w-[86vw] shadow-[20px_0_60px_rgb(0_0_0/0.45)] transition-transform duration-300 ease-out",

            aberto
              ? "translate-x-0"
              : "-translate-x-full"
          )}
        >
          <button
            type="button"
            onClick={() =>
              setAberto(false)
            }
            aria-label="Fechar menu"
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
          >
            <X size={18} />
          </button>

          <EmpresaSidebar
            {...props}
            variante="mobile"
            onNavigate={() =>
              setAberto(false)
            }
          />
        </div>
      </div>
    </>
  );
}

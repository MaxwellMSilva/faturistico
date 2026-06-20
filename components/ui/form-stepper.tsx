"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";
import {
  useEffect,
  useRef,
} from "react";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { DialogContent } from "@/components/ui/dialog";

type FormStepperPasso = {
  id: string;
  titulo: string;
};

type FormStepperNavProps = {
  passos: readonly FormStepperPasso[];
  passoAtual: number;
};

export function FormStepperDialogContent({
  className,
  children,
  ...props
}: ComponentProps<
  typeof DialogContent
>) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl",
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  );
}

export function FormStepperNav({
  passos,
  passoAtual,
}: FormStepperNavProps) {
  const passoAtivoRef =
    useRef<HTMLDivElement | null>(
      null
    );

  useEffect(() => {
    passoAtivoRef.current?.scrollIntoView(
      {
        block: "nearest",
        inline: "center",
      }
    );
  }, [passoAtual]);

  return (
    <nav
      aria-label="Etapas do formulário"
      className="shrink-0 border-b bg-muted/20"
    >
      <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="mx-auto flex w-max min-w-full items-center justify-center px-6 py-4">
          {passos.map(
            (passo, indice) => {
              const ativo =
                indice === passoAtual;

              const concluido =
                indice < passoAtual;

              return (
                <li
                  key={passo.id}
                  className="flex shrink-0 items-center"
                >
                  <div
                    ref={
                      ativo
                        ? passoAtivoRef
                        : null
                    }
                    aria-current={
                      ativo
                        ? "step"
                        : undefined
                    }
                    className={[
                      "flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all",
                      ativo
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : concluido
                          ? "border-primary/25 bg-primary/5 text-foreground"
                          : "border-border bg-background text-muted-foreground",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                        ativo
                          ? "bg-primary text-primary-foreground"
                          : concluido
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {concluido ? (
                        <Check
                          size={14}
                          strokeWidth={2.5}
                        />
                      ) : (
                        indice + 1
                      )}
                    </span>

                    <span className="whitespace-nowrap">
                      {passo.titulo}
                    </span>
                  </div>

                  {indice <
                    passos.length - 1 && (
                    <div
                      aria-hidden="true"
                      className={[
                        "mx-2 h-px w-5 shrink-0 sm:w-7 lg:w-8",
                        concluido
                          ? "bg-primary"
                          : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </li>
              );
            }
          )}
        </ol>
      </div>
    </nav>
  );
}

export function FormStepperBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto px-6 py-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function FormStepperFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t bg-background px-6 py-4 sm:flex-row sm:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}

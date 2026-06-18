"use client";

import type {
  ComponentProps,
  ReactNode,
} from "react";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { DialogContent } from "@/components/ui/dialog";

export type FormStepperPasso = {
  id: string;
  titulo: string;
};

type FormStepperNavProps = {
  passos: FormStepperPasso[];
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
  return (
    <nav
      aria-label="Etapas do formulário"
      className="shrink-0 border-b bg-muted/20 px-6 py-4"
    >
      <ol className="flex flex-wrap items-center gap-2 sm:gap-3">
        {passos.map((passo, indice) => {
          const ativo =
            indice === passoAtual;

          const concluido =
            indice < passoAtual;

          return (
            <li
              key={passo.id}
              className="flex min-w-0 items-center gap-2 sm:gap-3"
            >
              {indice > 0 && (
                <span
                  aria-hidden
                  className="hidden h-px w-4 bg-border sm:block sm:w-8"
                />
              )}

              <div
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm",
                  ativo &&
                    "border-primary bg-primary/10 text-primary",
                  concluido &&
                    "border-emerald-200 bg-emerald-50 text-emerald-700",
                  !ativo &&
                    !concluido &&
                    "border-border bg-background text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-xs",
                    ativo &&
                      "bg-primary text-primary-foreground",
                    concluido &&
                      "bg-emerald-500 text-white",
                    !ativo &&
                      !concluido &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {concluido ? (
                    <Check size={12} />
                  ) : (
                    indice + 1
                  )}
                </span>

                <span className="truncate">
                  {passo.titulo}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
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

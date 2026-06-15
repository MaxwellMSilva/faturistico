import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeftRight,
  LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  empresaNome: string;
};

export function EmpresaInativaBanner({
  empresaNome,
}: Props) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <LockKeyhole size={21} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle
                size={17}
                className="text-amber-700 dark:text-amber-400"
              />

              <h2 className="font-semibold">
                Empresa inativa — somente leitura
              </h2>
            </div>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              A empresa{" "}
              <strong className="font-semibold text-foreground">
                {empresaNome}
              </strong>{" "}
              está inativa. Os registros podem
              ser consultados, mas nenhuma
              alteração será permitida até que
              a empresa seja reativada.
            </p>
          </div>
        </div>

        <Button
          nativeButton={false}
          render={
            <Link href="/empresas" />
          }
          variant="outline"
          className="h-10 shrink-0"
        >
          <ArrowLeftRight size={16} />

          Gerenciar empresas
        </Button>
      </div>
    </div>
  );
}
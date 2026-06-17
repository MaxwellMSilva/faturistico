import Link from "next/link";

import {
  FileText,
  Plus,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type DashboardToolbarProps = {
  titulo?: string;
  atualizadoEm: string;
  novaNfeHref: string;
  clientesHref: string;
  configuracoesHref: string;
};

export function DashboardToolbar({
  titulo = "Dashboard",
  atualizadoEm,
  novaNfeHref,
  clientesHref,
  configuracoesHref,
}: DashboardToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {titulo}
        </h1>

        <p className="mt-1 text-xs text-muted-foreground">
          Atualizado em {atualizadoEm}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          render={
            <Link href={clientesHref} />
          }
        >
          <FileText />

          Clientes
        </Button>

        <Button
          variant="outline"
          size="sm"
          render={
            <Link
              href={configuracoesHref}
            />
          }
        >
          <Settings />

          Configurações
        </Button>

        <Button
          size="sm"
          render={
            <Link href={novaNfeHref} />
          }
        >
          <Plus />

          Nova NF-e
        </Button>
      </div>
    </div>
  );
}

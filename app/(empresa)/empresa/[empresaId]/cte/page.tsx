import {
  PrivilegioEmpresa,
} from "@prisma/client";

import {
  FileText,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

export default async function CtePage({
  params,
}: Props) {
  const { empresaId } = await params;

  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR,
    {
      exigirEmpresaAtiva: false,
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            CT-e
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Conhecimentos de Transporte Eletrônicos da empresa.
          </p>
        </div>

        <Button disabled>
          <Plus size={16} />
          Novo CT-e
        </Button>
      </div>

      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText size={24} />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Módulo de CT-e iniciado
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A estrutura fiscal do CT-e modelo 57 já está sendo preparada.
            O próximo passo será disponibilizar a listagem e o formulário
            para criação de novos conhecimentos de transporte.
          </p>
        </div>
      </div>
    </div>
  );
}

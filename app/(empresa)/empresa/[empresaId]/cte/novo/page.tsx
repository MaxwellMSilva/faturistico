import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { getDadosFormCte } from "@/actions/cte/get-dados-form-cte";
import { CteForm } from "@/components/cte/cte-form-configurado";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

export default async function NovoCtePage({
  params,
}: Props) {
  const { empresaId } = await params;

  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_CRIAR
  );

  const dados =
    await getDadosFormCte(empresaId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">
          CT-e · Modelo 57
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Novo CT-e
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre a prestação, vincule as NF-e e informe a tributação antes da validação fiscal.
        </p>
      </div>

      <CteForm
        empresaId={empresaId}
        empresa={dados.empresa}
        clientes={dados.clientes}
        configuracao={dados.configuracao}
      />
    </div>
  );
}

import { PrivilegioEmpresa } from "@prisma/client";

import { getDadosFormCte } from "@/actions/cte/get-dados-form-cte";
import { CteEmissaoModal } from "@/components/cte/cte-emissao-modal";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

export default async function NovoCteModalPage({
  params,
}: Props) {
  const { empresaId } = await params;

  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_CRIAR
  );

  const dados = await getDadosFormCte(
    empresaId
  );

  return (
    <CteEmissaoModal
      empresaId={empresaId}
      empresa={dados.empresa}
      clientes={dados.clientes}
      naturezas={dados.naturezas}
      configuracao={dados.configuracao}
      proximoNumeroCte={
        dados.proximoNumeroCte
      }
    />
  );
}

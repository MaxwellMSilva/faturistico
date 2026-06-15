import { notFound } from "next/navigation";

import { getNfeDetalhes } from "@/actions/nfe/get-nfe-detalhes";
import { getDadosTransporteNfe } from "@/actions/nfe/get-dados-transporte-nfe";

import { NfeRascunhoForm } from "@/components/nfe/nfe-rascunho-form";
import { NfeTransporteForm } from "@/components/nfe/nfe-transporte-form";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
    notaFiscalId: string;
  }>;
};

export default async function NfeDetalhesPage({
  params,
}: Props) {
  const {
    empresaId,
    notaFiscalId,
  } = await params;

  const [
    dados,
    dadosTransporte,
  ] = await Promise.all([
    getNfeDetalhes(
      empresaId,
      notaFiscalId
    ),

    getDadosTransporteNfe(
      empresaId,
      notaFiscalId
    ),
  ]);

  if (
    !dados ||
    !dadosTransporte
  ) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <NfeRascunhoForm
        empresaId={empresaId}
        nota={dados.nota}
        produtos={dados.produtos}
      />

      <NfeTransporteForm
        empresaId={empresaId}
        notaFiscalId={
          notaFiscalId
        }
        podeEditar={
          dadosTransporte.podeEditar
        }
        transporte={
          dadosTransporte.transporte
        }
        transportadores={
          dadosTransporte.transportadores
        }
        veiculos={
          dadosTransporte.veiculos
        }
        motoristas={
          dadosTransporte.motoristas
        }
      />
    </div>
  );
}
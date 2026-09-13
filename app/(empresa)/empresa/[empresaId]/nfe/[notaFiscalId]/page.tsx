import { notFound } from "next/navigation";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { getNfeDetalhes } from "@/actions/nfe/get-nfe-detalhes";
import { getDadosTransporteNfe } from "@/actions/nfe/get-dados-transporte-nfe";
import { getPagamentosNfe } from "@/actions/nfe/get-pagamentos-nfe";

import { NfeRascunhoForm } from "@/components/nfe/nfe-rascunho-form";
import { NfePagamentosForm } from "@/components/nfe/nfe-pagamentos-form";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

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

  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.NFE_VISUALIZAR
  );

  const [
    dados,
    dadosTransporte,
    dadosPagamentos,
  ] = await Promise.all([
    getNfeDetalhes(
      empresaId,
      notaFiscalId
    ),

    getDadosTransporteNfe(
      empresaId,
      notaFiscalId
    ),

    getPagamentosNfe(
      empresaId,
      notaFiscalId
    ),
  ]);

  if (
    !dados ||
    !dadosTransporte ||
    !dadosPagamentos
  ) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <NfeRascunhoForm
        empresaId={empresaId}
        nota={dados.nota}
        produtos={dados.produtos}
        dadosTransporte={{
          notaFiscalId,

          podeEditar:
            dadosTransporte.podeEditar,

          transporte:
            dadosTransporte.transporte,

          transportadores:
            dadosTransporte.transportadores,

          veiculos:
            dadosTransporte.veiculos,

          motoristas:
            dadosTransporte.motoristas,
        }}
      />

      <NfePagamentosForm
        empresaId={empresaId}
        notaFiscalId={notaFiscalId}
        valorTotal={
          dadosPagamentos.valorTotal
        }
        podeEditar={
          dadosPagamentos.podeEditar
        }
        pagamentos={
          dadosPagamentos.pagamentos
        }
      />
    </div>
  );
}

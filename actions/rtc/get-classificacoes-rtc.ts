"use server";

import { PrivilegioEmpresa } from "@prisma/client";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { obterTabelaClassTribRtc } from "@/lib/fiscal/classificacao-tributaria-rtc";

export type GetClassificacoesRtcResult =
  | {
      success: true;
      classificacoes: Array<{
        cst: string;
        codigo: string;
        descricao: string;
        tipoAliquota: string | null;
        reducaoIbs: number | null;
        reducaoCbs: number | null;
        tributacaoRegular: boolean | null;
      }>;
      atualizadoEm: string | null;
      desatualizada: boolean;
      fonte: string | null;
    }
  | {
      success: false;
      message: string;
    };

export async function getClassificacoesRtc(
  empresaId: string
): Promise<GetClassificacoesRtcResult> {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.PRODUTOS_VISUALIZAR
  );

  const tabela =
    await obterTabelaClassTribRtc();

  if (!tabela) {
    return {
      success: true,
      classificacoes: [],
      atualizadoEm: null,
      desatualizada: true,
      fonte: null,
    };
  }

  const idadeMs =
    Date.now() -
    tabela.atualizadoEm.getTime();

  const umDiaMs =
    24 * 60 * 60 * 1000;

  return {
    success: true,
    classificacoes:
      tabela.classificacoes
        .filter(
          (item) =>
            item.permiteNfe !== false
        )
        .map((item) => ({
          cst: item.cst,
          codigo: item.codigo,
          descricao: item.descricao,
          tipoAliquota:
            item.tipoAliquota,
          reducaoIbs:
            item.reducaoIbs,
          reducaoCbs:
            item.reducaoCbs,
          tributacaoRegular:
            item.tributacaoRegular,
        })),
    atualizadoEm:
      tabela.atualizadoEm.toISOString(),
    desatualizada:
      idadeMs > umDiaMs,
    fonte: tabela.fonte,
  };
}

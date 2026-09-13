"use server";

import { revalidatePath } from "next/cache";
import { PrivilegioEmpresa } from "@prisma/client";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import {
  extrairClassificacoesRtc,
  salvarTabelaClassTribRtc,
} from "@/lib/fiscal/classificacao-tributaria-rtc";
import { consultarClassTribSvrs } from "@/lib/fiscal/consultar-class-trib-svrs";

export type SincronizarClassificacoesRtcResult =
  | {
      success: true;
      quantidade: number;
      atualizadoEm: string;
    }
  | {
      success: false;
      message: string;
    };

export async function sincronizarClassificacoesRtc(
  empresaId: string
): Promise<SincronizarClassificacoesRtcResult> {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CONFIGURACOES_EDITAR
  );

  try {
    const payload =
      await consultarClassTribSvrs(
        empresaId
      );

    const classificacoes =
      extrairClassificacoesRtc(
        payload
      );

    if (classificacoes.length === 0) {
      return {
        success: false,
        message:
          "A SVRS respondeu à consulta, mas nenhuma classificação tributária pôde ser identificada.",
      };
    }

    const atualizadoEm =
      await salvarTabelaClassTribRtc(
        payload,
        "IT 2025.002 v1.60"
      );

    revalidatePath(
      `/empresa/${empresaId}/produtos`
    );

    revalidatePath(
      `/empresa/${empresaId}/configuracoes`
    );

    return {
      success: true,
      quantidade:
        classificacoes.length,
      atualizadoEm:
        atualizadoEm.toISOString(),
    };
  } catch (error) {
    console.error(
      "Erro ao sincronizar tabela RTC:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a tabela oficial da Reforma Tributária.",
    };
  }
}

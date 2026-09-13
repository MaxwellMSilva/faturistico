"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function getConfiguracaoFiscal(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR,
    {
      exigirEmpresaAtiva: false,
    }
  );

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: { empresaId },
    });

  if (!configuracao) {
    return null;
  }

  return {
    id: configuracao.id,
    ambiente: configuracao.ambiente,
    regimeTributario:
      configuracao.regimeTributario,
    serieNfe: configuracao.serieNfe,
    serieNfce: configuracao.serieNfce,
    serieCte: configuracao.serieCte,
    rntrc: configuracao.rntrc,
    idCsc: configuracao.idCsc,
    possuiCsc: Boolean(
      configuracao.cscCriptografado
    ),
    possuiTokenNuvemFiscal: Boolean(
      configuracao
        .tokenNuvemFiscalCriptografado
    ),
  };
}

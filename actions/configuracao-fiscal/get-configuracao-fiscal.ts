"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getConfiguracaoFiscal(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId,
      },
    });

  if (!configuracao) {
    return null;
  }

  return {
    id: configuracao.id,

    ambiente:
      configuracao.ambiente,

    regimeTributario:
      configuracao.regimeTributario,

    serieNfe:
      configuracao.serieNfe,

    serieNfce:
      configuracao.serieNfce,

    idCsc:
      configuracao.idCsc,

    possuiCsc: Boolean(
      configuracao.cscCriptografado
    ),

    possuiTokenNuvemFiscal:
      Boolean(
        configuracao
          .tokenNuvemFiscalCriptografado
      ),
  };
}
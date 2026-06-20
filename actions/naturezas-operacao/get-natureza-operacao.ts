"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getNaturezaOperacao(
  empresaId: string,
  naturezaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.naturezaOperacao.findFirst({
    where: {
      id: naturezaId,
      empresaId,
    },

    select: {
      id: true,

      descricao: true,
      codigoInterno: true,
      cfop: true,

      tipoOperacao: true,
      destinoOperacao: true,
      finalidadeNfe: true,

      consumidorFinal: true,
      indicadorPresenca: true,
      indicadorIeDestinatario: true,
      possuiIntermediador: true,

      informacoesComplementaresPadrao:
        true,

      ativo: true,
    },
  });
}

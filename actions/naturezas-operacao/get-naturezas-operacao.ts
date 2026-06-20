"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getNaturezasOperacao(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.naturezaOperacao.findMany({
    where: {
      empresaId,
    },

    select: {
      id: true,
      empresaId: true,

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

      // Mantido enquanto as telas antigas ainda utilizam o booleano.
      contribuinteIcms: true,

      informacoesComplementaresPadrao:
        true,

      ativo: true,

      createdAt: true,
      updatedAt: true,
    },

    orderBy: [
      {
        createdAt: "desc",
      },
      {
        descricao: "asc",
      },
    ],
  });
}

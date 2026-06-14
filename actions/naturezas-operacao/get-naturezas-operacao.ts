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
      cfop: true,

      finalidadeNfe: true,

      consumidorFinal: true,
      contribuinteIcms: true,

      ativo: true,

      createdAt: true,
      updatedAt: true,
    },

    orderBy: [
      {
        ativo: "desc",
      },
      {
        descricao: "asc",
      },
    ],
  });
}
"use server";

import { prisma } from "@/lib/prisma";

type CreateNaturezaOperacaoData = {
  descricao: string;
  cfop: string;

  finalidadeNfe:
    | "NORMAL"
    | "COMPLEMENTAR"
    | "AJUSTE"
    | "DEVOLUCAO";

  consumidorFinal: boolean;

  contribuinteIcms: boolean;
};

export async function createNaturezaOperacao(
  data: CreateNaturezaOperacaoData
) {
  return await prisma.naturezaOperacao.create({
    data: {
      empresaId: "empresa-teste",

      descricao: data.descricao,

      cfop: data.cfop,

      finalidadeNfe: data.finalidadeNfe,

      consumidorFinal: data.consumidorFinal,

      contribuinteIcms: data.contribuinteIcms,

      ativo: true,
    },
  });
}
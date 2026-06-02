"use server";

import { prisma } from "@/lib/prisma";

type UpdateNaturezaOperacaoData = {
  id: string;

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

export async function updateNaturezaOperacao(
  data: UpdateNaturezaOperacaoData
) {
  return await prisma.naturezaOperacao.update({
    where: {
      id: data.id,
    },

    data: {
      descricao: data.descricao,

      cfop: data.cfop,

      finalidadeNfe: data.finalidadeNfe,

      consumidorFinal: data.consumidorFinal,

      contribuinteIcms: data.contribuinteIcms,
    },
  });
}
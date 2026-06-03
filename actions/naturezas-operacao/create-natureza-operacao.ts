"use server";

import { getEmpresaAtual } from "@/lib/get-empresa-atual";
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

const empresa =
  await getEmpresaAtual();

export async function createNaturezaOperacao(
  data: CreateNaturezaOperacaoData
) {
  return await prisma.naturezaOperacao.create({
    data: {
      empresaId: empresa.id,

      descricao: data.descricao,

      cfop: data.cfop,

      finalidadeNfe: data.finalidadeNfe,

      consumidorFinal: data.consumidorFinal,

      contribuinteIcms: data.contribuinteIcms,

      ativo: true,
    },
  });
}
"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  cfopValido,
  normalizarCfop,
} from "@/lib/fiscal/cfop";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type FinalidadeNfe =
  | "NORMAL"
  | "COMPLEMENTAR"
  | "AJUSTE"
  | "DEVOLUCAO";

type UpdateNaturezaOperacaoData = {
  id: string;
  empresaId: string;

  descricao: string;
  cfop: string;

  finalidadeNfe: FinalidadeNfe;

  consumidorFinal: boolean;
  contribuinteIcms: boolean;

  ativo: boolean;
};

type UpdateNaturezaOperacaoResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function updateNaturezaOperacao(
  data: UpdateNaturezaOperacaoData
): Promise<UpdateNaturezaOperacaoResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.NATUREZAS_EDITAR
  );

  const naturezaAtual =
    await prisma.naturezaOperacao.findFirst({
      where: {
        id: data.id,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!naturezaAtual) {
    return {
      success: false,
      message:
        "Natureza de operação não encontrada nesta empresa.",
    };
  }

  const descricao =
    data.descricao.trim();

  const cfop =
    normalizarCfop(data.cfop);

  if (!descricao) {
    return {
      success: false,
      message:
        "Informe a descrição da natureza de operação.",
    };
  }

  if (!cfopValido(cfop)) {
    return {
      success: false,
      message:
        "O CFOP deve possuir 4 ou 6 números.",
    };
  }

  const naturezaDuplicada =
    await prisma.naturezaOperacao.findFirst({
      where: {
        empresaId:
          data.empresaId,

        descricao,
        cfop,

        NOT: {
          id: data.id,
        },
      },

      select: {
        id: true,
      },
    });

  if (naturezaDuplicada) {
    return {
      success: false,
      message:
        "Já existe uma natureza com esta descrição e CFOP.",
    };
  }

  try {
    await prisma.naturezaOperacao.update({
      where: {
        id: data.id,
      },

      data: {
        descricao,
        cfop,

        finalidadeNfe:
          data.finalidadeNfe,

        consumidorFinal:
          data.consumidorFinal,

        contribuinteIcms:
          data.contribuinteIcms,

        ativo:
          data.ativo,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/naturezas-operacao`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao atualizar natureza de operação:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar a natureza de operação.",
    };
  }
}

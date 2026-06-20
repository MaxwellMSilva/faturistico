"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type FinalidadeNfe =
  | "NORMAL"
  | "COMPLEMENTAR"
  | "AJUSTE"
  | "DEVOLUCAO";

type CreateNaturezaOperacaoData = {
  empresaId: string;

  descricao: string;
  cfop: string;

  finalidadeNfe: FinalidadeNfe;

  consumidorFinal: boolean;
  contribuinteIcms: boolean;

  ativo: boolean;
};

type CreateNaturezaOperacaoResult =
  | {
      success: true;
      naturezaId: string;
    }
  | {
      success: false;
      message: string;
    };

export async function createNaturezaOperacao(
  data: CreateNaturezaOperacaoData
): Promise<CreateNaturezaOperacaoResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.NATUREZAS_CRIAR
  );

  const descricao =
    data.descricao.trim();

  const cfop =
    data.cfop.replace(/\D/g, "");

  if (!descricao) {
    return {
      success: false,
      message:
        "Informe a descrição da natureza de operação.",
    };
  }

  if (cfop.length !== 4) {
    return {
      success: false,
      message:
        "O CFOP deve possuir 4 números.",
    };
  }

  const naturezaExistente =
    await prisma.naturezaOperacao.findFirst({
      where: {
        empresaId:
          data.empresaId,

        descricao,
        cfop,
      },

      select: {
        id: true,
      },
    });

  if (naturezaExistente) {
    return {
      success: false,
      message:
        "Esta natureza de operação já está cadastrada.",
    };
  }

  try {
    const natureza =
      await prisma.naturezaOperacao.create({
        data: {
          empresaId:
            data.empresaId,

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

        select: {
          id: true,
        },
      });

    revalidatePath(
      `/empresa/${data.empresaId}/naturezas-operacao`
    );

    return {
      success: true,
      naturezaId: natureza.id,
    };
  } catch (error) {
    console.error(
      "Erro ao criar natureza de operação:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar a natureza de operação.",
    };
  }
}

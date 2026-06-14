"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type DeleteNaturezaOperacaoData = {
  naturezaId: string;
  empresaId: string;
};

type DeleteNaturezaOperacaoResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

function obterCodigoErro(
  error: unknown
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (error as { code?: unknown })
        .code
    );
  }

  return null;
}

export async function deleteNaturezaOperacao({
  naturezaId,
  empresaId,
}: DeleteNaturezaOperacaoData): Promise<DeleteNaturezaOperacaoResult> {
  await validarAcessoEmpresa(
    empresaId
  );

  const natureza =
    await prisma.naturezaOperacao.findFirst({
      where: {
        id: naturezaId,
        empresaId,
      },

      select: {
        id: true,

        _count: {
          select: {
            notasFiscais: true,
          },
        },
      },
    });

  if (!natureza) {
    return {
      success: false,
      message:
        "Natureza de operação não encontrada nesta empresa.",
    };
  }

  if (
    natureza._count.notasFiscais >
    0
  ) {
    return {
      success: false,
      message:
        "Esta natureza possui notas fiscais vinculadas e não pode ser excluída.",
    };
  }

  try {
    await prisma.naturezaOperacao.delete({
      where: {
        id: natureza.id,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/naturezas-operacao`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir natureza de operação:",
      error
    );

    if (
      obterCodigoErro(error) ===
      "P2003"
    ) {
      return {
        success: false,
        message:
          "Esta natureza possui registros vinculados e não pode ser excluída.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível excluir a natureza de operação.",
    };
  }
}
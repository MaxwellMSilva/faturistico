"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

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
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.NATUREZAS_EXCLUIR
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
          "Esta natureza possui notas fiscais vinculadas e não pode ser excluída. Inative a natureza de operação.",
      };
    }

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
          "Esta natureza possui registros vinculados e não pode ser excluída. Inative a natureza de operação.",
      };
    }

    if (error instanceof Error) {
      if (
        error.message ===
        "PRIVILEGIO_NAO_AUTORIZADO"
      ) {
        return {
          success: false,
          message:
            "Você não possui permissão para excluir naturezas de operação.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível excluir naturezas de uma empresa inativa.",
        };
      }

      if (
        error.message ===
        "USUARIO_NAO_AUTENTICADO"
      ) {
        return {
          success: false,
          message:
            "Sua sessão expirou. Entre novamente.",
        };
      }

      if (
        error.message ===
          "USUARIO_INVALIDO_OU_INATIVO" ||
        error.message ===
          "ACESSO_EMPRESA_NAO_AUTORIZADO"
      ) {
        return {
          success: false,
          message:
            "Você não possui acesso a esta empresa.",
        };
      }
    }

    return {
      success: false,
      message:
        "Não foi possível excluir a natureza de operação.",
    };
  }
}

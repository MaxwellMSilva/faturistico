"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type AlterarStatusNaturezaData = {
  empresaId: string;
  naturezaId: string;
  ativo: boolean;
};

type AlterarStatusNaturezaResult =
  | {
      success: true;
      ativo: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function alterarStatusNaturezaOperacao({
  empresaId,
  naturezaId,
  ativo,
}: AlterarStatusNaturezaData): Promise<AlterarStatusNaturezaResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.NATUREZAS_ALTERAR_STATUS
    );

    const natureza =
      await prisma.naturezaOperacao.findFirst({
        where: {
          id: naturezaId,
          empresaId,
        },

        select: {
          id: true,
          ativo: true,
        },
      });

    if (!natureza) {
      return {
        success: false,
        message:
          "Natureza de operação não encontrada nesta empresa.",
      };
    }

    if (natureza.ativo === ativo) {
      return {
        success: true,
        ativo,
        message: ativo
          ? "A natureza de operação já está ativa."
          : "A natureza de operação já está inativa.",
      };
    }

    await prisma.naturezaOperacao.update({
      where: {
        id: natureza.id,
      },

      data: {
        ativo,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/naturezas-operacao`
    );

    return {
      success: true,
      ativo,
      message: ativo
        ? "Natureza de operação ativada com sucesso."
        : "Natureza de operação inativada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status da natureza de operação:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "PRIVILEGIO_NAO_AUTORIZADO"
      ) {
        return {
          success: false,
          message:
            "Você não possui permissão para ativar ou inativar naturezas de operação.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível alterar naturezas de uma empresa inativa.",
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
        "Não foi possível alterar o status da natureza de operação.",
    };
  }
}

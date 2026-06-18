"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type AlterarStatusProdutoData = {
  empresaId: string;
  produtoId: string;
  ativo: boolean;
};

type AlterarStatusProdutoResult =
  | {
      success: true;
      ativo: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function alterarStatusProduto({
  empresaId,
  produtoId,
  ativo,
}: AlterarStatusProdutoData): Promise<AlterarStatusProdutoResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.PRODUTOS_ALTERAR_STATUS
    );

    const produto =
      await prisma.produto.findFirst({
        where: {
          id: produtoId,
          empresaId,
        },

        select: {
          id: true,
          ativo: true,
        },
      });

    if (!produto) {
      return {
        success: false,
        message:
          "Produto não encontrado nesta empresa.",
      };
    }

    if (produto.ativo === ativo) {
      return {
        success: true,
        ativo,
        message: ativo
          ? "O produto já está ativo."
          : "O produto já está inativo.",
      };
    }

    await prisma.produto.update({
      where: {
        id: produto.id,
      },

      data: {
        ativo,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/produtos`
    );

    return {
      success: true,
      ativo,
      message: ativo
        ? "Produto ativado com sucesso."
        : "Produto inativado com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do produto:",
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
            "Você não possui permissão para ativar ou inativar produtos.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível alterar produtos de uma empresa inativa.",
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
        "Não foi possível alterar o status do produto.",
    };
  }
}

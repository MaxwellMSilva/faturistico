"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type DeleteProdutoData = {
  produtoId: string;
  empresaId: string;
};

type DeleteProdutoResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteProduto({
  produtoId,
  empresaId,
}: DeleteProdutoData): Promise<DeleteProdutoResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.PRODUTOS_EXCLUIR
    );

    const produto =
      await prisma.produto.findFirst({
        where: {
          id: produtoId,
          empresaId,
        },

        select: {
          id: true,
        },
      });

    if (!produto) {
      return {
        success: false,
        message:
          "Produto não encontrado nesta empresa.",
      };
    }

    await prisma.produto.delete({
      where: {
        id: produto.id,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/produtos`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir produto:",
      error
    );

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message:
          "Este produto possui documentos vinculados e não pode ser excluído. Inative o produto.",
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
            "Você não possui permissão para excluir produtos.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível excluir produtos de uma empresa inativa.",
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
        "Não foi possível excluir o produto.",
    };
  }
}

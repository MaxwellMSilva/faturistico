"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

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
  await validarAcessoEmpresa(
    empresaId
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

  try {
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
          "Este produto possui documentos vinculados e não pode ser excluído.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível excluir o produto.",
    };
  }
}
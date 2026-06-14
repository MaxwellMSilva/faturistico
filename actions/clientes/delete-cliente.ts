"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type DeleteClienteData = {
  clienteId: string;
  empresaId: string;
};

type DeleteClienteResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteCliente({
  clienteId,
  empresaId,
}: DeleteClienteData): Promise<DeleteClienteResult> {
  await validarAcessoEmpresa(
    empresaId
  );

  const cliente =
    await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!cliente) {
    return {
      success: false,
      message:
        "Cliente não encontrado nesta empresa.",
    };
  }

  try {
    await prisma.cliente.delete({
      where: {
        id: cliente.id,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/clientes`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir cliente:",
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
          "Este cliente possui documentos vinculados e não pode ser excluído.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível excluir o cliente.",
    };
  }
}
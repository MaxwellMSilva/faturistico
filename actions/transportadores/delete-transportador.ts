"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type DeleteTransportadorData = {
  empresaId: string;
  transportadorId: string;
};

type DeleteTransportadorResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteTransportador(
  data: DeleteTransportadorData
): Promise<DeleteTransportadorResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const transportador =
    await prisma.transportador.findFirst({
      where: {
        id:
          data.transportadorId,

        empresaId:
          data.empresaId,
      },

      select: {
        id: true,

        _count: {
          select: {
            veiculos: true,
            motoristas: true,
          },
        },
      },
    });

  if (!transportador) {
    return {
      success: false,
      message:
        "Transportador não encontrado nesta empresa.",
    };
  }

  try {
    await prisma.transportador.delete({
      where: {
        id:
          transportador.id,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/transportadores`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir transportador:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível excluir o transportador.",
    };
  }
}
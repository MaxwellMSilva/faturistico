"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type DeleteMotoristaData = {
  empresaId: string;
  motoristaId: string;
};

type DeleteMotoristaResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteMotorista(
  data: DeleteMotoristaData
): Promise<DeleteMotoristaResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const motorista =
    await prisma.motorista.findFirst({
      where: {
        id:
          data.motoristaId,

        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!motorista) {
    return {
      success: false,
      message:
        "Motorista não encontrado nesta empresa.",
    };
  }

  try {
    await prisma.motorista.delete({
      where: {
        id: motorista.id,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/motoristas`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir motorista:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível excluir o motorista.",
    };
  }
}
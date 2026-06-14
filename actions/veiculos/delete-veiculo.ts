"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type DeleteVeiculoData = {
  empresaId: string;
  veiculoId: string;
};

type DeleteVeiculoResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteVeiculo(
  data: DeleteVeiculoData
): Promise<DeleteVeiculoResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const veiculo =
    await prisma.veiculo.findFirst({
      where: {
        id: data.veiculoId,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!veiculo) {
    return {
      success: false,
      message:
        "Veículo não encontrado nesta empresa.",
    };
  }

  try {
    await prisma.veiculo.delete({
      where: {
        id: veiculo.id,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/veiculos`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir veículo:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível excluir o veículo.",
    };
  }
}
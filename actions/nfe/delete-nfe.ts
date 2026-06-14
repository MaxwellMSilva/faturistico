"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type DeleteNfeData = {
  empresaId: string;
  notaFiscalId: string;
};

type DeleteNfeResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteNfe({
  empresaId,
  notaFiscalId,
}: DeleteNfeData): Promise<DeleteNfeResult> {
  await validarAcessoEmpresa(
    empresaId
  );

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,

        tipoDocumento: "NFE",
      },

      select: {
        id: true,
        numero: true,
        serie: true,
        status: true,
      },
    });

  if (!nota) {
    return {
      success: false,
      message:
        "NF-e não encontrada nesta empresa.",
    };
  }

  if (nota.status !== "RASCUNHO") {
    return {
      success: false,
      message:
        "Somente NF-e em rascunho pode ser excluída.",
    };
  }

  try {
    await prisma.notaFiscal.delete({
      where: {
        id: nota.id,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/nfe`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível excluir o rascunho da NF-e.",
    };
  }
}
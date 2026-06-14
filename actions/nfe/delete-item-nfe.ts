"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import { recalcularTotaisNfe } from "@/lib/fiscal/recalcular-totais-nfe";

type DeleteItemNfeData = {
  empresaId: string;
  notaFiscalId: string;
  itemId: string;
};

type DeleteItemNfeResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteItemNfe(
  data: DeleteItemNfeData
): Promise<DeleteItemNfeResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const item =
    await prisma.itemNotaFiscal.findFirst({
      where: {
        id: data.itemId,

        notaFiscalId:
          data.notaFiscalId,

        notaFiscal: {
          empresaId:
            data.empresaId,

          tipoDocumento: "NFE",

          status: "RASCUNHO",
        },
      },

      select: {
        id: true,
      },
    });

  if (!item) {
    return {
      success: false,
      message:
        "O item não foi encontrado ou a nota não pode mais ser editada.",
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.itemNotaFiscal.delete({
          where: {
            id: item.id,
          },
        });

        await recalcularTotaisNfe({
          tx,

          notaFiscalId:
            data.notaFiscalId,
        });
      }
    );

    revalidatePath(
      `/empresa/${data.empresaId}/nfe`
    );

    revalidatePath(
      `/empresa/${data.empresaId}/nfe/${data.notaFiscalId}`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao remover item:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível remover o item.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

import { recalcularTotaisNfe } from "@/lib/fiscal/recalcular-totais-nfe";

type UpdateDadosNfeData = {
  empresaId: string;
  notaFiscalId: string;

  valorFrete: number;
  valorOutros: number;

  informacoesComplementares?: string;
};

type UpdateDadosNfeResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function updateDadosNfe(
  data: UpdateDadosNfeData
): Promise<UpdateDadosNfeResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.NFE_EDITAR
  );

  if (
    !Number.isFinite(
      data.valorFrete
    ) ||
    data.valorFrete < 0
  ) {
    return {
      success: false,
      message:
        "Informe um valor de frete válido.",
    };
  }

  if (
    !Number.isFinite(
      data.valorOutros
    ) ||
    data.valorOutros < 0
  ) {
    return {
      success: false,
      message:
        "Informe um valor válido para outras despesas.",
    };
  }

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: data.notaFiscalId,

        empresaId:
          data.empresaId,

        tipoDocumento: "NFE",

        status: "RASCUNHO",
      },

      select: {
        id: true,
      },
    });

  if (!nota) {
    return {
      success: false,
      message:
        "A NF-e não foi encontrada ou não pode mais ser editada.",
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.notaFiscal.update({
          where: {
            id: nota.id,
          },

          data: {
            valorFrete:
              new Prisma.Decimal(
                String(
                  data.valorFrete
                )
              ),

            valorOutros:
              new Prisma.Decimal(
                String(
                  data.valorOutros
                )
              ),

            informacoesComplementares:
              data
                .informacoesComplementares
                ?.trim() || null,
          },
        });

        await recalcularTotaisNfe({
          tx,

          notaFiscalId:
            nota.id,
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
      "Erro ao atualizar dados da NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar os dados da NF-e.",
    };
  }
}

"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function deleteCte(
  empresaId: string,
  cteId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_EXCLUIR_RASCUNHO
  );

  const cte =
    await prisma.conhecimentoTransporte.findFirst({
      where: {
        id: cteId,
        empresaId,
      },
      select: {
        id: true,
        status: true,
      },
    });

  if (!cte) {
    return {
      success: false as const,
      message: "CT-e não encontrado.",
    };
  }

  if (cte.status !== "RASCUNHO") {
    return {
      success: false as const,
      message:
        "Somente rascunhos de CT-e podem ser excluídos.",
    };
  }

  try {
    await prisma.conhecimentoTransporte.delete({
      where: { id: cteId },
    });

    revalidatePath(
      `/empresa/${empresaId}/cte`
    );

    return {
      success: true as const,
    };
  } catch (error) {
    console.error(
      "Erro ao excluir CT-e:",
      error
    );

    return {
      success: false as const,
      message:
        "Não foi possível excluir o rascunho do CT-e.",
    };
  }
}

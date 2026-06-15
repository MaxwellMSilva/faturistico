"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { validarCadastroEmpresa } from "@/lib/empresa/validar-cadastro-empresa";

type ToggleStatusEmpresaData = {
  empresaId: string;
  ativo: boolean;
};

type ToggleStatusEmpresaResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function toggleStatusEmpresa(
  data: ToggleStatusEmpresaData
): Promise<ToggleStatusEmpresaResult> {
  /*
   * validarCadastroEmpresa permite
   * somente o OWNER global.
   */

  try {
    await validarCadastroEmpresa();
  } catch {
    return {
      success: false,
      message:
        "Somente o proprietário pode alterar o status das empresas.",
    };
  }

  if (!data.empresaId) {
    return {
      success: false,
      message:
        "Empresa não informada.",
    };
  }

  const empresa =
    await prisma.empresa.findUnique({
      where: {
        id: data.empresaId,
      },

      select: {
        id: true,
        ativo: true,
      },
    });

  if (!empresa) {
    return {
      success: false,
      message:
        "Empresa não encontrada.",
    };
  }

  if (empresa.ativo === data.ativo) {
    return {
      success: true,
    };
  }

  try {
    await prisma.empresa.update({
      where: {
        id: empresa.id,
      },

      data: {
        ativo: data.ativo,
      },
    });

    revalidatePath("/empresas");
    revalidatePath("/painel");

    revalidatePath(
      `/empresa/${empresa.id}`
    );

    revalidatePath(
      `/empresa/${empresa.id}/dashboard`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status da empresa:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível alterar o status da empresa.",
    };
  }
}
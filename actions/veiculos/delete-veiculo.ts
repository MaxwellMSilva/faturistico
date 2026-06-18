"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

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
  try {
    await validarPrivilegioEmpresa(
      data.empresaId,
      PrivilegioEmpresa.VEICULOS_EXCLUIR
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

          _count: {
            select: {
              transportesNfe: true,
            },
          },
        },
      });

    if (!veiculo) {
      return {
        success: false,
        message:
          "Veículo não encontrado nesta empresa.",
      };
    }

    if (
      veiculo._count.transportesNfe >
      0
    ) {
      return {
        success: false,
        message:
          "Este veículo possui documentos vinculados e não pode ser excluído. Inative o veículo.",
      };
    }

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

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message:
          "Este veículo possui registros vinculados e não pode ser excluído. Inative o veículo.",
      };
    }

    if (error instanceof Error) {
      if (
        error.message ===
        "PRIVILEGIO_NAO_AUTORIZADO"
      ) {
        return {
          success: false,
          message:
            "Você não possui permissão para excluir veículos.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível excluir veículos de uma empresa inativa.",
        };
      }

      if (
        error.message ===
        "USUARIO_NAO_AUTENTICADO"
      ) {
        return {
          success: false,
          message:
            "Sua sessão expirou. Entre novamente.",
        };
      }

      if (
        error.message ===
          "USUARIO_INVALIDO_OU_INATIVO" ||
        error.message ===
          "ACESSO_EMPRESA_NAO_AUTORIZADO"
      ) {
        return {
          success: false,
          message:
            "Você não possui acesso a esta empresa.",
        };
      }
    }

    return {
      success: false,
      message:
        "Não foi possível excluir o veículo.",
    };
  }
}

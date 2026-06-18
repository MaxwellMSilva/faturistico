"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

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
  try {
    await validarPrivilegioEmpresa(
      data.empresaId,
      PrivilegioEmpresa.MOTORISTAS_EXCLUIR
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

          _count: {
            select: {
              transportesNfe: true,
            },
          },
        },
      });

    if (!motorista) {
      return {
        success: false,
        message:
          "Motorista não encontrado nesta empresa.",
      };
    }

    if (
      motorista._count
        .transportesNfe > 0
    ) {
      return {
        success: false,
        message:
          "Este motorista possui documentos vinculados e não pode ser excluído. Inative o motorista.",
      };
    }

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

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message:
          "Este motorista possui registros vinculados e não pode ser excluído. Inative o motorista.",
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
            "Você não possui permissão para excluir motoristas.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível excluir motoristas de uma empresa inativa.",
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
        "Não foi possível excluir o motorista.",
    };
  }
}

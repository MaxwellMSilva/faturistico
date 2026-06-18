"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

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
  try {
    await validarPrivilegioEmpresa(
      data.empresaId,
      PrivilegioEmpresa.TRANSPORTADORES_EXCLUIR
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
              transportesNfe: true,
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

    const possuiVinculos =
      transportador._count.veiculos >
        0 ||
      transportador._count.motoristas >
        0 ||
      transportador._count
        .transportesNfe > 0;

    if (possuiVinculos) {
      return {
        success: false,
        message:
          "Este transportador possui veículos, motoristas ou documentos vinculados e não pode ser excluído. Inative o transportador.",
      };
    }

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

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        message:
          "Este transportador possui registros vinculados e não pode ser excluído. Inative o transportador.",
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
            "Você não possui permissão para excluir transportadores.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível excluir transportadores de uma empresa inativa.",
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
        "Não foi possível excluir o transportador.",
    };
  }
}

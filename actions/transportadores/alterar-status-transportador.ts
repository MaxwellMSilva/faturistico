"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type AlterarStatusTransportadorData = {
  empresaId: string;
  transportadorId: string;
  ativo: boolean;
};

type AlterarStatusTransportadorResult =
  | {
      success: true;
      ativo: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function alterarStatusTransportador({
  empresaId,
  transportadorId,
  ativo,
}: AlterarStatusTransportadorData): Promise<AlterarStatusTransportadorResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.TRANSPORTADORES_ALTERAR_STATUS
    );

    const transportador =
      await prisma.transportador.findFirst({
        where: {
          id: transportadorId,
          empresaId,
        },

        select: {
          id: true,
          ativo: true,
        },
      });

    if (!transportador) {
      return {
        success: false,
        message:
          "Transportador não encontrado nesta empresa.",
      };
    }

    if (
      transportador.ativo === ativo
    ) {
      return {
        success: true,
        ativo,
        message: ativo
          ? "O transportador já está ativo."
          : "O transportador já está inativo.",
      };
    }

    await prisma.transportador.update({
      where: {
        id: transportador.id,
      },

      data: {
        ativo,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/transportadores`
    );

    return {
      success: true,
      ativo,
      message: ativo
        ? "Transportador ativado com sucesso."
        : "Transportador inativado com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do transportador:",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "PRIVILEGIO_NAO_AUTORIZADO"
      ) {
        return {
          success: false,
          message:
            "Você não possui permissão para ativar ou inativar transportadores.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível alterar transportadores de uma empresa inativa.",
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
        "Não foi possível alterar o status do transportador.",
    };
  }
}

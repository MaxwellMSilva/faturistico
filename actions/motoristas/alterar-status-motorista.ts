"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type AlterarStatusMotoristaData = {
  empresaId: string;
  motoristaId: string;
  ativo: boolean;
};

type AlterarStatusMotoristaResult =
  | {
      success: true;
      ativo: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function alterarStatusMotorista({
  empresaId,
  motoristaId,
  ativo,
}: AlterarStatusMotoristaData): Promise<AlterarStatusMotoristaResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.MOTORISTAS_ALTERAR_STATUS
    );

    const motorista =
      await prisma.motorista.findFirst({
        where: {
          id: motoristaId,
          empresaId,
        },

        select: {
          id: true,
          ativo: true,
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
      motorista.ativo === ativo
    ) {
      return {
        success: true,
        ativo,
        message: ativo
          ? "O motorista já está ativo."
          : "O motorista já está inativo.",
      };
    }

    await prisma.motorista.update({
      where: {
        id: motorista.id,
      },

      data: {
        ativo,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/motoristas`
    );

    return {
      success: true,
      ativo,
      message: ativo
        ? "Motorista ativado com sucesso."
        : "Motorista inativado com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do motorista:",
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
            "Você não possui permissão para ativar ou inativar motoristas.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível alterar motoristas de uma empresa inativa.",
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
        "Não foi possível alterar o status do motorista.",
    };
  }
}

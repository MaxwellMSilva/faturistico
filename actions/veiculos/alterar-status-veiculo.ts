"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type AlterarStatusVeiculoData = {
  empresaId: string;
  veiculoId: string;
  ativo: boolean;
};

type AlterarStatusVeiculoResult =
  | {
      success: true;
      ativo: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function alterarStatusVeiculo({
  empresaId,
  veiculoId,
  ativo,
}: AlterarStatusVeiculoData): Promise<AlterarStatusVeiculoResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.VEICULOS_ALTERAR_STATUS
    );

    const veiculo =
      await prisma.veiculo.findFirst({
        where: {
          id: veiculoId,
          empresaId,
        },

        select: {
          id: true,
          ativo: true,
        },
      });

    if (!veiculo) {
      return {
        success: false,
        message:
          "Veículo não encontrado nesta empresa.",
      };
    }

    if (veiculo.ativo === ativo) {
      return {
        success: true,
        ativo,
        message: ativo
          ? "O veículo já está ativo."
          : "O veículo já está inativo.",
      };
    }

    await prisma.veiculo.update({
      where: {
        id: veiculo.id,
      },

      data: {
        ativo,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/veiculos`
    );

    return {
      success: true,
      ativo,
      message: ativo
        ? "Veículo ativado com sucesso."
        : "Veículo inativado com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do veículo:",
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
            "Você não possui permissão para ativar ou inativar veículos.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível alterar veículos de uma empresa inativa.",
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
        "Não foi possível alterar o status do veículo.",
    };
  }
}

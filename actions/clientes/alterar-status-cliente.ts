"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type AlterarStatusClienteData = {
  empresaId: string;
  clienteId: string;
  ativo: boolean;
};

type AlterarStatusClienteResult =
  | {
      success: true;
      ativo: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function alterarStatusCliente({
  empresaId,
  clienteId,
  ativo,
}: AlterarStatusClienteData): Promise<AlterarStatusClienteResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.CLIENTES_ALTERAR_STATUS
    );

    const cliente =
      await prisma.cliente.findFirst({
        where: {
          id: clienteId,
          empresaId,
        },

        select: {
          id: true,
          ativo: true,
        },
      });

    if (!cliente) {
      return {
        success: false,
        message:
          "Cliente não encontrado nesta empresa.",
      };
    }

    if (cliente.ativo === ativo) {
      return {
        success: true,
        ativo,
        message: ativo
          ? "O cliente já está ativo."
          : "O cliente já está inativo.",
      };
    }

    await prisma.cliente.update({
      where: {
        id: cliente.id,
      },

      data: {
        ativo,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/clientes`
    );

    return {
      success: true,
      ativo,
      message: ativo
        ? "Cliente ativado com sucesso."
        : "Cliente inativado com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do cliente:",
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
            "Você não possui permissão para ativar ou inativar clientes.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível alterar clientes de uma empresa inativa.",
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
        "Não foi possível alterar o status do cliente.",
    };
  }
}

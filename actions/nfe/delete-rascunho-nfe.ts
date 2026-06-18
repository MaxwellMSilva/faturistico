"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
  StatusNotaFiscal,
  TipoDocumentoFiscal,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

type DeleteRascunhoNfeData = {
  empresaId: string;
  notaFiscalId: string;
};

type DeleteRascunhoNfeResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export async function deleteRascunhoNfe({
  empresaId,
  notaFiscalId,
}: DeleteRascunhoNfeData): Promise<DeleteRascunhoNfeResult> {
  try {
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.NFE_EXCLUIR_RASCUNHO
    );

    const nota =
      await prisma.notaFiscal.findFirst({
        where: {
          id: notaFiscalId,
          empresaId,
          tipoDocumento:
            TipoDocumentoFiscal.NFE,
        },

        select: {
          id: true,
          numero: true,
          serie: true,
          status: true,
        },
      });

    if (!nota) {
      return {
        success: false,
        message:
          "NF-e não encontrada nesta empresa.",
      };
    }

    if (
      nota.status !==
      StatusNotaFiscal.RASCUNHO
    ) {
      return {
        success: false,
        message:
          "Somente NF-e em rascunho podem ser excluídas.",
      };
    }

    /*
     * O status também é colocado no
     * delete para impedir que a nota seja
     * excluída caso mude de situação entre
     * a consulta e a exclusão.
     */

    const resultado =
      await prisma.notaFiscal.deleteMany({
        where: {
          id: nota.id,
          empresaId,
          tipoDocumento:
            TipoDocumentoFiscal.NFE,
          status:
            StatusNotaFiscal.RASCUNHO,
        },
      });

    if (resultado.count !== 1) {
      return {
        success: false,
        message:
          "O status da NF-e foi alterado. Atualize a página e tente novamente.",
      };
    }

    /*
     * Itens, eventos e transporte serão
     * removidos pelo onDelete: Cascade.
     */

    revalidatePath(
      `/empresa/${empresaId}/nfe`
    );

    return {
      success: true,
      message:
        "Rascunho da NF-e excluído com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao excluir rascunho da NF-e:",
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
          "O rascunho possui registros vinculados que impediram a exclusão.",
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
            "Você não possui permissão para excluir rascunhos de NF-e.",
        };
      }

      if (
        error.message ===
        "EMPRESA_INATIVA_SOMENTE_LEITURA"
      ) {
        return {
          success: false,
          message:
            "Não é possível excluir rascunhos de uma empresa inativa.",
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
        "Não foi possível excluir o rascunho da NF-e.",
    };
  }
}

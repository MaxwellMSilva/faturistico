"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";
import { obterProximoNumero } from "@/lib/fiscal/obter-proximo-numero";

type CreateRascunhoNfeData = {
  empresaId: string;

  clienteId: string;

  naturezaOperacaoId: string;

  informacoesComplementares?: string;
};

type CreateRascunhoNfeResult =
  | {
      success: true;
      notaFiscalId: string;
    }
  | {
      success: false;
      message: string;
    };

export async function createRascunhoNfe(
  data: CreateRascunhoNfeData
): Promise<CreateRascunhoNfeResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  if (!data.clienteId) {
    return {
      success: false,
      message:
        "Selecione o cliente.",
    };
  }

  if (!data.naturezaOperacaoId) {
    return {
      success: false,
      message:
        "Selecione a natureza de operação.",
    };
  }

  const [
    cliente,
    natureza,
    configuracao,
  ] = await Promise.all([
    prisma.cliente.findFirst({
      where: {
        id: data.clienteId,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    }),

    prisma.naturezaOperacao.findFirst({
      where: {
        id:
          data.naturezaOperacaoId,

        empresaId:
          data.empresaId,

        ativo: true,
      },

      select: {
        id: true,
      },
    }),

    prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId:
          data.empresaId,
      },

      select: {
        serieNfe: true,
      },
    }),
  ]);

  if (!cliente) {
    return {
      success: false,
      message:
        "Cliente não encontrado nesta empresa.",
    };
  }

  if (!natureza) {
    return {
      success: false,
      message:
        "Natureza de operação inválida.",
    };
  }

  if (!configuracao) {
    return {
      success: false,
      message:
        "Configure os dados fiscais da empresa antes de criar a NF-e.",
    };
  }

  try {
    const nota =
      await prisma.$transaction(
        async (tx) => {
          const numero =
            await obterProximoNumero({
              tx,

              empresaId:
                data.empresaId,

              tipoDocumento:
                "NFE",

              serie:
                configuracao.serieNfe,
            });

          return tx.notaFiscal.create({
            data: {
              empresaId:
                data.empresaId,

              clienteId:
                data.clienteId,

              naturezaOperacaoId:
                data.naturezaOperacaoId,

              tipoDocumento:
                "NFE",

              numero,

              serie:
                configuracao.serieNfe,

              status:
                "RASCUNHO",

              valorProdutos: 0,
              valorFrete: 0,
              valorDesconto: 0,
              valorOutros: 0,
              valorTotal: 0,

              informacoesComplementares:
                data
                  .informacoesComplementares
                  ?.trim() || null,
            },

            select: {
              id: true,
            },
          });
        }
      );

    revalidatePath(
      `/empresa/${data.empresaId}/nfe`
    );

    return {
      success: true,
      notaFiscalId: nota.id,
    };
  } catch (error) {
    console.error(
      "Erro ao criar rascunho da NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível criar o rascunho da NF-e.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { criptografar } from "@/lib/seguranca/criptografia";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type AmbienteFiscal =
  | "HOMOLOGACAO"
  | "PRODUCAO";

type RegimeTributario =
  | "SIMPLES_NACIONAL"
  | "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE"
  | "REGIME_NORMAL";

type UpdateConfiguracaoFiscalData = {
  empresaId: string;

  ambiente: AmbienteFiscal;

  regimeTributario:
    RegimeTributario;

  serieNfe: number;
  serieNfce: number;

  atualizarUltimoNumeroNfe?: boolean;
  ultimoNumeroNfe?: number;

  idCsc?: string;
  csc?: string;

  tokenNuvemFiscal?: string;
};

type UpdateConfiguracaoFiscalResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

function textoOpcional(
  valor?: string
) {
  const texto = valor?.trim();

  return texto || null;
}

export async function updateConfiguracaoFiscal(
  data: UpdateConfiguracaoFiscalData
): Promise<UpdateConfiguracaoFiscalResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.CONFIGURACOES_EDITAR
  );

  if (
    !Number.isInteger(
      data.serieNfe
    ) ||
    data.serieNfe <= 0
  ) {
    return {
      success: false,
      message:
        "A série da NF-e deve ser um número inteiro maior que zero.",
    };
  }

  if (
    !Number.isInteger(
      data.serieNfce
    ) ||
    data.serieNfce <= 0
  ) {
    return {
      success: false,
      message:
        "A série da NFC-e deve ser um número inteiro maior que zero.",
    };
  }

  if (
    data.atualizarUltimoNumeroNfe &&
    (
      !Number.isInteger(
        data.ultimoNumeroNfe
      ) ||
      data.ultimoNumeroNfe === undefined ||
      data.ultimoNumeroNfe < 0 ||
      data.ultimoNumeroNfe > 999_999_999
    )
  ) {
    return {
      success: false,
      message:
        "O último número da NF-e deve estar entre 0 e 999999999.",
    };
  }

  const configuracaoAtual =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId:
          data.empresaId,
      },
    });

  const novoCsc =
    data.csc?.trim();

  const novoToken =
    data.tokenNuvemFiscal?.trim();

  const cscCriptografado =
    novoCsc
      ? criptografar(novoCsc)
      : configuracaoAtual
          ?.cscCriptografado ?? null;

  const tokenNuvemFiscalCriptografado =
    novoToken
      ? criptografar(novoToken)
      : configuracaoAtual
          ?.tokenNuvemFiscalCriptografado ??
        null;

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.configuracaoFiscal.upsert({
          where: {
            empresaId:
              data.empresaId,
          },

          create: {
            empresaId:
              data.empresaId,

            ambiente:
              data.ambiente,

            regimeTributario:
              data.regimeTributario,

            serieNfe:
              data.serieNfe,

            serieNfce:
              data.serieNfce,

            idCsc:
              textoOpcional(
                data.idCsc
              ),

            cscCriptografado:
              novoCsc
                ? cscCriptografado
                : null,

            tokenNuvemFiscalCriptografado:
              novoToken
                ? tokenNuvemFiscalCriptografado
                : null,
          },

          update: {
            ambiente:
              data.ambiente,

            regimeTributario:
              data.regimeTributario,

            serieNfe:
              data.serieNfe,

            serieNfce:
              data.serieNfce,

            idCsc:
              textoOpcional(
                data.idCsc
              ),

            cscCriptografado,

            tokenNuvemFiscalCriptografado,
          },
        });

        if (
          data.atualizarUltimoNumeroNfe
        ) {
          const ultimoNumeroNfe =
            data.ultimoNumeroNfe!;

          const maiorNumeroExistente =
            await tx.notaFiscal.aggregate({
              where: {
                empresaId:
                  data.empresaId,
                tipoDocumento: "NFE",
                serie: data.serieNfe,
              },
              _max: {
                numero: true,
              },
            });

          const maiorNumero =
            maiorNumeroExistente._max
              .numero ?? 0;

          if (
            ultimoNumeroNfe < maiorNumero
          ) {
            throw new Error(
              "ULTIMO_NUMERO_NFE_MENOR_QUE_EXISTENTE"
            );
          }

          await tx.sequenciaFiscal.upsert({
            where: {
              empresaId_tipoDocumento_serie: {
                empresaId:
                  data.empresaId,
                tipoDocumento: "NFE",
                serie: data.serieNfe,
              },
            },
            create: {
              empresaId:
                data.empresaId,
              tipoDocumento: "NFE",
              serie: data.serieNfe,
              ultimoNumero:
                ultimoNumeroNfe,
            },
            update: {
              ultimoNumero:
                ultimoNumeroNfe,
            },
          });
        }
      }
    );

    revalidatePath(
      `/empresa/${data.empresaId}/configuracoes`
    );

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "ULTIMO_NUMERO_NFE_MENOR_QUE_EXISTENTE"
    ) {
      return {
        success: false,
        message:
          "O último número informado é menor que uma NF-e já cadastrada nesta série.",
      };
    }

    console.error(
      "Erro ao salvar configuração fiscal:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível salvar a configuração fiscal.",
    };
  }
}
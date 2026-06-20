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

  try {
    await prisma.configuracaoFiscal.upsert({
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
            ? criptografar(
                novoCsc
              )
            : null,

        tokenNuvemFiscalCriptografado:
          novoToken
            ? criptografar(
                novoToken
              )
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

        cscCriptografado:
          novoCsc
            ? criptografar(
                novoCsc
              )
            : configuracaoAtual
                ?.cscCriptografado,

        tokenNuvemFiscalCriptografado:
          novoToken
            ? criptografar(
                novoToken
              )
            : configuracaoAtual
                ?.tokenNuvemFiscalCriptografado,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/configuracoes`
    );

    return {
      success: true,
    };
  } catch (error) {
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

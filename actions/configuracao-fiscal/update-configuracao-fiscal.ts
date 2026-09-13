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
  regimeTributario: RegimeTributario;
  serieNfe: number;
  serieNfce: number;
  serieCte?: number;
  rntrc?: string;
  idCsc?: string;
  csc?: string;
  tokenNuvemFiscal?: string;
};

type UpdateConfiguracaoFiscalResult =
  | { success: true }
  | { success: false; message: string };

function textoOpcional(
  valor?: string
) {
  const texto = valor?.trim();
  return texto || null;
}

function normalizarRntrc(
  valor?: string
) {
  const texto =
    valor?.trim().toUpperCase() ?? "";

  if (!texto) {
    return null;
  }

  if (texto === "ISENTO") {
    return texto;
  }

  return texto.replace(/\D/g, "");
}

export async function updateConfiguracaoFiscal(
  data: UpdateConfiguracaoFiscalData
): Promise<UpdateConfiguracaoFiscalResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.CONFIGURACOES_EDITAR
  );

  const series = [
    [data.serieNfe, "NF-e"],
    [data.serieNfce, "NFC-e"],
    [data.serieCte ?? 1, "CT-e"],
  ] as const;

  for (const [serie, documento] of series) {
    if (
      !Number.isInteger(serie) ||
      serie <= 0 ||
      serie > 999
    ) {
      return {
        success: false,
        message: `A série da ${documento} deve ser um número inteiro entre 1 e 999.`,
      };
    }
  }

  const rntrc =
    normalizarRntrc(data.rntrc);

  if (
    rntrc &&
    rntrc !== "ISENTO" &&
    rntrc.length !== 8
  ) {
    return {
      success: false,
      message:
        "O RNTRC deve possuir 8 dígitos ou ser informado como ISENTO.",
    };
  }

  const configuracaoAtual =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId: data.empresaId,
      },
    });

  const novoCsc =
    data.csc?.trim();

  const novoToken =
    data.tokenNuvemFiscal?.trim();

  try {
    await prisma.configuracaoFiscal.upsert({
      where: {
        empresaId: data.empresaId,
      },
      create: {
        empresaId: data.empresaId,
        ambiente: data.ambiente,
        regimeTributario:
          data.regimeTributario,
        serieNfe: data.serieNfe,
        serieNfce: data.serieNfce,
        serieCte: data.serieCte ?? 1,
        rntrc,
        idCsc:
          textoOpcional(data.idCsc),
        cscCriptografado:
          novoCsc
            ? criptografar(novoCsc)
            : null,
        tokenNuvemFiscalCriptografado:
          novoToken
            ? criptografar(novoToken)
            : null,
      },
      update: {
        ambiente: data.ambiente,
        regimeTributario:
          data.regimeTributario,
        serieNfe: data.serieNfe,
        serieNfce: data.serieNfce,
        serieCte: data.serieCte ?? 1,
        rntrc,
        idCsc:
          textoOpcional(data.idCsc),
        cscCriptografado:
          novoCsc
            ? criptografar(novoCsc)
            : configuracaoAtual
                ?.cscCriptografado,
        tokenNuvemFiscalCriptografado:
          novoToken
            ? criptografar(novoToken)
            : configuracaoAtual
                ?.tokenNuvemFiscalCriptografado,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/configuracoes`
    );
    revalidatePath(
      `/empresa/${data.empresaId}/cte`
    );

    return { success: true };
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

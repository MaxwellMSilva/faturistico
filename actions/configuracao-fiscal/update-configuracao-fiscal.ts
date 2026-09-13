"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
  TipoDocumentoFiscal,
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
  proximoNumeroNfe: number;

  serieNfce: number;
  proximoNumeroNfce: number;

  serieCte: number;
  proximoNumeroCte: number;

  serieMdfe: number;
  proximoNumeroMdfe: number;

  rntrc?: string;

  idCsc?: string;
  csc?: string;

  tokenNuvemFiscal?: string;
};

type UpdateConfiguracaoFiscalResult =
  | { success: true }
  | { success: false; message: string };

type Numeracao = {
  tipoDocumento: TipoDocumentoFiscal;
  documento: string;
  serie: number;
  proximoNumero: number;
};

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

  const numeracoes: Numeracao[] = [
    {
      tipoDocumento:
        TipoDocumentoFiscal.NFE,
      documento: "NF-e",
      serie: data.serieNfe,
      proximoNumero:
        data.proximoNumeroNfe,
    },
    {
      tipoDocumento:
        TipoDocumentoFiscal.NFCE,
      documento: "NFC-e",
      serie: data.serieNfce,
      proximoNumero:
        data.proximoNumeroNfce,
    },
    {
      tipoDocumento:
        TipoDocumentoFiscal.CTE,
      documento: "CT-e",
      serie: data.serieCte,
      proximoNumero:
        data.proximoNumeroCte,
    },
    {
      tipoDocumento:
        TipoDocumentoFiscal.MDFE,
      documento: "MDF-e",
      serie: data.serieMdfe,
      proximoNumero:
        data.proximoNumeroMdfe,
    },
  ];

  for (const item of numeracoes) {
    if (
      !Number.isInteger(item.serie) ||
      item.serie <= 0 ||
      item.serie > 999
    ) {
      return {
        success: false,
        message: `A série da ${item.documento} deve ser um número inteiro entre 1 e 999.`,
      };
    }

    if (
      !Number.isInteger(
        item.proximoNumero
      ) ||
      item.proximoNumero <= 0 ||
      item.proximoNumero > 999_999_999
    ) {
      return {
        success: false,
        message: `O próximo número da ${item.documento} deve estar entre 1 e 999999999.`,
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

  const [
    configuracaoAtual,
    sequenciasAtuais,
  ] = await Promise.all([
    prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId: data.empresaId,
      },
    }),
    prisma.sequenciaFiscal.findMany({
      where: {
        empresaId: data.empresaId,
        OR: numeracoes.map(
          (item) => ({
            tipoDocumento:
              item.tipoDocumento,
            serie: item.serie,
          })
        ),
      },
      select: {
        tipoDocumento: true,
        serie: true,
        ultimoNumero: true,
      },
    }),
  ]);

  for (const item of numeracoes) {
    const sequencia =
      sequenciasAtuais.find(
        (atual) =>
          atual.tipoDocumento ===
            item.tipoDocumento &&
          atual.serie === item.serie
      );

    if (
      sequencia &&
      item.proximoNumero <=
        sequencia.ultimoNumero
    ) {
      return {
        success: false,
        message:
          `O próximo número da ${item.documento} não pode ser menor ou igual ao último número utilizado (${sequencia.ultimoNumero}).`,
      };
    }
  }

  const novoCsc =
    data.csc?.trim();

  const novoToken =
    data.tokenNuvemFiscal?.trim();

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.configuracaoFiscal.upsert({
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
            serieCte: data.serieCte,
            serieMdfe: data.serieMdfe,
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
            serieCte: data.serieCte,
            serieMdfe: data.serieMdfe,
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

        for (const item of numeracoes) {
          await tx.sequenciaFiscal.upsert({
            where: {
              empresaId_tipoDocumento_serie: {
                empresaId: data.empresaId,
                tipoDocumento:
                  item.tipoDocumento,
                serie: item.serie,
              },
            },
            create: {
              empresaId: data.empresaId,
              tipoDocumento:
                item.tipoDocumento,
              serie: item.serie,
              ultimoNumero:
                item.proximoNumero - 1,
            },
            update: {
              ultimoNumero:
                item.proximoNumero - 1,
            },
          });
        }
      }
    );

    revalidatePath(
      `/empresa/${data.empresaId}/configuracoes`
    );
    revalidatePath(
      `/empresa/${data.empresaId}/nfe`
    );
    revalidatePath(
      `/empresa/${data.empresaId}/cte`
    );
    revalidatePath(
      `/empresa/${data.empresaId}/mdfe`
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

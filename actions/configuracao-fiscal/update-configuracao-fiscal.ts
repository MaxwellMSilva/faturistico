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

type FinalidadeCte =
  | "NORMAL"
  | "COMPLEMENTO"
  | "SUBSTITUICAO";

type TipoEmissaoCte =
  | "NORMAL"
  | "REGIME_ESPECIAL_NFF"
  | "EPEC_SVC"
  | "CONTINGENCIA_FSDA"
  | "SVC_RS"
  | "SVC_SP";

type ModalCte =
  | "RODOVIARIO"
  | "AEREO"
  | "AQUAVIARIO"
  | "FERROVIARIO"
  | "DUTOVIARIO"
  | "MULTIMODAL";

type TipoServicoCte =
  | "NORMAL"
  | "SUBCONTRATACAO"
  | "REDESPACHO"
  | "REDESPACHO_INTERMEDIARIO"
  | "VINCULADO_MULTIMODAL";

type UpdateConfiguracaoFiscalData = {
  empresaId: string;

  ambiente: AmbienteFiscal;

  regimeTributario:
    RegimeTributario;

  serieNfe: number;
  serieNfce: number;

  atualizarUltimoNumeroNfe?: boolean;
  ultimoNumeroNfe?: number;

  modeloCte: number;
  ambienteCte: AmbienteFiscal;
  finalidadeCte: FinalidadeCte;
  tipoEmissaoCte: TipoEmissaoCte;
  modalCte: ModalCte;
  tipoServicoCte: TipoServicoCte;
  serieCte: number;
  numeracaoManualCte: boolean;
  atualizarUltimoNumeroCte?: boolean;
  ultimoNumeroCte?: number;

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

const FINALIDADES_CTE = new Set<FinalidadeCte>([
  "NORMAL",
  "COMPLEMENTO",
  "SUBSTITUICAO",
]);

const TIPOS_EMISSAO_CTE = new Set<TipoEmissaoCte>([
  "NORMAL",
  "REGIME_ESPECIAL_NFF",
  "EPEC_SVC",
  "CONTINGENCIA_FSDA",
  "SVC_RS",
  "SVC_SP",
]);

const MODAIS_CTE = new Set<ModalCte>([
  "RODOVIARIO",
  "AEREO",
  "AQUAVIARIO",
  "FERROVIARIO",
  "DUTOVIARIO",
  "MULTIMODAL",
]);

const TIPOS_SERVICO_CTE = new Set<TipoServicoCte>([
  "NORMAL",
  "SUBCONTRATACAO",
  "REDESPACHO",
  "REDESPACHO_INTERMEDIARIO",
  "VINCULADO_MULTIMODAL",
]);

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

  if (data.modeloCte !== 57) {
    return {
      success: false,
      message:
        "Nesta etapa, os parâmetros de CT-e aceitam somente o modelo 57.",
    };
  }

  if (
    !Number.isInteger(data.serieCte) ||
    data.serieCte < 0 ||
    data.serieCte > 999
  ) {
    return {
      success: false,
      message:
        "A série do CT-e deve estar entre 0 e 999.",
    };
  }

  if (!FINALIDADES_CTE.has(data.finalidadeCte)) {
    return {
      success: false,
      message: "A finalidade do CT-e é inválida.",
    };
  }

  if (!TIPOS_EMISSAO_CTE.has(data.tipoEmissaoCte)) {
    return {
      success: false,
      message: "O tipo de emissão do CT-e é inválido.",
    };
  }

  if (!MODAIS_CTE.has(data.modalCte)) {
    return {
      success: false,
      message: "O modal do CT-e é inválido.",
    };
  }

  if (!TIPOS_SERVICO_CTE.has(data.tipoServicoCte)) {
    return {
      success: false,
      message: "O tipo de serviço do CT-e é inválido.",
    };
  }

  if (
    data.atualizarUltimoNumeroCte &&
    (
      !Number.isInteger(data.ultimoNumeroCte) ||
      data.ultimoNumeroCte === undefined ||
      data.ultimoNumeroCte < 0 ||
      data.ultimoNumeroCte > 999_999_999
    )
  ) {
    return {
      success: false,
      message:
        "O último número do CT-e deve estar entre 0 e 999999999.",
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

  const ultimoNumeroCte =
    data.atualizarUltimoNumeroCte
      ? data.ultimoNumeroCte!
      : configuracaoAtual?.ultimoNumeroCte ?? 0;

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

            modeloCte:
              data.modeloCte,

            ambienteCte:
              data.ambienteCte,

            finalidadeCte:
              data.finalidadeCte,

            tipoEmissaoCte:
              data.tipoEmissaoCte,

            modalCte:
              data.modalCte,

            tipoServicoCte:
              data.tipoServicoCte,

            serieCte:
              data.serieCte,

            ultimoNumeroCte,

            numeracaoManualCte:
              data.numeracaoManualCte,

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

            modeloCte:
              data.modeloCte,

            ambienteCte:
              data.ambienteCte,

            finalidadeCte:
              data.finalidadeCte,

            tipoEmissaoCte:
              data.tipoEmissaoCte,

            modalCte:
              data.modalCte,

            tipoServicoCte:
              data.tipoServicoCte,

            serieCte:
              data.serieCte,

            ultimoNumeroCte,

            numeracaoManualCte:
              data.numeracaoManualCte,

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

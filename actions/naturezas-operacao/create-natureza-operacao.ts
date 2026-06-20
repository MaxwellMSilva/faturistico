"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  cfopValido,
  normalizarCfop,
  obterDestinoOperacaoCfop,
  obterTipoOperacaoCfop,
} from "@/lib/fiscal/cfop";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type FinalidadeNfe =
  | "NORMAL"
  | "COMPLEMENTAR"
  | "AJUSTE"
  | "DEVOLUCAO";

type IndicadorPresenca =
  | "NAO_SE_APLICA"
  | "PRESENCIAL"
  | "INTERNET"
  | "TELEATENDIMENTO"
  | "ENTREGA_DOMICILIO"
  | "FORA_ESTABELECIMENTO"
  | "OUTROS";

type IndicadorIeDestinatario =
  | "CONTRIBUINTE"
  | "CONTRIBUINTE_ISENTO"
  | "NAO_CONTRIBUINTE";

type CreateNaturezaOperacaoData = {
  empresaId: string;

  descricao: string;
  codigoInterno?: string;
  cfop: string;

  finalidadeNfe: FinalidadeNfe;

  consumidorFinal: boolean;
  indicadorPresenca: IndicadorPresenca;
  indicadorIeDestinatario: IndicadorIeDestinatario;
  possuiIntermediador: boolean;

  informacoesComplementaresPadrao?: string;

  ativo: boolean;
};

type CreateNaturezaOperacaoResult =
  | {
      success: true;
      naturezaId: string;
    }
  | {
      success: false;
      message: string;
    };

const indicadoresPresencaValidos =
  new Set<IndicadorPresenca>([
    "NAO_SE_APLICA",
    "PRESENCIAL",
    "INTERNET",
    "TELEATENDIMENTO",
    "ENTREGA_DOMICILIO",
    "FORA_ESTABELECIMENTO",
    "OUTROS",
  ]);

const indicadoresIeValidos =
  new Set<IndicadorIeDestinatario>([
    "CONTRIBUINTE",
    "CONTRIBUINTE_ISENTO",
    "NAO_CONTRIBUINTE",
  ]);

export async function createNaturezaOperacao(
  data: CreateNaturezaOperacaoData
): Promise<CreateNaturezaOperacaoResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.NATUREZAS_CRIAR
  );

  const descricao =
    data.descricao.trim();

  const codigoInterno =
    data.codigoInterno?.trim() || null;

  const cfop =
    normalizarCfop(data.cfop);

  const informacoesComplementaresPadrao =
    data.informacoesComplementaresPadrao
      ?.trim() || null;

  if (!descricao) {
    return {
      success: false,
      message:
        "Informe a descrição da natureza de operação.",
    };
  }

  if (descricao.length > 60) {
    return {
      success: false,
      message:
        "A descrição da natureza deve possuir no máximo 60 caracteres.",
    };
  }

  if (
    codigoInterno &&
    codigoInterno.length > 20
  ) {
    return {
      success: false,
      message:
        "O código interno deve possuir no máximo 20 caracteres.",
    };
  }

  if (!cfopValido(cfop)) {
    return {
      success: false,
      message:
        "Informe um CFOP fiscal válido com 4 números.",
    };
  }

  if (
    !indicadoresPresencaValidos.has(
      data.indicadorPresenca
    )
  ) {
    return {
      success: false,
      message:
        "O indicador de presença informado é inválido.",
    };
  }

  if (
    !indicadoresIeValidos.has(
      data.indicadorIeDestinatario
    )
  ) {
    return {
      success: false,
      message:
        "O indicador de inscrição estadual do destinatário é inválido.",
    };
  }

  if (
    data.possuiIntermediador &&
    data.indicadorPresenca ===
      "NAO_SE_APLICA"
  ) {
    return {
      success: false,
      message:
        "Selecione uma forma de presença quando houver intermediador da operação.",
    };
  }

  const tipoOperacao =
    obterTipoOperacaoCfop(cfop);

  const destinoOperacao =
    obterDestinoOperacaoCfop(cfop);

  if (
    !tipoOperacao ||
    !destinoOperacao
  ) {
    return {
      success: false,
      message:
        "Não foi possível identificar o tipo e o destino da operação pelo CFOP.",
    };
  }

  const naturezaExistente =
    await prisma.naturezaOperacao.findFirst({
      where: {
        empresaId:
          data.empresaId,

        OR: [
          {
            descricao,
            cfop,
          },
          ...(codigoInterno
            ? [
                {
                  codigoInterno,
                },
              ]
            : []),
        ],
      },

      select: {
        id: true,
        codigoInterno: true,
      },
    });

  if (naturezaExistente) {
    return {
      success: false,
      message:
        naturezaExistente.codigoInterno ===
        codigoInterno
          ? "Já existe uma natureza com este código interno."
          : "Esta natureza de operação já está cadastrada.",
    };
  }

  try {
    const natureza =
      await prisma.naturezaOperacao.create({
        data: {
          empresaId:
            data.empresaId,

          descricao,
          codigoInterno,
          cfop,

          tipoOperacao,
          destinoOperacao,

          finalidadeNfe:
            data.finalidadeNfe,

          consumidorFinal:
            data.consumidorFinal,

          indicadorPresenca:
            data.indicadorPresenca,

          indicadorIeDestinatario:
            data.indicadorIeDestinatario,

          possuiIntermediador:
            data.possuiIntermediador,

          contribuinteIcms:
            data.indicadorIeDestinatario ===
            "CONTRIBUINTE",

          informacoesComplementaresPadrao,

          ativo:
            data.ativo,
        },
        select: {
          id: true,
        },
      });

    revalidatePath(
      `/empresa/${data.empresaId}/naturezas-operacao`
    );

    return {
      success: true,
      naturezaId: natureza.id,
    };
  } catch (error) {
    console.error(
      "Erro ao criar natureza de operação:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar a natureza de operação.",
    };
  }
}

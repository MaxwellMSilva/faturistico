"use server";

import { revalidatePath } from "next/cache";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

import {
  normalizarIbsCbsProduto,
} from "@/lib/fiscal/normalizar-ibs-cbs-produto";

type CreateProdutoData = {
  empresaId: string;

  codigo: string;
  descricao: string;

  tipo: "PRODUTO" | "SERVICO";

  unidade: string;

  ean?: string;
  ncm?: string;
  cest?: string;
  cfopPadrao?: string;

  valorUnitario: number;

  origemMercadoria?: number;

  cstIcms?: string;
  csosnIcms?: string;

  modalidadeBcIcms?: number;
  reducaoBcIcms?: number;
  aliquotaIcms?: number;

  cstPis?: string;
  aliquotaPis?: number;

  cstCofins?: string;
  aliquotaCofins?: number;

  cstIpi?: string;

  codigoEnquadramentoIpi?: string;

  aliquotaIpi?: number;

  // IBS e CBS

  cstIbsCbs?: string;

  classificacaoTributariaIbsCbs?: string;

  aliquotaIbsUf?: number;
  aliquotaIbsMun?: number;
  aliquotaCbs?: number;
};

type CreateProdutoResult =
  | {
      success: true;
      produtoId: string;
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

function somenteNumeros(
  valor?: string
) {
  return valor?.replace(/\D/g, "") ?? "";
}

function validarPercentual(
  valor: number | undefined,
  nome: string
) {
  if (valor === undefined) {
    return null;
  }

  if (
    !Number.isFinite(valor) ||
    valor < 0 ||
    valor > 100
  ) {
    return `${nome} deve estar entre 0 e 100.`;
  }

  return null;
}

export async function createProduto(
  data: CreateProdutoData
): Promise<CreateProdutoResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.PRODUTOS_CRIAR
  );

  const codigo =
    data.codigo.trim();

  const descricao =
    data.descricao.trim();

  const unidade =
    data.unidade
      .trim()
      .toUpperCase();

  if (!codigo) {
    return {
      success: false,
      message:
        "Informe o código do produto.",
    };
  }

  if (!descricao) {
    return {
      success: false,
      message:
        "Informe a descrição do produto.",
    };
  }

  if (!unidade) {
    return {
      success: false,
      message:
        "Informe a unidade do produto.",
    };
  }

  if (
    !Number.isFinite(
      data.valorUnitario
    ) ||
    data.valorUnitario < 0
  ) {
    return {
      success: false,
      message:
        "Informe um valor unitário válido.",
    };
  }

  const ean =
    somenteNumeros(data.ean);

  const ncm =
    somenteNumeros(data.ncm);

  const cest =
    somenteNumeros(data.cest);

  const cfop =
    somenteNumeros(
      data.cfopPadrao
    );

  if (
    data.tipo === "PRODUTO" &&
    ncm &&
    ncm.length !== 8
  ) {
    return {
      success: false,
      message:
        "O NCM deve possuir 8 números.",
    };
  }

  if (
    cest &&
    cest.length !== 7
  ) {
    return {
      success: false,
      message:
        "O CEST deve possuir 7 números.",
    };
  }

  if (
    cfop &&
    cfop.length !== 4
  ) {
    return {
      success: false,
      message:
        "O CFOP deve possuir 4 números.",
    };
  }

  const origemMercadoria =
    data.origemMercadoria ?? 0;

  if (
    !Number.isInteger(
      origemMercadoria
    ) ||
    origemMercadoria < 0 ||
    origemMercadoria > 8
  ) {
    return {
      success: false,
      message:
        "A origem da mercadoria deve estar entre 0 e 8.",
    };
  }

  const erroPercentual = [
    validarPercentual(
      data.reducaoBcIcms,
      "A redução da base do ICMS"
    ),

    validarPercentual(
      data.aliquotaIcms,
      "A alíquota do ICMS"
    ),

    validarPercentual(
      data.aliquotaPis,
      "A alíquota do PIS"
    ),

    validarPercentual(
      data.aliquotaCofins,
      "A alíquota da COFINS"
    ),

    validarPercentual(
      data.aliquotaIpi,
      "A alíquota do IPI"
    ),
  ].find(
    (erro): erro is string =>
      Boolean(erro)
  );

  if (erroPercentual) {
    return {
      success: false,
      message: erroPercentual,
    };
  }

  let dadosIbsCbs: ReturnType<
    typeof normalizarIbsCbsProduto
  >;

  try {
    dadosIbsCbs =
      normalizarIbsCbsProduto({
        cstIbsCbs:
          data.cstIbsCbs,

        classificacaoTributariaIbsCbs:
          data
            .classificacaoTributariaIbsCbs,

        aliquotaIbsUf:
          data.aliquotaIbsUf,

        aliquotaIbsMun:
          data.aliquotaIbsMun,

        aliquotaCbs:
          data.aliquotaCbs,
      });
  } catch (error) {
    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Os dados de IBS/CBS são inválidos.",
    };
  }

  const produtoExistente =
    await prisma.produto.findFirst({
      where: {
        empresaId:
          data.empresaId,

        codigo,
      },

      select: {
        id: true,
      },
    });

  if (produtoExistente) {
    return {
      success: false,
      message:
        "Já existe um produto com este código nesta empresa.",
    };
  }

  try {
    const produto =
      await prisma.produto.create({
        data: {
          empresaId:
            data.empresaId,

          codigo,
          descricao,

          tipo:
            data.tipo,

          unidade,

          ean:
            textoOpcional(ean),

          ncm:
            textoOpcional(ncm),

          cest:
            textoOpcional(cest),

          cfopPadrao:
            textoOpcional(cfop),

          valorUnitario:
            data.valorUnitario,

          origemMercadoria,

          // ICMS

          cstIcms:
            textoOpcional(
              somenteNumeros(
                data.cstIcms
              )
            ),

          csosnIcms:
            textoOpcional(
              somenteNumeros(
                data.csosnIcms
              )
            ),

          modalidadeBcIcms:
            data.modalidadeBcIcms ??
            3,

          reducaoBcIcms:
            data.reducaoBcIcms ??
            0,

          aliquotaIcms:
            data.aliquotaIcms ??
            0,

          // PIS

          cstPis:
            textoOpcional(
              somenteNumeros(
                data.cstPis
              )
            ),

          aliquotaPis:
            data.aliquotaPis ??
            0,

          // COFINS

          cstCofins:
            textoOpcional(
              somenteNumeros(
                data.cstCofins
              )
            ),

          aliquotaCofins:
            data.aliquotaCofins ??
            0,

          // IPI

          cstIpi:
            textoOpcional(
              somenteNumeros(
                data.cstIpi
              )
            ),

          codigoEnquadramentoIpi:
            textoOpcional(
              somenteNumeros(
                data
                  .codigoEnquadramentoIpi
              )
            ) ?? "999",

          aliquotaIpi:
            data.aliquotaIpi ??
            0,

          // IBS e CBS

          cstIbsCbs:
            dadosIbsCbs
              .cstIbsCbs,

          classificacaoTributariaIbsCbs:
            dadosIbsCbs
              .classificacaoTributariaIbsCbs,

          aliquotaIbsUf:
            dadosIbsCbs
              .aliquotaIbsUf,

          aliquotaIbsMun:
            dadosIbsCbs
              .aliquotaIbsMun,

          aliquotaCbs:
            dadosIbsCbs
              .aliquotaCbs,
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      `/empresa/${data.empresaId}/produtos`
    );

    return {
      success: true,
      produtoId:
        produto.id,
    };
  } catch (error) {
    console.error(
      "Erro ao criar produto:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o produto.",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import {
  normalizarIbsCbsProduto,
} from "@/lib/fiscal/normalizar-ibs-cbs-produto";

type UpdateProdutoData = {
  id: string;
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

type UpdateProdutoResult =
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

export async function updateProduto(
  data: UpdateProdutoData
): Promise<UpdateProdutoResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const produtoAtual =
    await prisma.produto.findFirst({
      where: {
        id: data.id,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!produtoAtual) {
    return {
      success: false,
      message:
        "Produto não encontrado nesta empresa.",
    };
  }

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

  const modalidadeBcIcms =
    data.modalidadeBcIcms ?? 3;

  if (
    !Number.isInteger(
      modalidadeBcIcms
    ) ||
    modalidadeBcIcms < 0 ||
    modalidadeBcIcms > 3
  ) {
    return {
      success: false,
      message:
        "A modalidade da base de cálculo do ICMS é inválida.",
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

  const produtoDuplicado =
    await prisma.produto.findFirst({
      where: {
        empresaId:
          data.empresaId,

        codigo,

        NOT: {
          id: data.id,
        },
      },

      select: {
        id: true,
      },
    });

  if (produtoDuplicado) {
    return {
      success: false,
      message:
        "Já existe outro produto com este código nesta empresa.",
    };
  }

  try {
    await prisma.produto.update({
      where: {
        id: data.id,
      },

      data: {
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

        modalidadeBcIcms,

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
    });

    revalidatePath(
      `/empresa/${data.empresaId}/produtos`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao atualizar produto:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o produto.",
    };
  }
}
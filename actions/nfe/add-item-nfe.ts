"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import { calcularTributosItem } from "@/lib/fiscal/calcular-tributos-item";

import { recalcularTotaisNfe } from "@/lib/fiscal/recalcular-totais-nfe";

type AddItemNfeData = {
  empresaId: string;
  notaFiscalId: string;

  produtoId: string;

  quantidade: number;
  valorUnitario: number;
  valorDesconto?: number;
};

type AddItemNfeResult =
  | {
      success: true;
      itemId: string;
    }
  | {
      success: false;
      message: string;
    };

export async function addItemNfe(
  data: AddItemNfeData
): Promise<AddItemNfeResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  if (
    !Number.isFinite(
      data.quantidade
    ) ||
    data.quantidade <= 0
  ) {
    return {
      success: false,
      message:
        "Informe uma quantidade válida.",
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

  const descontoInformado =
    data.valorDesconto ?? 0;

  if (
    !Number.isFinite(
      descontoInformado
    ) ||
    descontoInformado < 0
  ) {
    return {
      success: false,
      message:
        "Informe um desconto válido.",
    };
  }

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: data.notaFiscalId,

        empresaId:
          data.empresaId,

        tipoDocumento: "NFE",

        status: "RASCUNHO",
      },

      select: {
        id: true,

        naturezaOperacao: {
          select: {
            cfop: true,
          },
        },
      },
    });

  if (!nota) {
    return {
      success: false,
      message:
        "A NF-e não foi encontrada ou não pode mais ser editada.",
    };
  }

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId:
          data.empresaId,
      },

      select: {
        regimeTributario: true,
      },
    });

  if (!configuracao) {
    return {
      success: false,
      message:
        "Configure o regime tributário da empresa antes de adicionar itens.",
    };
  }

  const produto =
    await prisma.produto.findFirst({
      where: {
        id: data.produtoId,

        empresaId:
          data.empresaId,

        ativo: true,
      },

      select: {
        id: true,

        tipo: true,

        codigo: true,
        descricao: true,
        unidade: true,

        ean: true,
        ncm: true,
        cest: true,

        cfopPadrao: true,

        origemMercadoria: true,

        // ICMS

        cstIcms: true,
        csosnIcms: true,

        modalidadeBcIcms: true,
        reducaoBcIcms: true,
        aliquotaIcms: true,

        // PIS

        cstPis: true,
        aliquotaPis: true,

        // COFINS

        cstCofins: true,
        aliquotaCofins: true,

        // IPI

        cstIpi: true,

        codigoEnquadramentoIpi:
          true,

        aliquotaIpi: true,

        // IBS e CBS

        cstIbsCbs: true,

        classificacaoTributariaIbsCbs:
          true,

        aliquotaIbsUf: true,
        aliquotaIbsMun: true,
        aliquotaCbs: true,
      },
    });

  if (!produto) {
    return {
      success: false,
      message:
        "Produto não encontrado nesta empresa.",
    };
  }

  if (
    produto.tipo === "SERVICO"
  ) {
    return {
      success: false,
      message:
        "O cadastro atual da NF-e aceita apenas produtos. Serviços serão tratados no módulo de NFS-e.",
    };
  }

  const ncm =
    produto.ncm?.replace(
      /\D/g,
      ""
    ) ?? "";

  if (ncm.length !== 8) {
    return {
      success: false,
      message:
        `O produto "${produto.descricao}" não possui um NCM válido com 8 números.`,
    };
  }

  const cfop =
    (
      produto.cfopPadrao ??
      nota.naturezaOperacao?.cfop ??
      ""
    ).replace(/\D/g, "");

  if (cfop.length !== 4) {
    return {
      success: false,
      message:
        `O produto "${produto.descricao}" não possui um CFOP válido.`,
    };
  }

  const origemMercadoria =
    produto.origemMercadoria ?? 0;

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
        `A origem da mercadoria do produto "${produto.descricao}" é inválida.`,
    };
  }

  const quantidade =
    new Prisma.Decimal(
      String(data.quantidade)
    );

  const valorUnitario =
    new Prisma.Decimal(
      String(data.valorUnitario)
    );

  const valorDesconto =
    new Prisma.Decimal(
      String(descontoInformado)
    );

  let tributos: ReturnType<
    typeof calcularTributosItem
  >;

  try {
    tributos =
      calcularTributosItem({
        regimeTributario:
          configuracao.regimeTributario,

        quantidade,
        valorUnitario,
        valorDesconto,

        // ICMS

        cstIcms:
          produto.cstIcms,

        csosnIcms:
          produto.csosnIcms,

        reducaoBcIcms:
          produto.reducaoBcIcms,

        aliquotaIcms:
          produto.aliquotaIcms,

        // PIS

        cstPis:
          produto.cstPis,

        aliquotaPis:
          produto.aliquotaPis,

        // COFINS

        cstCofins:
          produto.cstCofins,

        aliquotaCofins:
          produto.aliquotaCofins,

        // IPI

        cstIpi:
          produto.cstIpi,

        codigoEnquadramentoIpi:
          produto
            .codigoEnquadramentoIpi,

        aliquotaIpi:
          produto.aliquotaIpi,

        // IBS e CBS

        cstIbsCbs:
          produto.cstIbsCbs,

        classificacaoTributariaIbsCbs:
          produto
            .classificacaoTributariaIbsCbs,

        aliquotaIbsUf:
          produto.aliquotaIbsUf,

        aliquotaIbsMun:
          produto.aliquotaIbsMun,

        aliquotaCbs:
          produto.aliquotaCbs,
      });
  } catch (error) {
    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Os dados tributários do produto são inválidos.",
    };
  }

  try {
    const item =
      await prisma.$transaction(
        async (tx) => {
          const novoItem =
            await tx.itemNotaFiscal.create({
              data: {
                notaFiscalId:
                  nota.id,

                produtoId:
                  produto.id,

                // Dados comerciais

                codigoProduto:
                  produto.codigo,

                descricao:
                  produto.descricao,

                unidade:
                  produto.unidade,

                ean:
                  produto.ean?.trim() ||
                  null,

                ncm,

                cest:
                  produto.cest?.trim() ||
                  null,

                cfop,

                quantidade,

                valorUnitario,

                valorBruto:
                  tributos.valorBruto,

                valorDesconto,

                valorTotal:
                  tributos.valorLiquido,

                // ICMS

                origemMercadoria,

                cstIcms:
                  tributos.cstIcms,

                csosnIcms:
                  tributos.csosnIcms,

                modalidadeBcIcms:
                  produto
                    .modalidadeBcIcms ??
                  3,

                reducaoBcIcms:
                  tributos
                    .reducaoBcIcms,

                baseCalculoIcms:
                  tributos
                    .baseCalculoIcms,

                aliquotaIcms:
                  tributos
                    .aliquotaIcms,

                valorIcms:
                  tributos.valorIcms,

                // PIS

                cstPis:
                  tributos.cstPis,

                baseCalculoPis:
                  tributos
                    .baseCalculoPis,

                aliquotaPis:
                  tributos
                    .aliquotaPis,

                valorPis:
                  tributos.valorPis,

                // COFINS

                cstCofins:
                  tributos.cstCofins,

                baseCalculoCofins:
                  tributos
                    .baseCalculoCofins,

                aliquotaCofins:
                  tributos
                    .aliquotaCofins,

                valorCofins:
                  tributos.valorCofins,

                // IPI

                cstIpi:
                  tributos.cstIpi,

                codigoEnquadramentoIpi:
                  tributos
                    .codigoEnquadramentoIpi,

                baseCalculoIpi:
                  tributos
                    .baseCalculoIpi,

                aliquotaIpi:
                  tributos
                    .aliquotaIpi,

                valorIpi:
                  tributos.valorIpi,

                // IBS e CBS

                cstIbsCbs:
                  tributos.cstIbsCbs,

                classificacaoTributariaIbsCbs:
                  tributos
                    .classificacaoTributariaIbsCbs,

                baseCalculoIbsCbs:
                  tributos
                    .baseCalculoIbsCbs,

                aliquotaIbsUf:
                  tributos
                    .aliquotaIbsUf,

                valorIbsUf:
                  tributos.valorIbsUf,

                aliquotaIbsMun:
                  tributos
                    .aliquotaIbsMun,

                valorIbsMun:
                  tributos
                    .valorIbsMun,

                valorIbs:
                  tributos.valorIbs,

                aliquotaCbs:
                  tributos.aliquotaCbs,

                valorCbs:
                  tributos.valorCbs,
              },

              select: {
                id: true,
              },
            });

          await recalcularTotaisNfe({
            tx,

            notaFiscalId:
              nota.id,
          });

          return novoItem;
        }
      );

    revalidatePath(
      `/empresa/${data.empresaId}/nfe`
    );

    revalidatePath(
      `/empresa/${data.empresaId}/nfe/${data.notaFiscalId}`
    );

    return {
      success: true,
      itemId: item.id,
    };
  } catch (error) {
    console.error(
      "Erro ao adicionar item à NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível adicionar o item à NF-e.",
    };
  }
}
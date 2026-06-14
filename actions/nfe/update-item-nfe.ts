"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

import { calcularTributosItem } from "@/lib/fiscal/calcular-tributos-item";

import { recalcularTotaisNfe } from "@/lib/fiscal/recalcular-totais-nfe";

type UpdateItemNfeData = {
  empresaId: string;
  notaFiscalId: string;
  itemId: string;

  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
};

type UpdateItemNfeResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function updateItemNfe(
  data: UpdateItemNfeData
): Promise<UpdateItemNfeResult> {
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

  if (
    !Number.isFinite(
      data.valorDesconto
    ) ||
    data.valorDesconto < 0
  ) {
    return {
      success: false,
      message:
        "Informe um desconto válido.",
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
        "Configure o regime tributário da empresa.",
    };
  }

  const item =
    await prisma.itemNotaFiscal.findFirst({
      where: {
        id: data.itemId,

        notaFiscalId:
          data.notaFiscalId,

        notaFiscal: {
          empresaId:
            data.empresaId,

          tipoDocumento:
            "NFE",

          status:
            "RASCUNHO",
        },
      },

      select: {
        id: true,

        cstIcms: true,
        csosnIcms: true,

        reducaoBcIcms: true,
        aliquotaIcms: true,

        cstPis: true,
        aliquotaPis: true,

        cstCofins: true,
        aliquotaCofins: true,

        cstIpi: true,

        codigoEnquadramentoIpi:
          true,

        aliquotaIpi: true,

        cstIbsCbs: true,

        classificacaoTributariaIbsCbs:
          true,

        aliquotaIbsUf: true,
        aliquotaIbsMun: true,
        aliquotaCbs: true,
      },
    });

  if (!item) {
    return {
      success: false,
      message:
        "O item não foi encontrado ou a NF-e não pode mais ser editada.",
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
      String(data.valorDesconto)
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
          item.cstIcms,

        csosnIcms:
          item.csosnIcms,

        reducaoBcIcms:
          item.reducaoBcIcms,

        aliquotaIcms:
          item.aliquotaIcms,

        // PIS

        cstPis:
          item.cstPis,

        aliquotaPis:
          item.aliquotaPis,

        // COFINS

        cstCofins:
          item.cstCofins,

        aliquotaCofins:
          item.aliquotaCofins,

        // IPI

        cstIpi:
          item.cstIpi,

        codigoEnquadramentoIpi:
          item
            .codigoEnquadramentoIpi,

        aliquotaIpi:
          item.aliquotaIpi,

        // IBS e CBS

        cstIbsCbs:
          item.cstIbsCbs,

        classificacaoTributariaIbsCbs:
          item
            .classificacaoTributariaIbsCbs,

        aliquotaIbsUf:
          item.aliquotaIbsUf,

        aliquotaIbsMun:
          item.aliquotaIbsMun,

        aliquotaCbs:
          item.aliquotaCbs,
      });
  } catch (error) {
    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Não foi possível recalcular os tributos do item.",
    };
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.itemNotaFiscal.update({
          where: {
            id: item.id,
          },

          data: {
            quantidade,
            valorUnitario,
            valorDesconto,

            valorBruto:
              tributos.valorBruto,

            valorTotal:
              tributos.valorLiquido,

            // ICMS

            cstIcms:
              tributos.cstIcms,

            csosnIcms:
              tributos.csosnIcms,

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
              tributos.valorIbsMun,

            valorIbs:
              tributos.valorIbs,

            aliquotaCbs:
              tributos.aliquotaCbs,

            valorCbs:
              tributos.valorCbs,
          },
        });

        await recalcularTotaisNfe({
          tx,

          notaFiscalId:
            data.notaFiscalId,
        });
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
    };
  } catch (error) {
    console.error(
      "Erro ao atualizar item da NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o item da NF-e.",
    };
  }
}
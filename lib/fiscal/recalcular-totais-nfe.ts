import { Prisma } from "@prisma/client";

type RecalcularTotaisParams = {
  tx: Prisma.TransactionClient;
  notaFiscalId: string;
};

export async function recalcularTotaisNfe({
  tx,
  notaFiscalId,
}: RecalcularTotaisParams) {
  const nota =
    await tx.notaFiscal.findUnique({
      where: {
        id: notaFiscalId,
      },

      select: {
        valorFrete: true,
        valorOutros: true,
      },
    });

  if (!nota) {
    throw new Error(
      "Nota fiscal não encontrada."
    );
  }

  const totais =
    await tx.itemNotaFiscal.aggregate({
      where: {
        notaFiscalId,
      },

      _sum: {
        valorBruto: true,
        valorDesconto: true,
        valorTotal: true,

        baseCalculoIcms: true,
        valorIcms: true,

        valorPis: true,
        valorCofins: true,

        valorIpi: true,
      },
    });

  const zero =
    new Prisma.Decimal(0);

  const valorProdutos =
    totais._sum.valorBruto ??
    zero;

  const valorDesconto =
    totais._sum.valorDesconto ??
    zero;

  const valorLiquidoItens =
    totais._sum.valorTotal ??
    zero;

  const valorBaseIcms =
    totais._sum.baseCalculoIcms ??
    zero;

  const valorIcms =
    totais._sum.valorIcms ??
    zero;

  const valorPis =
    totais._sum.valorPis ??
    zero;

  const valorCofins =
    totais._sum.valorCofins ??
    zero;

  const valorIpi =
    totais._sum.valorIpi ??
    zero;

  const valorTotal =
    valorLiquidoItens
      .plus(nota.valorFrete)
      .plus(nota.valorOutros)
      .plus(valorIpi)
      .toDecimalPlaces(2);

  await tx.notaFiscal.update({
    where: {
      id: notaFiscalId,
    },

    data: {
      valorProdutos:
        valorProdutos.toDecimalPlaces(
          2
        ),

      valorDesconto:
        valorDesconto.toDecimalPlaces(
          2
        ),

      valorBaseIcms:
        valorBaseIcms.toDecimalPlaces(
          2
        ),

      valorIcms:
        valorIcms.toDecimalPlaces(2),

      valorPis:
        valorPis.toDecimalPlaces(2),

      valorCofins:
        valorCofins.toDecimalPlaces(
          2
        ),

      valorIpi:
        valorIpi.toDecimalPlaces(2),

      valorTotal,
    },
  });
}
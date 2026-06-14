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
        // Valores comerciais

        valorBruto: true,
        valorDesconto: true,
        valorTotal: true,

        // ICMS

        baseCalculoIcms: true,
        valorIcms: true,

        // PIS e COFINS

        valorPis: true,
        valorCofins: true,

        // IPI

        valorIpi: true,

        // IBS e CBS

        baseCalculoIbsCbs: true,

        valorIbsUf: true,
        valorIbsMun: true,

        valorCbs: true,
      },
    });

  const zero =
    new Prisma.Decimal(0);

  /*
   * Valores comerciais
   */

  const valorProdutos =
    totais._sum.valorBruto ??
    zero;

  const valorDesconto =
    totais._sum.valorDesconto ??
    zero;

  const valorLiquidoItens =
    totais._sum.valorTotal ??
    zero;

  /*
   * ICMS
   */

  const valorBaseIcms =
    totais._sum.baseCalculoIcms ??
    zero;

  const valorIcms =
    totais._sum.valorIcms ??
    zero;

  /*
   * PIS e COFINS
   */

  const valorPis =
    totais._sum.valorPis ??
    zero;

  const valorCofins =
    totais._sum.valorCofins ??
    zero;

  /*
   * IPI
   */

  const valorIpi =
    totais._sum.valorIpi ??
    zero;

  /*
   * IBS e CBS
   */

  const valorBaseIbsCbs =
    totais._sum.baseCalculoIbsCbs ??
    zero;

  const valorIbsUf =
    totais._sum.valorIbsUf ??
    zero;

  const valorIbsMun =
    totais._sum.valorIbsMun ??
    zero;

  const valorIbs =
    valorIbsUf
      .plus(valorIbsMun)
      .toDecimalPlaces(2);

  const valorCbs =
    totais._sum.valorCbs ??
    zero;

  /*
   * Total comercial atual da NF-e
   *
   * Nesta etapa, IBS e CBS ficam
   * destacados separadamente.
   */

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
      // Valores comerciais

      valorProdutos:
        valorProdutos.toDecimalPlaces(
          2
        ),

      valorDesconto:
        valorDesconto.toDecimalPlaces(
          2
        ),

      // ICMS

      valorBaseIcms:
        valorBaseIcms.toDecimalPlaces(
          2
        ),

      valorIcms:
        valorIcms.toDecimalPlaces(2),

      // PIS e COFINS

      valorPis:
        valorPis.toDecimalPlaces(2),

      valorCofins:
        valorCofins.toDecimalPlaces(
          2
        ),

      // IPI

      valorIpi:
        valorIpi.toDecimalPlaces(2),

      // IBS e CBS

      valorBaseIbsCbs:
        valorBaseIbsCbs.toDecimalPlaces(
          2
        ),

      valorIbsUf:
        valorIbsUf.toDecimalPlaces(2),

      valorIbsMun:
        valorIbsMun.toDecimalPlaces(2),

      valorIbs,

      valorCbs:
        valorCbs.toDecimalPlaces(2),

      // Total da nota

      valorTotal,
    },
  });
}
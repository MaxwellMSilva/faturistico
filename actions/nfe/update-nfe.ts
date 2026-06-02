"use server";

import { prisma } from "@/lib/prisma";

type ItemData = {
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
};

type UpdateNfeData = {
  id: string;
  clienteId: string;
  naturezaOperacaoId?: string;
  informacoesComplementares?: string;
  itens: ItemData[];
};

export async function updateNfe(
  data: UpdateNfeData
) {
  const valorTotal =
    data.itens.reduce(
      (acc, item) =>
        acc +
        item.quantidade *
          item.valorUnitario,
      0
    );

  await prisma.itemNotaFiscal.deleteMany({
    where: {
      notaFiscalId: data.id,
    },
  });

  return await prisma.notaFiscal.update({
    where: {
      id: data.id,
    },

    data: {
      clienteId: data.clienteId,

      naturezaOperacaoId:
        data.naturezaOperacaoId,

      informacoesComplementares:
        data.informacoesComplementares,

      valorTotal,

      itens: {
        create: data.itens.map(
          (item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            valorUnitario:
              item.valorUnitario,
            valorTotal:
              item.quantidade *
              item.valorUnitario,
          })
        ),
      },
    },
  });
}
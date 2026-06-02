"use server";

import { prisma } from "@/lib/prisma";

type ItemData = {
  produtoId: string;
  quantidade: number;
  valorUnitario: number;
};

type CreateNfeData = {
  clienteId: string;
  naturezaOperacaoId: string;
  itens: ItemData[];
};

export async function createNfe(
  data: CreateNfeData
) {
  const ultimaNota =
    await prisma.notaFiscal.findFirst({
      orderBy: {
        numero: "desc",
      },
    });

  const proximoNumero =
    (ultimaNota?.numero ?? 0) + 1;

  const valorTotal =
    data.itens.reduce(
      (acc, item) =>
        acc +
        item.quantidade *
          item.valorUnitario,
      0
    );

  return await prisma.notaFiscal.create({
    data: {
      empresaId: "empresa-teste",

      clienteId: data.clienteId,

      naturezaOperacaoId:
        data.naturezaOperacaoId,

      numero: proximoNumero,

      serie: 1,

      valorTotal,

      itens: {
        create: data.itens.map(
          (item) => ({
            produtoId: item.produtoId,

            quantidade:
              item.quantidade,

            valorUnitario:
              item.valorUnitario,

            valorTotal:
              item.quantidade *
              item.valorUnitario,
          })
        ),
      },
    },

    include: {
      itens: true,
    },
  });
}
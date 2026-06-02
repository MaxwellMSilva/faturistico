"use server";

import { prisma } from "@/lib/prisma";

export async function getNfe(id: string) {
  const nota = await prisma.notaFiscal.findUnique({
    where: {
      id,
    },

    include: {
      empresa: true,
      cliente: true,
      naturezaOperacao: true,

      itens: {
        include: {
          produto: true,
        },
      },
    },
  });

  if (!nota) {
    return null;
  }

  return {
    ...nota,

    valorTotal: Number(nota.valorTotal),

    itens: nota.itens.map((item) => ({
      ...item,

      quantidade: Number(item.quantidade),

      valorUnitario: Number(
        item.valorUnitario
      ),

      valorTotal: Number(
        item.valorTotal
      ),
    })),
  };
}
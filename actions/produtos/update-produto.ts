"use server";

import { prisma } from "@/lib/prisma";

type UpdateProdutoData = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: "PRODUTO" | "SERVICO";
  unidade: string;
  ncm?: string;
  cfopPadrao?: string;
  valorUnitario: number;
};

export async function updateProduto(
  data: UpdateProdutoData
) {
  return await prisma.produto.update({
    where: {
      id: data.id,
    },

    data: {
      codigo: data.codigo,
      descricao: data.descricao,
      tipo: data.tipo,
      unidade: data.unidade,
      ncm: data.ncm,
      cfopPadrao: data.cfopPadrao,
      valorUnitario: data.valorUnitario,
    },
  });
}
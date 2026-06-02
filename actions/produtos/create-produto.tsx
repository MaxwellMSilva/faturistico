"use server";

import { prisma } from "@/lib/prisma";

type CreateProdutoData = {
  codigo: string;
  descricao: string;
  tipo: "PRODUTO" | "SERVICO";
  unidade: string;
  ncm?: string;
  cfopPadrao?: string;
  valorUnitario: number;
};

export async function createProduto(
  data: CreateProdutoData
) {
  return await prisma.produto.create({
    data: {
      empresaId: "empresa-teste",

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
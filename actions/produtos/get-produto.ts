"use server";

import { prisma } from "@/lib/prisma";

export async function getProdutos() {
  const produtos = await prisma.produto.findMany({
    orderBy: {
      descricao: "asc",
    },
  });

  return JSON.parse(JSON.stringify(produtos));
}
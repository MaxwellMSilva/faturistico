"use server";

import { prisma } from "@/lib/prisma";

export async function getNaturezasOperacao() {
  return await prisma.naturezaOperacao.findMany({
    orderBy: {
      descricao: "asc",
    },
  });
}
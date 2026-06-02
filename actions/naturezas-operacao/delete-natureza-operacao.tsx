"use server";

import { prisma } from "@/lib/prisma";

export async function deleteNaturezaOperacao(
  id: string
) {
  await prisma.naturezaOperacao.delete({
    where: {
      id,
    },
  });
}
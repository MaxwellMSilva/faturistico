"use server";

import { prisma } from "@/lib/prisma";

export async function deleteProduto(
  id: string
) {
  await prisma.produto.delete({
    where: {
      id,
    },
  });
}
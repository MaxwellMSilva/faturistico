"use server";

import { prisma } from "@/lib/prisma";

export async function getEmpresas(
  usuarioId: string
) {
  return prisma.empresa.findMany({
    where: {
      usuarioId,
    },

    orderBy: {
      razaoSocial: "asc",
    },
  });
}
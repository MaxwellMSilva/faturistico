"use server";

import { prisma } from "@/lib/prisma";

export async function getModulos() {
  return prisma.modulo.findMany({
    where: {
      ativo: true,
    },
    orderBy: {
      nome: "asc",
    },
  });
}
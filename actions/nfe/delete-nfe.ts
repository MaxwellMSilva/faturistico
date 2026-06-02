"use server";

import { prisma } from "@/lib/prisma";

export async function deleteNfe(id: string) {
  await prisma.itemNotaFiscal.deleteMany({
    where: {
      notaFiscalId: id,
    },
  });

  await prisma.notaFiscal.delete({
    where: {
      id,
    },
  });
}
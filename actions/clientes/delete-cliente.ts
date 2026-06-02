"use server";

import { prisma } from "@/lib/prisma";

export async function deleteCliente(id: string) {
  await prisma.cliente.delete({
    where: {
      id,
    },
  });
}
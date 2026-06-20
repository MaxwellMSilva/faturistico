"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getClientes(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.cliente.findMany({
    where: {
      empresaId,
    },

    orderBy: [
      {
        createdAt: "desc",
      },
      {
        nome: "asc",
      },
    ],
  });
}

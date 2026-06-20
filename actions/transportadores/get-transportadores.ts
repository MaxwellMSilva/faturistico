"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getTransportadores(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.transportador.findMany({
    where: {
      empresaId,
    },

    include: {
      _count: {
        select: {
          veiculos: true,
          motoristas: true,
        },
      },
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

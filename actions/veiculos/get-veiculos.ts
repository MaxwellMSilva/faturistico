"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getVeiculos(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.veiculo.findMany({
    where: {
      empresaId,
    },

    include: {
      transportador: {
        select: {
          id: true,
          nome: true,
          cpfCnpj: true,
          ativo: true,
        },
      },
    },

    orderBy: [
      {
        ativo: "desc",
      },
      {
        placa: "asc",
      },
    ],
  });
}
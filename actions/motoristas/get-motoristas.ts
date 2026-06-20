"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getMotoristas(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.motorista.findMany({
    where: {
      empresaId,
    },

    include: {
      transportador: {
        select: {
          id: true,
          nome: true,
          nomeFantasia: true,
          cpfCnpj: true,
          ativo: true,
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

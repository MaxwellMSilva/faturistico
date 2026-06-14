"use server";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getProdutos(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  return prisma.produto.findMany({
    where: {
      empresaId,
    },

    orderBy: {
      descricao: "asc",
    },
  });
}
"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getDadosVeiculo(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const transportadores =
    await prisma.transportador.findMany({
      where: {
        empresaId,
        ativo: true,
      },

      select: {
        id: true,
        nome: true,
        nomeFantasia: true,
        cpfCnpj: true,
        tipoPessoa: true,
      },

      orderBy: {
        nome: "asc",
      },
    });

  return {
    transportadores,
  };
}
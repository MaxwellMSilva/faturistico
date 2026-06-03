"use server";

import { prisma } from "@/lib/prisma";

type CreateEmpresaData = {
  usuarioId: string;

  razaoSocial: string;
  nomeFantasia?: string;

  cnpj: string;

  email?: string;
  telefone?: string;
};

export async function createEmpresa(
  data: CreateEmpresaData
) {
  const empresaExistente =
    await prisma.empresa.findUnique({
      where: {
        cnpj: data.cnpj,
      },
    });

  if (empresaExistente) {
    throw new Error(
      "Já existe uma empresa com este CNPJ."
    );
  }

  const empresa =
    await prisma.empresa.create({
      data: {
        usuarioId: data.usuarioId,

        razaoSocial:
          data.razaoSocial,

        nomeFantasia:
          data.nomeFantasia,

        cnpj: data.cnpj,

        email: data.email,

        telefone: data.telefone,
      },
    });

  return {
    ...empresa,
  };
}
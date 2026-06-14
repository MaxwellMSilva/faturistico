"use server";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getDadosNovaNfe(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const [
    clientes,
    naturezas,
    configuracao,
  ] = await Promise.all([
    prisma.cliente.findMany({
      where: {
        empresaId,
        ativo: true,
      },

      select: {
        id: true,
        nome: true,
        cpfCnpj: true,
      },

      orderBy: {
        nome: "asc",
      },
    }),

    prisma.naturezaOperacao.findMany({
      where: {
        empresaId,
        ativo: true,
      },

      select: {
        id: true,
        descricao: true,
        cfop: true,
      },

      orderBy: {
        descricao: "asc",
      },
    }),

    prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId,
      },

      select: {
        serieNfe: true,
      },
    }),
  ]);

  return {
    clientes,
    naturezas,

    serieNfe:
      configuracao?.serieNfe ?? 1,
  };
}
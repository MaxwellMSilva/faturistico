"use server";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getNotasFiscais(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const notas =
    await prisma.notaFiscal.findMany({
      where: {
        empresaId,
        tipoDocumento: "NFE",
      },

      include: {
        cliente: {
          select: {
            nome: true,
            cpfCnpj: true,
          },
        },

        naturezaOperacao: {
          select: {
            descricao: true,
          },
        },

        _count: {
          select: {
            itens: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return notas.map((nota) => ({
    id: nota.id,

    numero: nota.numero,
    serie: nota.serie,

    status: nota.status,

    clienteNome:
      nota.cliente.nome,

    clienteDocumento:
      nota.cliente.cpfCnpj,

    naturezaOperacao:
      nota.naturezaOperacao
        ?.descricao ?? null,

    quantidadeItens:
      nota._count.itens,

    valorTotal:
      Number(nota.valorTotal),

    dataEmissao:
      nota.dataEmissao.toISOString(),

    createdAt:
      nota.createdAt.toISOString(),
  }));
}
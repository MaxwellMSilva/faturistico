"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CreateProdutoData = {
  codigo: string;
  descricao: string;
  tipo: "PRODUTO" | "SERVICO";
  unidade: string;
  ncm?: string;
  cfopPadrao?: string;
  valorUnitario: number;
};

export async function createProduto(
  data: CreateProdutoData
) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const empresa =
    await prisma.empresa.findFirst({
      where: {
        usuarioId:
          session.user.id,
      },
    });

  if (!empresa) {
    throw new Error(
      "Nenhuma empresa cadastrada."
    );
  }

  return await prisma.produto.create({
    data: {
      empresaId: empresa.id,

      codigo: data.codigo,
      descricao: data.descricao,

      tipo: data.tipo,

      unidade: data.unidade,

      ncm: data.ncm,

      cfopPadrao:
        data.cfopPadrao,

      valorUnitario:
        data.valorUnitario,
    },
  });
}
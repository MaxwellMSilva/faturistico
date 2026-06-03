"use server";

import { prisma } from "@/lib/prisma";

type CreateAssinaturaData = {
  usuarioId: string;
  moduloIds: string[];
};

export async function createAssinatura(
  data: CreateAssinaturaData
) {
  const modulos =
    await prisma.modulo.findMany({
      where: {
        id: {
          in: data.moduloIds,
        },
      },
    });

  if (modulos.length === 0) {
    throw new Error(
      "Nenhum módulo selecionado."
    );
  }

  const valorMensal =
    modulos.reduce(
      (acc, modulo) =>
        acc + Number(modulo.valor),
      0
    );

  const assinaturaExistente =
    await prisma.assinatura.findFirst({
      where: {
        usuarioId:
          data.usuarioId,
      },
    });

  if (assinaturaExistente) {
    throw new Error(
      "Usuário já possui uma assinatura."
    );
  }

  return prisma.assinatura.create({
    data: {
      usuarioId:
        data.usuarioId,

      status: "ATIVA",

      valorMensal,

      modulos: {
        create: modulos.map(
          (modulo) => ({
            moduloId: modulo.id,
          })
        ),
      },
    },
  });
}
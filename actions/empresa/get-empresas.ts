"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getEmpresas() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const vinculos =
    await prisma.usuarioEmpresa.findMany({
      where: {
        usuarioId:
          session.user.id,

        ativo: true,
      },

      select: {
        permissao: true,
        createdAt: true,

        empresa: {
          select: {
            id: true,

            razaoSocial: true,
            nomeFantasia: true,

            cnpj: true,

            municipio: true,
            uf: true,

            ativo: true,

            createdAt: true,
            updatedAt: true,
          },
        },
      },

      orderBy: [
        {
          empresa: {
            createdAt: "desc",
          },
        },
        {
          empresa: {
            razaoSocial: "asc",
          },
        },
      ],
    });

  return vinculos
    .filter(
      (vinculo) =>
        vinculo.empresa.ativo
    )
    .map((vinculo) => ({
      ...vinculo.empresa,

      permissao:
        vinculo.permissao,
    }))
}

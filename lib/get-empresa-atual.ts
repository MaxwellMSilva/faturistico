import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getEmpresaAtual() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const acesso =
    await prisma.usuarioEmpresa.findFirst({
      where: {
        usuarioId:
          session.user.id,

        ativo: true,

        empresa: {
          ativo: true,
        },
      },

      include: {
        empresa: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  if (!acesso) {
    throw new Error(
      "Empresa não encontrada."
    );
  }

  return acesso.empresa;
}

import { getServerSession }
  from "next-auth";

import { authOptions }
  from "@/lib/auth";

import { prisma }
  from "@/lib/prisma";

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

  const empresa =
    await prisma.empresa.findFirst({
      where: {
        usuarioId:
          session.user.id,
      },
    });

  if (!empresa) {
    throw new Error(
      "Empresa não encontrada."
    );
  }

  return empresa;
}
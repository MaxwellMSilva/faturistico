import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function validarAcessoEmpresa(
  empresaId: string
) {
  const session = await getServerSession(
    authOptions
  );

  if (!session?.user?.id) {
    throw new Error(
      "Usuário não autenticado."
    );
  }

  const acesso =
    await prisma.usuarioEmpresa.findUnique({
      where: {
        usuarioId_empresaId: {
          usuarioId: session.user.id,
          empresaId,
        },
      },

      include: {
        empresa: true,
      },
    });

  if (!acesso || !acesso.ativo) {
    throw new Error(
      "Você não possui acesso a esta empresa."
    );
  }

  if (!acesso.empresa.ativo) {
    throw new Error(
      "Esta empresa está inativa."
    );
  }

  return {
    usuarioId: session.user.id,
    acesso,
    empresa: acesso.empresa,
  };
}
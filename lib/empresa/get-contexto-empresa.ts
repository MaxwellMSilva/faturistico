import {
  notFound,
  redirect,
} from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getContextoEmpresa(
  empresaId: string
) {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  const acesso =
    await prisma.usuarioEmpresa.findUnique({
      where: {
        usuarioId_empresaId: {
          usuarioId:
            session.user.id,

          empresaId,
        },
      },

      include: {
        empresa: true,
      },
    });

  if (
    !acesso ||
    !acesso.ativo ||
    !acesso.empresa.ativo
  ) {
    notFound();
  }

  return {
    session,
    acesso,
    empresa: acesso.empresa,
  };
}
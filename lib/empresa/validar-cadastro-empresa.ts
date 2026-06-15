import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function validarCadastroEmpresa() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    throw new Error(
      "USUARIO_NAO_AUTENTICADO"
    );
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        id: session.user.id,
      },

      select: {
        id: true,
        role: true,
        ativo: true,
      },
    });

  if (!usuario || !usuario.ativo) {
    throw new Error(
      "USUARIO_INVALIDO"
    );
  }

  if (usuario.role !== "OWNER") {
    throw new Error(
      "CADASTRO_EMPRESA_NAO_AUTORIZADO"
    );
  }

  return usuario;
}
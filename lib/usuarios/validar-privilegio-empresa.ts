import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function validarAcessoEmpresa(
  empresaId: string
) {
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
        nome: true,
        email: true,
        role: true,
        ativo: true,
      },
    });

  if (
    !usuario ||
    !usuario.ativo
  ) {
    throw new Error(
      "USUARIO_INVALIDO_OU_INATIVO"
    );
  }

  const empresa =
    await prisma.empresa.findUnique({
      where: {
        id: empresaId,
      },

      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        ativo: true,
      },
    });

  if (!empresa) {
    throw new Error(
      "EMPRESA_NAO_ENCONTRADA"
    );
  }

  const acesso =
    await prisma.usuarioEmpresa.findUnique({
      where: {
        usuarioId_empresaId: {
          usuarioId:
            usuario.id,

          empresaId,
        },
      },

      select: {
        id: true,
        usuarioId: true,
        empresaId: true,

        permissao: true,
        ativo: true,

        privilegios: {
          select: {
            privilegio: true,
          },
        },
      },
    });

  /*
   * O OWNER global pode acessar todas
   * as empresas, inclusive inativas.
   *
   * Empresa inativa será somente leitura.
   */

  if (
    usuario.role === "OWNER"
  ) {
    return {
      usuario,
      empresa,
      acesso,

      somenteLeitura:
        !empresa.ativo,
    };
  }

  /*
   * Demais usuários não podem acessar
   * empresas inativas.
   */

  if (!empresa.ativo) {
    throw new Error(
      "EMPRESA_INATIVA"
    );
  }

  if (
    !acesso ||
    !acesso.ativo
  ) {
    throw new Error(
      "ACESSO_EMPRESA_NAO_AUTORIZADO"
    );
  }

  return {
    usuario,
    empresa,
    acesso,

    somenteLeitura: false,
  };
}
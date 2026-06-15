import {
  getServerSession,
} from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UsuarioGestor = {
  id: string;
  nome: string;
  email: string;

  role:
    | "OWNER"
    | "ADMIN";
};

export async function validarGestaoUsuarios(): Promise<UsuarioGestor> {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    throw new Error(
      "Usuário não autenticado."
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

  if (!usuario) {
    throw new Error(
      "Usuário não encontrado."
    );
  }

  if (!usuario.ativo) {
    throw new Error(
      "Este usuário está inativo."
    );
  }

  if (
    usuario.role !== "OWNER" &&
    usuario.role !== "ADMIN"
  ) {
    throw new Error(
      "Você não possui permissão para gerenciar usuários."
    );
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  };
}
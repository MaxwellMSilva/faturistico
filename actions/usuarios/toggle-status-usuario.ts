"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarGestaoUsuarios } from "@/lib/usuarios/validar-gestao-usuarios";

type ToggleStatusUsuarioData = {
  usuarioId: string;
  ativo: boolean;
};

type ToggleStatusUsuarioResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function toggleStatusUsuario(
  data: ToggleStatusUsuarioData
): Promise<ToggleStatusUsuarioResult> {
  let gestor: Awaited<
    ReturnType<
      typeof validarGestaoUsuarios
    >
  >;

  try {
    gestor =
      await validarGestaoUsuarios();
  } catch {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar usuários.",
    };
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        id: data.usuarioId,
      },

      select: {
        id: true,
        role: true,
        ativo: true,
      },
    });

  if (!usuario) {
    return {
      success: false,
      message:
        "Usuário não encontrado.",
    };
  }

  if (
    usuario.id === gestor.id
  ) {
    return {
      success: false,
      message:
        "Você não pode inativar a própria conta.",
    };
  }

  if (
    usuario.role === "OWNER"
  ) {
    return {
      success: false,
      message:
        "O proprietário não pode ser inativado.",
    };
  }

  if (
    gestor.role === "ADMIN" &&
    usuario.role !== "USUARIO"
  ) {
    return {
      success: false,
      message:
        "Administradores podem alterar apenas usuários comuns.",
    };
  }

  try {
    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },

      data: {
        ativo: data.ativo,
      },
    });

    revalidatePath(
      "/usuarios"
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao alterar status do usuário:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível alterar o status do usuário.",
    };
  }
}
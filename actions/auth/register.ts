"use server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

type RegisterData = {
  nome: string;
  email: string;
  senha: string;
};

type RegisterResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function register(
  data: RegisterData
): Promise<RegisterResult> {
  const nome = data.nome.trim();

  const email = data.email
    .trim()
    .toLowerCase();

  const senha = data.senha;

  if (!nome || !email || !senha) {
    return {
      success: false,
      message:
        "Preencha todos os campos.",
    };
  }

  if (senha.length < 6) {
    return {
      success: false,
      message:
        "A senha deve possuir pelo menos 6 caracteres.",
    };
  }

  const usuarioExistente =
    await prisma.usuario.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

  if (usuarioExistente) {
    return {
      success: false,
      message:
        "Este e-mail já está cadastrado.",
    };
  }

  const senhaHash = await hash(
    senha,
    10
  );

  try {
    await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao cadastrar usuário:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o usuário.",
    };
  }
}
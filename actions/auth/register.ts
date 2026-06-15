"use server";

import { hash } from "bcryptjs";

import {
  Prisma,
} from "@prisma/client";

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

function emailValido(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function register(
  data: RegisterData
): Promise<RegisterResult> {
  const nome =
    data.nome.trim();

  const email =
    data.email
      .trim()
      .toLowerCase();

  const senha =
    data.senha;

  if (
    !nome ||
    !email ||
    !senha
  ) {
    return {
      success: false,
      message:
        "Preencha todos os campos.",
    };
  }

  if (!emailValido(email)) {
    return {
      success: false,
      message:
        "Informe um e-mail válido.",
    };
  }

  if (senha.length < 6) {
    return {
      success: false,
      message:
        "A senha deve possuir pelo menos 6 caracteres.",
    };
  }

  const senhaHash =
    await hash(
      senha,
      10
    );

  try {
    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const ownerExistente =
            await tx.usuario.findFirst({
              where: {
                role: "OWNER",
              },

              select: {
                id: true,
              },
            });

          if (ownerExistente) {
            return {
              success: false as const,

              message:
                "O cadastro público está encerrado. Novos usuários devem ser cadastrados por um administrador.",
            };
          }

          const usuarioExistente =
            await tx.usuario.findUnique({
              where: {
                email,
              },

              select: {
                id: true,
              },
            });

          if (usuarioExistente) {
            return {
              success: false as const,

              message:
                "Este e-mail já está cadastrado.",
            };
          }

          await tx.usuario.create({
            data: {
              nome,
              email,
              senhaHash,

              role: "OWNER",

              ativo: true,
            },
          });

          return {
            success: true as const,
          };
        }
      );

    return resultado;
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message:
          "Este e-mail já está cadastrado.",
      };
    }

    console.error(
      "Erro ao cadastrar proprietário:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível realizar o cadastro.",
    };
  }
}
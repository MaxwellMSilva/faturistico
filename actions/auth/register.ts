"use server";

import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

type RegisterData = {
  nome: string;
  email: string;
  senha: string;
};

export async function register(
  data: RegisterData
) {
  const existe =
    await prisma.usuario.findUnique({
      where: {
        email: data.email,
      },
    });

  if (existe) {
    throw new Error(
      "E-mail já cadastrado."
    );
  }

  const senhaHash = await hash(
    data.senha,
    10
  );

  return prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      senhaHash,
    },
  });
}
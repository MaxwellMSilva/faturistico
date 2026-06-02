"use server";

import { prisma } from "@/lib/prisma";

type CreateClienteData = {
  nome: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
};

export async function createCliente(
  data: CreateClienteData
) {
  return await prisma.cliente.create({
    data: {
      empresaId: "empresa-teste",

      tipoPessoa: "JURIDICA",

      nome: data.nome,

      cpfCnpj: data.cpfCnpj,

      email: data.email,

      telefone: data.telefone,
    },
  });
}
"use server";

import { prisma } from "@/lib/prisma";

type UpdateClienteData = {
  id: string;
  nome: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
};

export async function updateCliente(
  data: UpdateClienteData
) {
  return await prisma.cliente.update({
    where: {
      id: data.id,
    },

    data: {
      nome: data.nome,
      cpfCnpj: data.cpfCnpj,
      email: data.email,
      telefone: data.telefone,
    },
  });
}
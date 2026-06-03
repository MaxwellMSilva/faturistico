"use server";

import { getEmpresaAtual } from "@/lib/get-empresa-atual";
import { prisma } from "@/lib/prisma";

type CreateClienteData = {
  nome: string;
  cpfCnpj: string;
  email?: string;
  telefone?: string;
};

const empresa =
  await getEmpresaAtual();

export async function createCliente(
  data: CreateClienteData
) {
  return await prisma.cliente.create({
    data: {
      empresaId: empresa.id,

      tipoPessoa: "JURIDICA",

      nome: data.nome,

      cpfCnpj: data.cpfCnpj,

      email: data.email,

      telefone: data.telefone,
    },
  });
}
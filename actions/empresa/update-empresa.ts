"use server";

import { prisma } from "@/lib/prisma";

type UpdateEmpresaData = {
  id: string;

  razaoSocial: string;
  nomeFantasia: string;

  cnpj: string;

  inscricaoEstadual: string;
  inscricaoMunicipal: string;

  crt: string;

  email: string;
  telefone: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;

  bairro: string;

  municipio: string;
  codigoMunicipio: string;

  uf: string;

  cnaePrincipal: string;
};

export async function updateEmpresa(
  data: UpdateEmpresaData
) {
  return await prisma.empresa.update({
    where: {
      id: data.id,
    },

    data: {
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia,

      cnpj: data.cnpj,

      inscricaoEstadual:
        data.inscricaoEstadual,

      inscricaoMunicipal:
        data.inscricaoMunicipal,

      crt: data.crt,

      email: data.email,
      telefone: data.telefone,

      cep: data.cep,

      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,

      bairro: data.bairro,

      municipio: data.municipio,
      codigoMunicipio:
        data.codigoMunicipio,

      uf: data.uf,

      cnaePrincipal:
        data.cnaePrincipal,
    },
  });
}
"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function getDadosFormCte(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR
  );

  const [
    empresa,
    clientes,
    configuracao,
    certificado,
  ] = await Promise.all([
    prisma.empresa.findUnique({
      where: { id: empresaId },
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        cnpj: true,
        inscricaoEstadual: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        municipio: true,
        codigoMunicipio: true,
        uf: true,
      },
    }),
    prisma.cliente.findMany({
      where: {
        empresaId,
        ativo: true,
      },
      orderBy: { nome: "asc" },
      select: {
        id: true,
        tipoPessoa: true,
        nome: true,
        cpfCnpj: true,
        inscricaoEstadual: true,
        email: true,
        telefone: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        municipio: true,
        codigoMunicipio: true,
        uf: true,
        codigoPais: true,
        pais: true,
      },
    }),
    prisma.configuracaoFiscal.findUnique({
      where: { empresaId },
      select: {
        ambiente: true,
        regimeTributario: true,
        serieCte: true,
        rntrc: true,
      },
    }),
    prisma.certificadoDigital.findFirst({
      where: {
        empresaId,
        ativo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        nomeArquivo: true,
        titular: true,
        cnpjCpf: true,
        validadeInicio: true,
        validadeFim: true,
      },
    }),
  ]);

  if (!empresa) {
    throw new Error(
      "EMPRESA_NAO_ENCONTRADA"
    );
  }

  return {
    empresa,
    clientes,
    configuracao,
    certificado,
  };
}

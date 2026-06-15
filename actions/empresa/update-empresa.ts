"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarEdicaoEmpresa } from "@/lib/empresa/validar-edicao-empresa";

type UpdateEmpresaData = {
  id: string;

  razaoSocial: string;
  nomeFantasia: string;

  cnpj: string;

  inscricaoEstadual: string;
  inscricaoMunicipal: string;

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
};

type UpdateEmpresaResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

function textoOpcional(
  valor?: string
) {
  const texto =
    valor?.trim();

  return texto || null;
}

function somenteNumeros(
  valor?: string
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function emailValido(
  valor: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    valor
  );
}

export async function updateEmpresa(
  data: UpdateEmpresaData
): Promise<UpdateEmpresaResult> {
  /*
   * OWNER pode editar qualquer empresa.
   *
   * ADMIN pode editar somente empresas
   * em que possui vínculo ativo com
   * permissão ADMIN.
   */

  try {
    await validarEdicaoEmpresa(
      data.id
    );
  } catch (error) {
    console.error(
      "Erro de autorização ao editar empresa:",
      error
    );

    return {
      success: false,
      message:
        "Você não possui permissão para editar esta empresa.",
    };
  }

  /*
   * Normalização.
   */

  const razaoSocial =
    data.razaoSocial.trim();

  const nomeFantasia =
    textoOpcional(
      data.nomeFantasia
    );

  const cnpj =
    somenteNumeros(
      data.cnpj
    );

  const inscricaoEstadual =
    textoOpcional(
      data.inscricaoEstadual
    );

  const inscricaoMunicipal =
    textoOpcional(
      data.inscricaoMunicipal
    );

  const email =
    data.email
      .trim()
      .toLowerCase();

  const telefone =
    somenteNumeros(
      data.telefone
    );

  const cep =
    somenteNumeros(
      data.cep
    );

  const logradouro =
    textoOpcional(
      data.logradouro
    );

  const numero =
    textoOpcional(
      data.numero
    );

  const complemento =
    textoOpcional(
      data.complemento
    );

  const bairro =
    textoOpcional(
      data.bairro
    );

  const municipio =
    textoOpcional(
      data.municipio
    );

  const codigoMunicipio =
    somenteNumeros(
      data.codigoMunicipio
    );

  const uf =
    data.uf
      .trim()
      .toUpperCase();

  /*
   * Validações.
   */

  if (!data.id) {
    return {
      success: false,
      message:
        "Empresa não informada.",
    };
  }

  if (!razaoSocial) {
    return {
      success: false,
      message:
        "Informe a razão social.",
    };
  }

  if (cnpj.length !== 14) {
    return {
      success: false,
      message:
        "O CNPJ deve possuir 14 números.",
    };
  }

  if (
    email &&
    !emailValido(email)
  ) {
    return {
      success: false,
      message:
        "Informe um e-mail válido.",
    };
  }

  if (
    telefone &&
    telefone.length !== 10 &&
    telefone.length !== 11
  ) {
    return {
      success: false,
      message:
        "O telefone deve possuir 10 ou 11 números, incluindo o DDD.",
    };
  }

  if (
    cep &&
    cep.length !== 8
  ) {
    return {
      success: false,
      message:
        "O CEP deve possuir 8 números.",
    };
  }

  if (
    codigoMunicipio &&
    codigoMunicipio.length !== 7
  ) {
    return {
      success: false,
      message:
        "O código IBGE do município deve possuir 7 números.",
    };
  }

  if (
    uf &&
    uf.length !== 2
  ) {
    return {
      success: false,
      message:
        "A UF deve possuir 2 letras.",
    };
  }

  /*
   * Verifica duplicidade do CNPJ.
   */

  const empresaComMesmoCnpj =
    await prisma.empresa.findFirst({
      where: {
        cnpj,

        id: {
          not: data.id,
        },
      },

      select: {
        id: true,
      },
    });

  if (empresaComMesmoCnpj) {
    return {
      success: false,
      message:
        "Já existe outra empresa cadastrada com este CNPJ.",
    };
  }

  try {
    await prisma.empresa.update({
      where: {
        id: data.id,
      },

      data: {
        razaoSocial,
        nomeFantasia,
        cnpj,

        inscricaoEstadual,
        inscricaoMunicipal,

        email:
          email || null,

        telefone:
          telefone || null,

        cep:
          cep || null,

        logradouro,
        numero,
        complemento,
        bairro,
        municipio,

        codigoMunicipio:
          codigoMunicipio ||
          null,

        uf:
          uf || null,
      },
    });

    revalidatePath(
      "/empresas"
    );

    revalidatePath(
      `/empresas/${data.id}/editar`
    );

    revalidatePath(
      `/empresa/${data.id}`
    );

    revalidatePath(
      `/empresa/${data.id}/dashboard`
    );

    revalidatePath(
      `/empresa/${data.id}/configuracoes`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao atualizar empresa:",
      error
    );

    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        return {
          success: false,
          message:
            "Já existe uma empresa cadastrada com este CNPJ.",
        };
      }

      if (error.code === "P2025") {
        return {
          success: false,
          message:
            "Empresa não encontrada.",
        };
      }
    }

    return {
      success: false,
      message:
        "Não foi possível atualizar os dados da empresa.",
    };
  }
}
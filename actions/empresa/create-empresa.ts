"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarCadastroEmpresa } from "@/lib/empresa/validar-cadastro-empresa";

type CreateEmpresaData = {
  razaoSocial: string;
  nomeFantasia?: string;

  cnpj: string;

  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;

  email?: string;
  telefone?: string;

  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;

  municipio?: string;
  codigoMunicipio?: string;
  uf?: string;
};

type CreateEmpresaResult =
  | {
      success: true;
      empresaId: string;
    }
  | {
      success: false;
      message: string;
    };

function somenteNumeros(
  valor?: string
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function textoOpcional(
  valor?: string
) {
  const texto =
    valor?.trim();

  return texto || null;
}

function emailValido(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export async function createEmpresa(
  data: CreateEmpresaData
): Promise<CreateEmpresaResult> {
  let usuario: Awaited<
    ReturnType<
      typeof validarCadastroEmpresa
    >
  >;

  try {
    usuario =
      await validarCadastroEmpresa();
  } catch {
    return {
      success: false,
      message:
        "Somente o proprietário pode cadastrar empresas.",
    };
  }

  /*
   * Normalização dos dados.
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
      ?.trim()
      .toLowerCase() ?? "";

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
      ?.trim()
      .toUpperCase() ?? "";

  /*
   * Validações.
   */

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
        "Informe um CNPJ válido com 14 números.",
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
        "Informe um telefone válido com DDD.",
    };
  }

  if (
    cep &&
    cep.length !== 8
  ) {
    return {
      success: false,
      message:
        "Informe um CEP válido com 8 números.",
    };
  }

  if (
    codigoMunicipio &&
    codigoMunicipio.length !== 7
  ) {
    return {
      success: false,
      message:
        "Informe um código IBGE válido com 7 números.",
    };
  }

  if (
    uf &&
    uf.length !== 2
  ) {
    return {
      success: false,
      message:
        "Informe uma UF válida.",
    };
  }

  /*
   * Permissão do vínculo com a empresa:
   *
   * OWNER global recebe OWNER.
   * ADMIN global recebe ADMIN.
   */

  try {
    const empresa =
      await prisma.empresa.create({
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

          /*
           * Cria o vínculo de acesso
           * dentro da mesma operação.
           */

          usuarios: {
            create: {
              usuarioId: usuario.id,
              permissao: "OWNER",
              ativo: true,
            },
          },
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      "/empresas"
    );

    revalidatePath(
      "/painel"
    );

    return {
      success: true,
      empresaId:
        empresa.id,
    };
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message:
          "Já existe uma empresa cadastrada com este CNPJ.",
      };
    }

    console.error(
      "Erro ao criar empresa:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar a empresa.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

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
  const texto = valor?.trim();

  return texto || null;
}

function somenteNumeros(
  valor?: string
) {
  return valor?.replace(/\D/g, "") ?? "";
}

function obterCodigoErro(
  error: unknown
) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return String(
      (error as {
        code?: unknown;
      }).code
    );
  }

  return null;
}

export async function updateEmpresa(
  data: UpdateEmpresaData
): Promise<UpdateEmpresaResult> {
  const { acesso } =
    await validarAcessoEmpresa(
      data.id
    );

  if (
    acesso.permissao !== "OWNER" &&
    acesso.permissao !== "ADMIN"
  ) {
    return {
      success: false,
      message:
        "Você não possui permissão para alterar os dados da empresa.",
    };
  }

  const razaoSocial =
    data.razaoSocial.trim();

  const cnpj =
    somenteNumeros(data.cnpj);

  const cep =
    somenteNumeros(data.cep);

  const codigoMunicipio =
    somenteNumeros(
      data.codigoMunicipio
    );

  const uf =
    data.uf
      .trim()
      .toUpperCase();

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

  const empresaComMesmoCnpj =
    await prisma.empresa.findFirst({
      where: {
        cnpj,

        NOT: {
          id: data.id,
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

        nomeFantasia:
          textoOpcional(
            data.nomeFantasia
          ),

        cnpj,

        inscricaoEstadual:
          textoOpcional(
            data.inscricaoEstadual
          ),

        inscricaoMunicipal:
          textoOpcional(
            data.inscricaoMunicipal
          ),

        email:
          textoOpcional(
            data.email
          ),

        telefone:
          textoOpcional(
            data.telefone
          ),

        cep:
          textoOpcional(cep),

        logradouro:
          textoOpcional(
            data.logradouro
          ),

        numero:
          textoOpcional(
            data.numero
          ),

        complemento:
          textoOpcional(
            data.complemento
          ),

        bairro:
          textoOpcional(
            data.bairro
          ),

        municipio:
          textoOpcional(
            data.municipio
          ),

        codigoMunicipio:
          textoOpcional(
            codigoMunicipio
          ),

        uf:
          textoOpcional(uf),
      },
    });

    revalidatePath(
      `/empresa/${data.id}`
    );

    revalidatePath(
      `/empresa/${data.id}/configuracoes`
    );

    revalidatePath(
      "/empresas"
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
      obterCodigoErro(error) ===
      "P2002"
    ) {
      return {
        success: false,
        message:
          "Já existe uma empresa cadastrada com este CNPJ.",
      };
    }

    if (
      obterCodigoErro(error) ===
      "P2025"
    ) {
      return {
        success: false,
        message:
          "Empresa não encontrada.",
      };
    }

    return {
      success: false,
      message:
        "Não foi possível atualizar os dados da empresa.",
    };
  }
}
"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type TipoPessoa =
  | "FISICA"
  | "JURIDICA";

type UpdateTransportadorData = {
  id: string;
  empresaId: string;

  tipoPessoa: TipoPessoa;

  nome: string;
  nomeFantasia?: string;

  cpfCnpj: string;

  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;

  rntrc?: string;

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

  ativo: boolean;
};

type UpdateTransportadorResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

function somenteNumeros(
  valor?: string
) {
  return valor?.replace(/\D/g, "") ?? "";
}

function textoOpcional(
  valor?: string
) {
  return valor?.trim() || null;
}

export async function updateTransportador(
  data: UpdateTransportadorData
): Promise<UpdateTransportadorResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const transportador =
    await prisma.transportador.findFirst({
      where: {
        id: data.id,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!transportador) {
    return {
      success: false,
      message:
        "Transportador não encontrado nesta empresa.",
    };
  }

  const nome = data.nome.trim();

  const cpfCnpj =
    somenteNumeros(data.cpfCnpj);

  const rntrc =
    somenteNumeros(data.rntrc);

  const cep =
    somenteNumeros(data.cep);

  const telefone =
    somenteNumeros(data.telefone);

  const codigoMunicipio =
    somenteNumeros(
      data.codigoMunicipio
    );

  const uf =
    data.uf
      ?.trim()
      .toUpperCase() ?? "";

  if (
    data.tipoPessoa !== "FISICA" &&
    data.tipoPessoa !== "JURIDICA"
  ) {
    return {
      success: false,
      message:
        "Informe um tipo de pessoa válido.",
    };
  }

  if (!nome) {
    return {
      success: false,
      message:
        "Informe o nome ou razão social do transportador.",
    };
  }

  const tamanhoDocumento =
    data.tipoPessoa === "FISICA"
      ? 11
      : 14;

  if (
    cpfCnpj.length !==
    tamanhoDocumento
  ) {
    return {
      success: false,
      message:
        data.tipoPessoa === "FISICA"
          ? "Informe um CPF válido com 11 números."
          : "Informe um CNPJ válido com 14 números.",
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

  const email =
    data.email
      ?.trim()
      .toLowerCase() ?? "";

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    return {
      success: false,
      message:
        "Informe um e-mail válido.",
    };
  }

  try {
    await prisma.transportador.update({
      where: {
        id:
          transportador.id,
      },

      data: {
        tipoPessoa:
          data.tipoPessoa,

        nome,

        nomeFantasia:
          data.tipoPessoa ===
          "JURIDICA"
            ? textoOpcional(
                data.nomeFantasia
              )
            : null,

        cpfCnpj,

        inscricaoEstadual:
          textoOpcional(
            data.inscricaoEstadual
          ),

        inscricaoMunicipal:
          textoOpcional(
            data.inscricaoMunicipal
          ),

        rntrc:
          rntrc || null,

        email:
          email || null,

        telefone:
          telefone || null,

        cep:
          cep || null,

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
          codigoMunicipio ||
          null,

        uf:
          uf || null,

        ativo:
          data.ativo,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/transportadores`
    );

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const campos =
        Array.isArray(
          error.meta?.target
        )
          ? error.meta.target.join(
              ", "
            )
          : String(
              error.meta?.target ?? ""
            );

      if (
        campos.includes(
          "cpfCnpj"
        )
      ) {
        return {
          success: false,
          message:
            "Já existe outro transportador com este CPF ou CNPJ.",
        };
      }

      if (
        campos.includes("rntrc")
      ) {
        return {
          success: false,
          message:
            "Já existe outro transportador com este RNTRC.",
        };
      }
    }

    console.error(
      "Erro ao atualizar transportador:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o transportador.",
    };
  }
}
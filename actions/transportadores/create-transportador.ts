"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type TipoPessoa =
  | "FISICA"
  | "JURIDICA";

type CreateTransportadorData = {
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
};

type CreateTransportadorResult =
  | {
      success: true;
      transportadorId: string;
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

export async function createTransportador(
  data: CreateTransportadorData
): Promise<CreateTransportadorResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.TRANSPORTADORES_CRIAR
  );

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
        data.tipoPessoa === "FISICA"
          ? "Informe o nome do transportador."
          : "Informe a razão social do transportador.",
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
    const transportador =
      await prisma.transportador.create({
        data: {
          empresaId:
            data.empresaId,

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
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      `/empresa/${data.empresaId}/transportadores`
    );

    return {
      success: true,
      transportadorId:
        transportador.id,
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
            "Já existe um transportador com este CPF ou CNPJ nesta empresa.",
        };
      }

      if (
        campos.includes("rntrc")
      ) {
        return {
          success: false,
          message:
            "Já existe um transportador com este RNTRC nesta empresa.",
        };
      }
    }

    console.error(
      "Erro ao cadastrar transportador:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o transportador.",
    };
  }
}

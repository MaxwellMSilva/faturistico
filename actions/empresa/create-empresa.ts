"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  return valor?.replace(/\D/g, "") ?? "";
}

function textoOpcional(
  valor?: string
) {
  const texto = valor?.trim();

  return texto ? texto : null;
}

export async function createEmpresa(
  data: CreateEmpresaData
): Promise<CreateEmpresaResult> {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    return {
      success: false,
      message:
        "Usuário não autenticado.",
    };
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        ativo: true,
      },
    });

  if (!usuario || !usuario.ativo) {
    return {
      success: false,
      message:
        "Usuário não encontrado ou inativo.",
    };
  }

  const razaoSocial =
    data.razaoSocial.trim();

  const cnpj =
    somenteNumeros(data.cnpj);

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
        "Informe um CNPJ válido.",
    };
  }

  const empresaExistente =
    await prisma.empresa.findUnique({
      where: {
        cnpj,
      },
      select: {
        id: true,
      },
    });

  if (empresaExistente) {
    return {
      success: false,
      message:
        "Já existe uma empresa cadastrada com este CNPJ.",
    };
  }

  try {
    const empresa =
      await prisma.empresa.create({
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
            textoOpcional(data.email),

          telefone:
            textoOpcional(
              somenteNumeros(
                data.telefone
              )
            ),

          cep:
            textoOpcional(
              somenteNumeros(data.cep)
            ),

          logradouro:
            textoOpcional(
              data.logradouro
            ),

          numero:
            textoOpcional(data.numero),

          complemento:
            textoOpcional(
              data.complemento
            ),

          bairro:
            textoOpcional(data.bairro),

          municipio:
            textoOpcional(
              data.municipio
            ),

          codigoMunicipio:
            textoOpcional(
              somenteNumeros(
                data.codigoMunicipio
              )
            ),

          uf:
            textoOpcional(
              data.uf?.toUpperCase()
            ),

          usuarios: {
            create: {
              usuarioId:
                session.user.id,

              permissao: "OWNER",

              ativo: true,
            },
          },
        },

        select: {
          id: true,
        },
      });

    revalidatePath("/empresas");

    return {
      success: true,
      empresaId: empresa.id,
    };
  } catch (error) {
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
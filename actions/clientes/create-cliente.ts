"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type CreateClienteData = {
  empresaId: string;

  tipoPessoa:
    | "FISICA"
    | "JURIDICA";

  nome: string;
  cpfCnpj: string;

  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  suframa?: string;

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

type CreateClienteResult =
  | {
      success: true;
      clienteId: string;
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

export async function createCliente(
  data: CreateClienteData
): Promise<CreateClienteResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const nome = data.nome.trim();

  const cpfCnpj = somenteNumeros(
    data.cpfCnpj
  );

  if (!nome) {
    return {
      success: false,
      message:
        "Informe o nome do cliente.",
    };
  }

  if (
    cpfCnpj.length !== 11 &&
    cpfCnpj.length !== 14
  ) {
    return {
      success: false,
      message:
        "Informe um CPF ou CNPJ válido.",
    };
  }

  const clienteExistente =
    await prisma.cliente.findUnique({
      where: {
        empresaId_cpfCnpj: {
          empresaId: data.empresaId,
          cpfCnpj,
        },
      },

      select: {
        id: true,
      },
    });

  if (clienteExistente) {
    return {
      success: false,
      message:
        "Este CPF ou CNPJ já está cadastrado nesta empresa.",
    };
  }

  try {
    const cliente =
      await prisma.cliente.create({
        data: {
          empresaId:
            data.empresaId,

          tipoPessoa:
            data.tipoPessoa,

          nome,
          cpfCnpj,

          inscricaoEstadual:
            textoOpcional(
              data.inscricaoEstadual
            ),

          inscricaoMunicipal:
            textoOpcional(
              data.inscricaoMunicipal
            ),

          suframa:
            textoOpcional(
              data.suframa
            ),

          email:
            textoOpcional(
              data.email
            ),

          telefone:
            textoOpcional(
              somenteNumeros(
                data.telefone
              )
            ),

          cep:
            textoOpcional(
              somenteNumeros(
                data.cep
              )
            ),

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
              somenteNumeros(
                data.codigoMunicipio
              )
            ),

          uf:
            textoOpcional(
              data.uf?.toUpperCase()
            ),
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      `/empresa/${data.empresaId}/clientes`
    );

    return {
      success: true,
      clienteId: cliente.id,
    };
  } catch (error) {
    console.error(
      "Erro ao criar cliente:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o cliente.",
    };
  }
}
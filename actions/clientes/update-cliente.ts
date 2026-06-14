"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type UpdateClienteData = {
  id: string;
  empresaId: string;

  tipoPessoa: "FISICA" | "JURIDICA";

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

type UpdateClienteResult =
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
  const texto = valor?.trim();

  return texto ? texto : null;
}

export async function updateCliente(
  data: UpdateClienteData
): Promise<UpdateClienteResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const clienteAtual =
    await prisma.cliente.findFirst({
      where: {
        id: data.id,
        empresaId: data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!clienteAtual) {
    return {
      success: false,
      message:
        "Cliente não encontrado nesta empresa.",
    };
  }

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
          ? "Informe um CPF válido."
          : "Informe um CNPJ válido.",
    };
  }

  const clienteDuplicado =
    await prisma.cliente.findFirst({
      where: {
        empresaId: data.empresaId,
        cpfCnpj,

        NOT: {
          id: data.id,
        },
      },

      select: {
        id: true,
      },
    });

  if (clienteDuplicado) {
    return {
      success: false,
      message:
        "Este CPF ou CNPJ já está cadastrado nesta empresa.",
    };
  }

  try {
    await prisma.cliente.update({
      where: {
        id: data.id,
      },

      data: {
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
    });

    revalidatePath(
      `/empresa/${data.empresaId}/clientes`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao atualizar cliente:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o cliente.",
    };
  }
}
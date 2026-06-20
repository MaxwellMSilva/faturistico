"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type UpdateMotoristaData = {
  id: string;
  empresaId: string;

  transportadorId?: string;

  nome: string;
  cpf: string;

  numeroCnh?: string;
  categoriaCnh?: string;
  validadeCnh?: string | null;

  telefone?: string;

  ativo: boolean;
};

type UpdateMotoristaResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

const categoriasCnhValidas =
  new Set([
    "A",
    "B",
    "C",
    "D",
    "E",
    "AB",
    "AC",
    "AD",
    "AE",
    "ACC",
  ]);

function somenteNumeros(
  valor?: string
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function validarCpf(
  valor: string
) {
  const cpf =
    somenteNumeros(valor);

  if (
    cpf.length !== 11 ||
    /^(\d)\1{10}$/.test(cpf)
  ) {
    return false;
  }

  let soma = 0;

  for (
    let indice = 0;
    indice < 9;
    indice++
  ) {
    soma +=
      Number(cpf[indice]) *
      (10 - indice);
  }

  let digito =
    11 - (soma % 11);

  if (digito >= 10) {
    digito = 0;
  }

  if (
    digito !== Number(cpf[9])
  ) {
    return false;
  }

  soma = 0;

  for (
    let indice = 0;
    indice < 10;
    indice++
  ) {
    soma +=
      Number(cpf[indice]) *
      (11 - indice);
  }

  digito =
    11 - (soma % 11);

  if (digito >= 10) {
    digito = 0;
  }

  return (
    digito === Number(cpf[10])
  );
}

function converterData(
  valor?: string | null
) {
  if (!valor?.trim()) {
    return null;
  }

  const data =
    new Date(
      `${valor}T12:00:00.000Z`
    );

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return null;
  }

  return data;
}

export async function updateMotorista(
  data: UpdateMotoristaData
): Promise<UpdateMotoristaResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.MOTORISTAS_EDITAR
  );

  const motorista =
    await prisma.motorista.findFirst({
      where: {
        id: data.id,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!motorista) {
    return {
      success: false,
      message:
        "Motorista não encontrado nesta empresa.",
    };
  }

  const nome =
    data.nome.trim();

  const cpf =
    somenteNumeros(data.cpf);

  const numeroCnh =
    somenteNumeros(
      data.numeroCnh
    );

  const categoriaCnh =
    data.categoriaCnh
      ?.trim()
      .toUpperCase() ?? "";

  const telefone =
    somenteNumeros(
      data.telefone
    );

  const validadeCnh =
    converterData(
      data.validadeCnh
    );

  if (!nome) {
    return {
      success: false,
      message:
        "Informe o nome completo do motorista.",
    };
  }

  if (!validarCpf(cpf)) {
    return {
      success: false,
      message:
        "Informe um CPF válido.",
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

  const informouDadosCnh =
    Boolean(
      numeroCnh ||
      categoriaCnh ||
      data.validadeCnh
    );

  if (informouDadosCnh) {
    if (numeroCnh.length !== 11) {
      return {
        success: false,
        message:
          "Informe o número da CNH com 11 números.",
      };
    }

    if (
      !categoriasCnhValidas.has(
        categoriaCnh
      )
    ) {
      return {
        success: false,
        message:
          "Informe uma categoria de CNH válida.",
      };
    }

    if (!validadeCnh) {
      return {
        success: false,
        message:
          "Informe uma validade válida para a CNH.",
      };
    }
  }

  if (data.transportadorId) {
    const transportador =
      await prisma.transportador.findFirst({
        where: {
          id:
            data.transportadorId,

          empresaId:
            data.empresaId,

          ativo: true,
        },

        select: {
          id: true,
        },
      });

    if (!transportador) {
      return {
        success: false,
        message:
          "O transportador selecionado não foi encontrado ou está inativo.",
      };
    }
  }

  try {
    await prisma.motorista.update({
      where: {
        id: motorista.id,
      },

      data: {
        transportadorId:
          data.transportadorId ||
          null,

        nome,
        cpf,

        numeroCnh:
          numeroCnh || null,

        categoriaCnh:
          categoriaCnh || null,

        validadeCnh,

        telefone:
          telefone || null,

        ativo: data.ativo,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/motoristas`
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
        campos.includes("cpf")
      ) {
        return {
          success: false,
          message:
            "Já existe outro motorista com este CPF.",
        };
      }

      if (
        campos.includes(
          "numeroCnh"
        )
      ) {
        return {
          success: false,
          message:
            "Já existe outro motorista com este número de CNH.",
        };
      }
    }

    console.error(
      "Erro ao atualizar motorista:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o motorista.",
    };
  }
}

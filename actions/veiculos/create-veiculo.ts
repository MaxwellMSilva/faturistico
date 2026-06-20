"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  PrivilegioEmpresa,
  TipoVeiculo,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

type CreateVeiculoData = {
  empresaId: string;

  transportadorId?: string;

  placa: string;
  renavam?: string;

  ufLicenciamento?: string;

  tipo: TipoVeiculo;

  marcaModelo?: string;

  anoFabricacao?: number | null;
  anoModelo?: number | null;

  taraKg?: number | null;
  capacidadeKg?: number | null;
  capacidadeM3?: number | null;
};

type CreateVeiculoResult =
  | {
      success: true;
      veiculoId: string;
    }
  | {
      success: false;
      message: string;
    };

function normalizarPlaca(
  valor: string
) {
  return valor
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase();
}

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

function placaValida(
  placa: string
) {
  const padraoAntigo =
    /^[A-Z]{3}\d{4}$/;

  const padraoMercosul =
    /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return (
    padraoAntigo.test(placa) ||
    padraoMercosul.test(placa)
  );
}

function anoValido(
  ano?: number | null
) {
  if (ano === null || ano === undefined) {
    return true;
  }

  const anoAtual =
    new Date().getFullYear();

  return (
    Number.isInteger(ano) &&
    ano >= 1900 &&
    ano <= anoAtual + 1
  );
}

function valorNaoNegativo(
  valor?: number | null
) {
  return (
    valor === null ||
    valor === undefined ||
    (Number.isFinite(valor) &&
      valor >= 0)
  );
}

export async function createVeiculo(
  data: CreateVeiculoData
): Promise<CreateVeiculoResult> {
  await validarPrivilegioEmpresa(
    data.empresaId,
    PrivilegioEmpresa.VEICULOS_CRIAR
  );

  const placa =
    normalizarPlaca(data.placa);

  const renavam =
    somenteNumeros(data.renavam);

  const ufLicenciamento =
    data.ufLicenciamento
      ?.trim()
      .toUpperCase() ?? "";

  const marcaModelo =
    textoOpcional(data.marcaModelo);

  if (!placaValida(placa)) {
    return {
      success: false,
      message:
        "Informe uma placa brasileira válida.",
    };
  }

  if (
    renavam &&
    renavam.length !== 11
  ) {
    return {
      success: false,
      message:
        "Informe um RENAVAM válido com 11 números.",
    };
  }

  if (
    ufLicenciamento &&
    ufLicenciamento.length !== 2
  ) {
    return {
      success: false,
      message:
        "Informe uma UF de licenciamento válida.",
    };
  }

  if (
    !Object.values(
      TipoVeiculo
    ).includes(data.tipo)
  ) {
    return {
      success: false,
      message:
        "Informe um tipo de veículo válido.",
    };
  }

  if (
    !anoValido(
      data.anoFabricacao
    )
  ) {
    return {
      success: false,
      message:
        "Informe um ano de fabricação válido.",
    };
  }

  if (
    !anoValido(data.anoModelo)
  ) {
    return {
      success: false,
      message:
        "Informe um ano do modelo válido.",
    };
  }

  if (
    data.anoFabricacao &&
    data.anoModelo &&
    data.anoModelo <
      data.anoFabricacao
  ) {
    return {
      success: false,
      message:
        "O ano do modelo não pode ser menor que o ano de fabricação.",
    };
  }

  if (
    !valorNaoNegativo(
      data.taraKg
    )
  ) {
    return {
      success: false,
      message:
        "Informe uma tara válida.",
    };
  }

  if (
    !valorNaoNegativo(
      data.capacidadeKg
    )
  ) {
    return {
      success: false,
      message:
        "Informe uma capacidade em quilogramas válida.",
    };
  }

  if (
    !valorNaoNegativo(
      data.capacidadeM3
    )
  ) {
    return {
      success: false,
      message:
        "Informe uma capacidade em metros cúbicos válida.",
    };
  }

  if (data.transportadorId) {
    const transportador =
      await prisma.transportador.findFirst({
        where: {
          id: data.transportadorId,
          empresaId: data.empresaId,
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
    const veiculo =
      await prisma.veiculo.create({
        data: {
          empresaId:
            data.empresaId,

          transportadorId:
            data.transportadorId ||
            null,

          placa,

          renavam:
            renavam || null,

          ufLicenciamento:
            ufLicenciamento ||
            null,

          tipo: data.tipo,

          marcaModelo,

          anoFabricacao:
            data.anoFabricacao ??
            null,

          anoModelo:
            data.anoModelo ??
            null,

          taraKg:
            data.taraKg ??
            null,

          capacidadeKg:
            data.capacidadeKg ??
            null,

          capacidadeM3:
            data.capacidadeM3 ??
            null,
        },

        select: {
          id: true,
        },
      });

    revalidatePath(
      `/empresa/${data.empresaId}/veiculos`
    );

    return {
      success: true,
      veiculoId: veiculo.id,
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
        campos.includes("placa")
      ) {
        return {
          success: false,
          message:
            "Já existe um veículo com esta placa nesta empresa.",
        };
      }

      if (
        campos.includes("renavam")
      ) {
        return {
          success: false,
          message:
            "Já existe um veículo com este RENAVAM nesta empresa.",
        };
      }
    }

    console.error(
      "Erro ao cadastrar veículo:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível cadastrar o veículo.",
    };
  }
}

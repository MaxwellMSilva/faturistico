"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  TipoVeiculo,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type UpdateVeiculoData = {
  id: string;
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

  ativo: boolean;
};

type UpdateVeiculoResult =
  | {
      success: true;
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
  return (
    /^[A-Z]{3}\d{4}$/.test(
      placa
    ) ||
    /^[A-Z]{3}\d[A-Z]\d{2}$/.test(
      placa
    )
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

export async function updateVeiculo(
  data: UpdateVeiculoData
): Promise<UpdateVeiculoResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const veiculo =
    await prisma.veiculo.findFirst({
      where: {
        id: data.id,
        empresaId:
          data.empresaId,
      },

      select: {
        id: true,
      },
    });

  if (!veiculo) {
    return {
      success: false,
      message:
        "Veículo não encontrado nesta empresa.",
    };
  }

  const placa =
    normalizarPlaca(data.placa);

  const renavam =
    somenteNumeros(data.renavam);

  const ufLicenciamento =
    data.ufLicenciamento
      ?.trim()
      .toUpperCase() ?? "";

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
    ) ||
    !valorNaoNegativo(
      data.capacidadeKg
    ) ||
    !valorNaoNegativo(
      data.capacidadeM3
    )
  ) {
    return {
      success: false,
      message:
        "Informe valores de capacidade válidos.",
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
    await prisma.veiculo.update({
      where: {
        id: veiculo.id,
      },

      data: {
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

        marcaModelo:
          textoOpcional(
            data.marcaModelo
          ),

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

        ativo: data.ativo,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/veiculos`
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
        campos.includes("placa")
      ) {
        return {
          success: false,
          message:
            "Já existe outro veículo com esta placa.",
        };
      }

      if (
        campos.includes("renavam")
      ) {
        return {
          success: false,
          message:
            "Já existe outro veículo com este RENAVAM.",
        };
      }
    }

    console.error(
      "Erro ao atualizar veículo:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível atualizar o veículo.",
    };
  }
}
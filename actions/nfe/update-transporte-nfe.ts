"use server";

import { revalidatePath } from "next/cache";

import {
  ModalidadeFrete,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

type UpdateTransporteNfeData = {
  empresaId: string;
  notaFiscalId: string;

  modalidadeFrete:
    ModalidadeFrete;

  transportadorId?:
    | string
    | null;

  veiculoId?:
    | string
    | null;

  motoristaId?:
    | string
    | null;

  quantidadeVolumes?:
    | number
    | null;

  especieVolumes?: string;
  marcaVolumes?: string;
  numeracaoVolumes?: string;

  pesoLiquido?:
    | number
    | null;

  pesoBruto?:
    | number
    | null;
};

type UpdateTransporteNfeResult =
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
  return valor?.trim() || null;
}

function valorNaoNegativo(
  valor?: number | null
) {
  return (
    valor === null ||
    valor === undefined ||
    (
      Number.isFinite(valor) &&
      valor >= 0
    )
  );
}

export async function updateTransporteNfe(
  data: UpdateTransporteNfeData
): Promise<UpdateTransporteNfeResult> {
  await validarAcessoEmpresa(
    data.empresaId
  );

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: data.notaFiscalId,
        empresaId: data.empresaId,
        tipoDocumento: "NFE",
      },

      select: {
        id: true,
        status: true,

        transporte: {
          select: {
            transportadorId: true,
            veiculoId: true,
            motoristaId: true,
          },
        },
      },
    });

  if (!nota) {
    return {
      success: false,
      message:
        "NF-e não encontrada nesta empresa.",
    };
  }

  if (nota.status !== "RASCUNHO") {
    return {
      success: false,
      message:
        "Somente uma NF-e em rascunho pode ter o transporte alterado.",
    };
  }

  if (
    !Object.values(
      ModalidadeFrete
    ).includes(
      data.modalidadeFrete
    )
  ) {
    return {
      success: false,
      message:
        "Informe uma modalidade de frete válida.",
    };
  }

  if (
    data.quantidadeVolumes !==
      null &&
    data.quantidadeVolumes !==
      undefined &&
    (
      !Number.isInteger(
        data.quantidadeVolumes
      ) ||
      data.quantidadeVolumes <= 0
    )
  ) {
    return {
      success: false,
      message:
        "Informe uma quantidade de volumes válida.",
    };
  }

  if (
    !valorNaoNegativo(
      data.pesoLiquido
    )
  ) {
    return {
      success: false,
      message:
        "Informe um peso líquido válido.",
    };
  }

  if (
    !valorNaoNegativo(
      data.pesoBruto
    )
  ) {
    return {
      success: false,
      message:
        "Informe um peso bruto válido.",
    };
  }

  if (
    data.pesoLiquido !== null &&
    data.pesoLiquido !== undefined &&
    data.pesoBruto !== null &&
    data.pesoBruto !== undefined &&
    data.pesoLiquido >
      data.pesoBruto
  ) {
    return {
      success: false,
      message:
        "O peso líquido não pode ser maior que o peso bruto.",
    };
  }

  const semTransporte =
    data.modalidadeFrete ===
    "SEM_TRANSPORTE";

  if (semTransporte) {
    await prisma.transporteNotaFiscal.upsert({
      where: {
        notaFiscalId: nota.id,
      },

      create: {
        notaFiscalId: nota.id,

        modalidadeFrete:
          "SEM_TRANSPORTE",
      },

      update: {
        modalidadeFrete:
          "SEM_TRANSPORTE",

        transportadorId: null,
        veiculoId: null,
        motoristaId: null,

        transportadorNome: null,
        transportadorCpfCnpj: null,

        transportadorInscricaoEstadual:
          null,

        transportadorRntrc: null,

        transportadorLogradouro:
          null,

        transportadorNumero: null,
        transportadorBairro: null,
        transportadorMunicipio:
          null,

        transportadorUf: null,

        veiculoPlaca: null,
        veiculoRenavam: null,
        veiculoUf: null,

        veiculoMarcaModelo: null,
        veiculoTipo: null,

        motoristaNome: null,
        motoristaCpf: null,
        motoristaCnh: null,

        quantidadeVolumes: null,

        especieVolumes: null,
        marcaVolumes: null,
        numeracaoVolumes: null,

        pesoLiquido: null,
        pesoBruto: null,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/nfe/${nota.id}`
    );

    return {
      success: true,
    };
  }

  const transportadorId =
    data.transportadorId || null;

  const veiculoId =
    data.veiculoId || null;

  const motoristaId =
    data.motoristaId || null;

  const [
    transportador,
    veiculo,
    motorista,
  ] = await Promise.all([
    transportadorId
      ? prisma.transportador.findFirst({
          where: {
            id: transportadorId,
            empresaId:
              data.empresaId,

            OR: [
              {
                ativo: true,
              },
              {
                id:
                  nota.transporte
                    ?.transportadorId ??
                  undefined,
              },
            ],
          },

          select: {
            id: true,

            nome: true,
            cpfCnpj: true,

            inscricaoEstadual:
              true,

            rntrc: true,

            logradouro: true,
            numero: true,
            bairro: true,

            municipio: true,
            uf: true,
          },
        })
      : Promise.resolve(null),

    veiculoId
      ? prisma.veiculo.findFirst({
          where: {
            id: veiculoId,
            empresaId:
              data.empresaId,

            OR: [
              {
                ativo: true,
              },
              {
                id:
                  nota.transporte
                    ?.veiculoId ??
                  undefined,
              },
            ],
          },

          select: {
            id: true,

            transportadorId:
              true,

            placa: true,
            renavam: true,

            ufLicenciamento:
              true,

            marcaModelo: true,
            tipo: true,
          },
        })
      : Promise.resolve(null),

    motoristaId
      ? prisma.motorista.findFirst({
          where: {
            id: motoristaId,
            empresaId:
              data.empresaId,

            OR: [
              {
                ativo: true,
              },
              {
                id:
                  nota.transporte
                    ?.motoristaId ??
                  undefined,
              },
            ],
          },

          select: {
            id: true,

            transportadorId:
              true,

            nome: true,
            cpf: true,

            numeroCnh: true,
          },
        })
      : Promise.resolve(null),
  ]);

  if (
    transportadorId &&
    !transportador
  ) {
    return {
      success: false,
      message:
        "O transportador selecionado não foi encontrado ou está inativo.",
    };
  }

  if (veiculoId && !veiculo) {
    return {
      success: false,
      message:
        "O veículo selecionado não foi encontrado ou está inativo.",
    };
  }

  if (
    motoristaId &&
    !motorista
  ) {
    return {
      success: false,
      message:
        "O motorista selecionado não foi encontrado ou está inativo.",
    };
  }

  if (
    transportador &&
    veiculo?.transportadorId &&
    veiculo.transportadorId !==
      transportador.id
  ) {
    return {
      success: false,
      message:
        "O veículo selecionado está vinculado a outro transportador.",
    };
  }

  if (
    transportador &&
    motorista?.transportadorId &&
    motorista.transportadorId !==
      transportador.id
  ) {
    return {
      success: false,
      message:
        "O motorista selecionado está vinculado a outro transportador.",
    };
  }

  try {
    await prisma.transporteNotaFiscal.upsert({
      where: {
        notaFiscalId: nota.id,
      },

      create: {
        notaFiscalId: nota.id,

        modalidadeFrete:
          data.modalidadeFrete,

        transportadorId:
          transportador?.id ??
          null,

        veiculoId:
          veiculo?.id ?? null,

        motoristaId:
          motorista?.id ?? null,

        transportadorNome:
          transportador?.nome ??
          null,

        transportadorCpfCnpj:
          transportador
            ?.cpfCnpj ?? null,

        transportadorInscricaoEstadual:
          transportador
            ?.inscricaoEstadual ??
          null,

        transportadorRntrc:
          transportador?.rntrc ??
          null,

        transportadorLogradouro:
          transportador
            ?.logradouro ?? null,

        transportadorNumero:
          transportador?.numero ??
          null,

        transportadorBairro:
          transportador?.bairro ??
          null,

        transportadorMunicipio:
          transportador
            ?.municipio ?? null,

        transportadorUf:
          transportador?.uf ??
          null,

        veiculoPlaca:
          veiculo?.placa ?? null,

        veiculoRenavam:
          veiculo?.renavam ??
          null,

        veiculoUf:
          veiculo
            ?.ufLicenciamento ??
          null,

        veiculoMarcaModelo:
          veiculo?.marcaModelo ??
          null,

        veiculoTipo:
          veiculo?.tipo ?? null,

        motoristaNome:
          motorista?.nome ?? null,

        motoristaCpf:
          motorista?.cpf ?? null,

        motoristaCnh:
          motorista?.numeroCnh ??
          null,

        quantidadeVolumes:
          data.quantidadeVolumes ??
          null,

        especieVolumes:
          textoOpcional(
            data.especieVolumes
          ),

        marcaVolumes:
          textoOpcional(
            data.marcaVolumes
          ),

        numeracaoVolumes:
          textoOpcional(
            data.numeracaoVolumes
          ),

        pesoLiquido:
          data.pesoLiquido ??
          null,

        pesoBruto:
          data.pesoBruto ??
          null,
      },

      update: {
        modalidadeFrete:
          data.modalidadeFrete,

        transportadorId:
          transportador?.id ??
          null,

        veiculoId:
          veiculo?.id ?? null,

        motoristaId:
          motorista?.id ?? null,

        transportadorNome:
          transportador?.nome ??
          null,

        transportadorCpfCnpj:
          transportador
            ?.cpfCnpj ?? null,

        transportadorInscricaoEstadual:
          transportador
            ?.inscricaoEstadual ??
          null,

        transportadorRntrc:
          transportador?.rntrc ??
          null,

        transportadorLogradouro:
          transportador
            ?.logradouro ?? null,

        transportadorNumero:
          transportador?.numero ??
          null,

        transportadorBairro:
          transportador?.bairro ??
          null,

        transportadorMunicipio:
          transportador
            ?.municipio ?? null,

        transportadorUf:
          transportador?.uf ??
          null,

        veiculoPlaca:
          veiculo?.placa ?? null,

        veiculoRenavam:
          veiculo?.renavam ??
          null,

        veiculoUf:
          veiculo
            ?.ufLicenciamento ??
          null,

        veiculoMarcaModelo:
          veiculo?.marcaModelo ??
          null,

        veiculoTipo:
          veiculo?.tipo ?? null,

        motoristaNome:
          motorista?.nome ?? null,

        motoristaCpf:
          motorista?.cpf ?? null,

        motoristaCnh:
          motorista?.numeroCnh ??
          null,

        quantidadeVolumes:
          data.quantidadeVolumes ??
          null,

        especieVolumes:
          textoOpcional(
            data.especieVolumes
          ),

        marcaVolumes:
          textoOpcional(
            data.marcaVolumes
          ),

        numeracaoVolumes:
          textoOpcional(
            data.numeracaoVolumes
          ),

        pesoLiquido:
          data.pesoLiquido ??
          null,

        pesoBruto:
          data.pesoBruto ??
          null,
      },
    });

    revalidatePath(
      `/empresa/${data.empresaId}/nfe/${nota.id}`
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Erro ao salvar transporte da NF-e:",
      error
    );

    return {
      success: false,
      message:
        "Não foi possível salvar os dados de transporte da NF-e.",
    };
  }
}
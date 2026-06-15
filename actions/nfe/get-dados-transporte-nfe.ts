"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getDadosTransporteNfe(
  empresaId: string,
  notaFiscalId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const nota =
    await prisma.notaFiscal.findFirst({
      where: {
        id: notaFiscalId,
        empresaId,
        tipoDocumento: "NFE",
      },

      select: {
        id: true,
        status: true,

        transporte: {
          select: {
            id: true,

            modalidadeFrete: true,

            transportadorId: true,
            veiculoId: true,
            motoristaId: true,

            quantidadeVolumes: true,

            especieVolumes: true,
            marcaVolumes: true,
            numeracaoVolumes: true,

            pesoLiquido: true,
            pesoBruto: true,
          },
        },
      },
    });

  if (!nota) {
    return null;
  }

  const [
    transportadores,
    veiculos,
    motoristas,
  ] = await Promise.all([
    prisma.transportador.findMany({
      where: {
        empresaId,
      },

      select: {
        id: true,

        nome: true,
        nomeFantasia: true,

        cpfCnpj: true,
        rntrc: true,

        ativo: true,
      },

      orderBy: [
        {
          ativo: "desc",
        },
        {
          nome: "asc",
        },
      ],
    }),

    prisma.veiculo.findMany({
      where: {
        empresaId,
      },

      select: {
        id: true,

        transportadorId: true,

        placa: true,
        renavam: true,

        ufLicenciamento: true,

        tipo: true,
        marcaModelo: true,

        ativo: true,
      },

      orderBy: [
        {
          ativo: "desc",
        },
        {
          placa: "asc",
        },
      ],
    }),

    prisma.motorista.findMany({
      where: {
        empresaId,
      },

      select: {
        id: true,

        transportadorId: true,

        nome: true,
        cpf: true,

        numeroCnh: true,
        categoriaCnh: true,
        validadeCnh: true,

        ativo: true,
      },

      orderBy: [
        {
          ativo: "desc",
        },
        {
          nome: "asc",
        },
      ],
    }),
  ]);

  return {
    podeEditar:
      nota.status === "RASCUNHO",

    transporte: nota.transporte
      ? {
          id:
            nota.transporte.id,

          modalidadeFrete:
            nota.transporte
              .modalidadeFrete,

          transportadorId:
            nota.transporte
              .transportadorId,

          veiculoId:
            nota.transporte
              .veiculoId,

          motoristaId:
            nota.transporte
              .motoristaId,

          quantidadeVolumes:
            nota.transporte
              .quantidadeVolumes,

          especieVolumes:
            nota.transporte
              .especieVolumes,

          marcaVolumes:
            nota.transporte
              .marcaVolumes,

          numeracaoVolumes:
            nota.transporte
              .numeracaoVolumes,

          pesoLiquido:
            nota.transporte
              .pesoLiquido === null
              ? null
              : Number(
                  nota.transporte
                    .pesoLiquido
                ),

          pesoBruto:
            nota.transporte
              .pesoBruto === null
              ? null
              : Number(
                  nota.transporte
                    .pesoBruto
                ),
        }
      : null,

    transportadores,

    veiculos,

    motoristas:
      motoristas.map(
        (motorista) => ({
          ...motorista,

          validadeCnh:
            motorista.validadeCnh
              ?.toISOString() ??
            null,
        })
      ),
  };
}
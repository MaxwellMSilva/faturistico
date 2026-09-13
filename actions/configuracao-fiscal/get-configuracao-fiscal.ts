"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getConfiguracaoFiscal(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: {
        empresaId,
      },
    });

  if (!configuracao) {
    return null;
  }

  const [sequenciaNfe, maiorNumeroNfe] =
    await Promise.all([
      prisma.sequenciaFiscal.findUnique({
        where: {
          empresaId_tipoDocumento_serie: {
            empresaId,
            tipoDocumento: "NFE",
            serie: configuracao.serieNfe,
          },
        },
        select: {
          ultimoNumero: true,
        },
      }),

      prisma.notaFiscal.aggregate({
        where: {
          empresaId,
          tipoDocumento: "NFE",
          serie: configuracao.serieNfe,
        },
        _max: {
          numero: true,
        },
      }),
    ]);

  const ultimoNumeroNfe = Math.max(
    sequenciaNfe?.ultimoNumero ?? 0,
    maiorNumeroNfe._max.numero ?? 0
  );

  return {
    id: configuracao.id,

    ambiente:
      configuracao.ambiente,

    regimeTributario:
      configuracao.regimeTributario,

    serieNfe:
      configuracao.serieNfe,

    ultimoNumeroNfe,

    serieNfce:
      configuracao.serieNfce,

    idCsc:
      configuracao.idCsc,

    possuiCsc: Boolean(
      configuracao.cscCriptografado
    ),

    possuiTokenNuvemFiscal:
      Boolean(
        configuracao
          .tokenNuvemFiscalCriptografado
      ),
  };
}
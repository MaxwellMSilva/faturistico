"use server";

import {
  PrivilegioEmpresa,
  TipoDocumentoFiscal,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function getConfiguracaoFiscal(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR,
    {
      exigirEmpresaAtiva: false,
    }
  );

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: { empresaId },
    });

  if (!configuracao) {
    return null;
  }

  const sequencias =
    await prisma.sequenciaFiscal.findMany({
      where: {
        empresaId,
        OR: [
          {
            tipoDocumento:
              TipoDocumentoFiscal.NFE,
            serie:
              configuracao.serieNfe,
          },
          {
            tipoDocumento:
              TipoDocumentoFiscal.NFCE,
            serie:
              configuracao.serieNfce,
          },
          {
            tipoDocumento:
              TipoDocumentoFiscal.CTE,
            serie:
              configuracao.serieCte,
          },
          {
            tipoDocumento:
              TipoDocumentoFiscal.MDFE,
            serie:
              configuracao.serieMdfe,
          },
        ],
      },
      select: {
        tipoDocumento: true,
        serie: true,
        ultimoNumero: true,
      },
    });

  function obterProximoNumero(
    tipoDocumento: TipoDocumentoFiscal,
    serie: number
  ) {
    const sequencia =
      sequencias.find(
        (item) =>
          item.tipoDocumento ===
            tipoDocumento &&
          item.serie === serie
      );

    return (
      (sequencia?.ultimoNumero ?? 0) +
      1
    );
  }

  return {
    id: configuracao.id,
    ambiente: configuracao.ambiente,
    regimeTributario:
      configuracao.regimeTributario,

    serieNfe: configuracao.serieNfe,
    proximoNumeroNfe:
      obterProximoNumero(
        TipoDocumentoFiscal.NFE,
        configuracao.serieNfe
      ),

    serieNfce:
      configuracao.serieNfce,
    proximoNumeroNfce:
      obterProximoNumero(
        TipoDocumentoFiscal.NFCE,
        configuracao.serieNfce
      ),

    serieCte: configuracao.serieCte,
    proximoNumeroCte:
      obterProximoNumero(
        TipoDocumentoFiscal.CTE,
        configuracao.serieCte
      ),

    serieMdfe:
      configuracao.serieMdfe,
    proximoNumeroMdfe:
      obterProximoNumero(
        TipoDocumentoFiscal.MDFE,
        configuracao.serieMdfe
      ),

    rntrc: configuracao.rntrc,

    idCsc: configuracao.idCsc,
    possuiCsc: Boolean(
      configuracao.cscCriptografado
    ),
    possuiTokenNuvemFiscal: Boolean(
      configuracao
        .tokenNuvemFiscalCriptografado
    ),
  };
}

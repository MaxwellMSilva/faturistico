"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function getResumoConfiguracaoCte(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR,
    { exigirEmpresaAtiva: false }
  );

  const [configuracao, certificado] =
    await Promise.all([
      prisma.configuracaoFiscal.findUnique({
        where: { empresaId },
        select: {
          ambiente: true,
          regimeTributario: true,
          serieCte: true,
          rntrc: true,
        },
      }),
      prisma.certificadoDigital.findFirst({
        where: {
          empresaId,
          ativo: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          validadeFim: true,
        },
      }),
    ]);

  return {
    configuracao,
    possuiCertificado: Boolean(certificado),
    certificadoExpirado:
      certificado
        ? certificado.validadeFim.getTime() <=
          Date.now()
        : false,
    validadeCertificado:
      certificado?.validadeFim ?? null,
  };
}

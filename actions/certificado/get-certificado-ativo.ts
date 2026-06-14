"use server";

import { prisma } from "@/lib/prisma";

import { validarAcessoEmpresa } from "@/lib/empresa/validar-acesso-empresa";

export async function getCertificadoAtivo(
  empresaId: string
) {
  await validarAcessoEmpresa(
    empresaId
  );

  const certificado =
    await prisma.certificadoDigital.findFirst({
      where: {
        empresaId,
        ativo: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        nomeArquivo: true,
        titular: true,
        cnpjTitular: true,
        emitidoPor: true,
        serialNumber: true,
        validadeInicio: true,
        validadeFim: true,
      },
    });

  if (!certificado) {
    return null;
  }

  const diferenca =
    certificado.validadeFim.getTime() -
    Date.now();

  const diasParaExpirar =
    Math.ceil(
      diferenca /
        (1000 * 60 * 60 * 24)
    );

  return {
    ...certificado,

    validadeInicio:
      certificado.validadeInicio
        .toISOString(),

    validadeFim:
      certificado.validadeFim
        .toISOString(),

    diasParaExpirar,
  };
}
"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { carregarCertificadoA1Cte } from "@/lib/cte/certificado-a1";
import { consultarStatusSefazCte } from "@/lib/cte/sefaz";
import {
  CODIGOS_UF,
  extrairTagXml,
} from "@/lib/cte/util";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function consultarStatusServicoCte(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR
  );

  const empresa =
    await prisma.empresa.findUnique({
      where: { id: empresaId },
      include: {
        configuracaoFiscal: true,
      },
    });

  if (!empresa) {
    return {
      success: false as const,
      message: "Empresa não encontrada.",
    };
  }

  if (!empresa.configuracaoFiscal) {
    return {
      success: false as const,
      message:
        "Configure o ambiente fiscal da empresa.",
    };
  }

  const uf = empresa.uf?.toUpperCase();
  const codigoUf = uf
    ? CODIGOS_UF[uf]
    : undefined;

  if (!uf || !codigoUf) {
    return {
      success: false as const,
      message:
        "Informe uma UF válida para a empresa.",
    };
  }

  try {
    const certificado =
      await carregarCertificadoA1Cte(
        empresaId
      );

    const resposta =
      await consultarStatusSefazCte({
        uf,
        codigoUf,
        ambiente:
          empresa.configuracaoFiscal
            .ambiente,
        certificado,
      });

    const codigo =
      extrairTagXml(
        resposta,
        "cStat"
      );

    const motivo =
      extrairTagXml(
        resposta,
        "xMotivo"
      );

    return {
      success: codigo === "107",
      codigo,
      message:
        motivo ||
        "Status consultado.",
    } as const;
  } catch (error) {
    console.error(
      "Erro ao consultar status CT-e:",
      error
    );

    return {
      success: false as const,
      message:
        "Não foi possível consultar o status do serviço de CT-e.",
    };
  }
}

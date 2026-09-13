"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { carregarCertificadoA1Cte } from "@/lib/cte/certificado-a1";
import { interpretarRetornoCte } from "@/lib/cte/retorno-sefaz";
import { consultarCteSefaz } from "@/lib/cte/sefaz";
import { extrairTagXml } from "@/lib/cte/util";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function consultarCte(
  empresaId: string,
  cteId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR,
    { exigirEmpresaAtiva: false }
  );

  const cte =
    await prisma.conhecimentoTransporte.findFirst({
      where: {
        id: cteId,
        empresaId,
      },
      include: {
        empresa: {
          include: {
            configuracaoFiscal: true,
          },
        },
      },
    });

  if (!cte) {
    return {
      success: false as const,
      message: "CT-e não encontrado.",
    };
  }

  if (!cte.chaveAcesso) {
    return {
      success: false as const,
      message:
        "Este CT-e ainda não possui chave de acesso para consulta.",
    };
  }

  const configuracao =
    cte.empresa.configuracaoFiscal;

  if (!configuracao) {
    return {
      success: false as const,
      message:
        "Configuração fiscal não encontrada.",
    };
  }

  const uf =
    cte.empresa.uf?.toUpperCase();

  if (!uf) {
    return {
      success: false as const,
      message:
        "A UF da empresa emitente não está cadastrada.",
    };
  }

  try {
    const certificado =
      await carregarCertificadoA1Cte(
        empresaId
      );

    const resposta =
      await consultarCteSefaz({
        chaveAcesso: cte.chaveAcesso,
        uf,
        ambiente:
          configuracao.ambiente,
        certificado,
      });

    const retorno =
      interpretarRetornoCte(resposta);

    const cancelado =
      /<tpEvento>110111<\/tpEvento>/i.test(
        resposta
      ) &&
      /<cStat>135<\/cStat>/i.test(
        resposta
      );

    const cStatRaiz =
      extrairTagXml(
        resposta,
        "cStat"
      );

    let status = cte.status;

    if (cancelado) {
      status = "CANCELADO";
    } else if (
      retorno.cStat === "100"
    ) {
      status = "AUTORIZADO";
    } else if (
      cStatRaiz === "101"
    ) {
      status = "CANCELADO";
    }

    await prisma.conhecimentoTransporte.update({
      where: { id: cteId },
      data: {
        status,
        codigoStatusSefaz:
          retorno.cStat ??
          cStatRaiz,
        motivoStatusSefaz:
          retorno.xMotivo ??
          extrairTagXml(
            resposta,
            "xMotivo"
          ),
        versaoAplicacaoSefaz:
          retorno.verAplic,
        protocoloAutorizacao:
          retorno.nProt ??
          cte.protocoloAutorizacao,
        dataAutorizacao:
          retorno.dhRecbto
            ? new Date(
                retorno.dhRecbto
              )
            : cte.dataAutorizacao,
        xmlRetornoSefaz:
          resposta,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/cte`
    );
    revalidatePath(
      `/empresa/${empresaId}/cte/${cteId}`
    );

    return {
      success: true as const,
      status,
      codigo:
        retorno.cStat ??
        cStatRaiz,
      message:
        retorno.xMotivo ??
        extrairTagXml(
          resposta,
          "xMotivo"
        ) ??
        "Consulta realizada com sucesso.",
    };
  } catch (error) {
    console.error(
      "Erro ao consultar CT-e na SEFAZ:",
      error
    );

    return {
      success: false as const,
      message:
        "Não foi possível consultar o CT-e na SEFAZ.",
    };
  }
}

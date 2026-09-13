"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assinarEventoCteXml } from "@/lib/cte/assinatura-xml";
import { carregarCertificadoA1Cte } from "@/lib/cte/certificado-a1";
import { interpretarRetornoEventoCte } from "@/lib/cte/retorno-sefaz";
import { enviarEventoCteSefaz } from "@/lib/cte/sefaz";
import {
  formatarDataHoraCte,
  somenteNumeros,
  tag,
} from "@/lib/cte/util";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

const NAMESPACE_CTE =
  "http://www.portalfiscal.inf.br/cte";

export async function cancelarCte(
  empresaId: string,
  cteId: string,
  justificativa: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_CANCELAR
  );

  const motivo = justificativa.trim();

  if (
    motivo.length < 15 ||
    motivo.length > 255
  ) {
    return {
      success: false as const,
      message:
        "A justificativa do cancelamento deve possuir entre 15 e 255 caracteres.",
    };
  }

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

  if (cte.status !== "AUTORIZADO") {
    return {
      success: false as const,
      message:
        "Somente um CT-e autorizado pode ser cancelado.",
    };
  }

  if (
    !cte.chaveAcesso ||
    !cte.protocoloAutorizacao
  ) {
    return {
      success: false as const,
      message:
        "O CT-e autorizado não possui chave ou protocolo para cancelamento.",
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
        "Informe a UF da empresa emitente.",
    };
  }

  const cnpj = somenteNumeros(
    cte.empresa.cnpj
  );

  if (cnpj.length !== 14) {
    return {
      success: false as const,
      message:
        "O CNPJ da empresa emitente é inválido.",
    };
  }

  const tipoEvento = "110111";
  const sequencia = 1;
  const idEvento =
    `ID${tipoEvento}${cte.chaveAcesso}${String(
      sequencia
    ).padStart(2, "0")}`;

  const tpAmb =
    configuracao.ambiente ===
    "HOMOLOGACAO"
      ? "2"
      : "1";

  const xmlEvento =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<eventoCTe versao="4.00" xmlns="${NAMESPACE_CTE}">` +
    `<infEvento xmlns="${NAMESPACE_CTE}" Id="${idEvento}">` +
    tag(
      "cOrgao",
      cte.chaveAcesso.slice(0, 2)
    ) +
    tag("tpAmb", tpAmb) +
    tag("CNPJ", cnpj) +
    tag("chCTe", cte.chaveAcesso) +
    tag(
      "dhEvento",
      formatarDataHoraCte(new Date())
    ) +
    tag("tpEvento", tipoEvento) +
    tag("nSeqEvento", sequencia) +
    `<detEvento versaoEvento="4.00">` +
    `<evCancCTe>` +
    tag("descEvento", "Cancelamento") +
    tag(
      "nProt",
      cte.protocoloAutorizacao
    ) +
    tag("xJust", motivo) +
    `</evCancCTe>` +
    `</detEvento>` +
    `</infEvento>` +
    `</eventoCTe>`;

  try {
    const certificado =
      await carregarCertificadoA1Cte(
        empresaId
      );

    const xmlAssinado =
      assinarEventoCteXml({
        xml: xmlEvento,
        certificadoBase64:
          certificado.certificadoBase64,
        chavePrivadaPem:
          certificado.chavePrivadaPem,
      });

    await prisma.eventoCte.upsert({
      where: {
        cteId_tipo_sequencia: {
          cteId,
          tipo: "CANCELAMENTO",
          sequencia,
        },
      },
      create: {
        cteId,
        tipo: "CANCELAMENTO",
        sequencia,
        status: "PENDENTE",
        xmlEnvio: xmlAssinado,
      },
      update: {
        status: "PENDENTE",
        codigoStatus: null,
        motivo: null,
        protocolo: null,
        xmlEnvio: xmlAssinado,
        xmlRetorno: null,
      },
    });

    const resposta =
      await enviarEventoCteSefaz({
        xmlEventoAssinado: xmlAssinado,
        uf,
        ambiente:
          configuracao.ambiente,
        certificado,
      });

    const retorno =
      interpretarRetornoEventoCte(
        resposta
      );

    const homologado =
      retorno.cStat === "135";

    await prisma.eventoCte.update({
      where: {
        cteId_tipo_sequencia: {
          cteId,
          tipo: "CANCELAMENTO",
          sequencia,
        },
      },
      data: {
        status: homologado
          ? "AUTORIZADO"
          : "REJEITADO",
        codigoStatus:
          retorno.cStat,
        motivo: retorno.xMotivo,
        protocolo: retorno.nProt,
        xmlRetorno: resposta,
      },
    });

    if (homologado) {
      await prisma.conhecimentoTransporte.update({
        where: { id: cteId },
        data: {
          status: "CANCELADO",
          protocoloCancelamento:
            retorno.nProt,
          dataCancelamento:
            retorno.dhRegEvento
              ? new Date(
                  retorno.dhRegEvento
                )
              : new Date(),
          codigoStatusSefaz:
            retorno.cStat,
          motivoStatusSefaz:
            retorno.xMotivo,
          xmlEventoCancelamento:
            xmlAssinado,
          xmlRetornoSefaz:
            resposta,
        },
      });
    }

    revalidatePath(
      `/empresa/${empresaId}/cte`
    );
    revalidatePath(
      `/empresa/${empresaId}/cte/${cteId}`
    );

    if (!homologado) {
      return {
        success: false as const,
        message:
          retorno.cStat
            ? `${retorno.cStat} - ${retorno.xMotivo || "Cancelamento rejeitado pela SEFAZ."}`
            : "A SEFAZ retornou uma resposta não reconhecida para o cancelamento.",
      };
    }

    return {
      success: true as const,
      message:
        retorno.xMotivo ||
        "Cancelamento homologado pela SEFAZ.",
      protocolo:
        retorno.nProt,
    };
  } catch (error) {
    console.error(
      "Erro ao cancelar CT-e:",
      error
    );

    await prisma.eventoCte.updateMany({
      where: {
        cteId,
        tipo: "CANCELAMENTO",
        sequencia,
        status: "PENDENTE",
      },
      data: {
        motivo:
          "Falha de comunicação ou processamento. Consulte a situação do CT-e antes de tentar novamente.",
      },
    });

    return {
      success: false as const,
      message:
        "Não foi possível concluir o cancelamento. Consulte a situação do CT-e na SEFAZ antes de reenviar o evento.",
    };
  }
}

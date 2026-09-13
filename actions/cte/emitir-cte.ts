"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { assinarCteXml } from "@/lib/cte/assinatura-xml";
import { carregarCertificadoA1Cte } from "@/lib/cte/certificado-a1";
import { gerarXmlCte } from "@/lib/cte/gerar-xml";
import {
  interpretarRetornoCte,
  montarCteProcessado,
} from "@/lib/cte/retorno-sefaz";
import { transmitirCteSefaz } from "@/lib/cte/sefaz";
import { validarCte } from "@/lib/cte/validar-cte";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";

export async function emitirCte(
  empresaId: string,
  cteId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_EMITIR
  );

  const cte =
    await prisma.conhecimentoTransporte.findFirst({
      where: {
        id: cteId,
        empresaId,
      },
      include: {
        participantes: true,
        documentosNfe: true,
        quantidadesCarga: true,
        componentesValor: true,
        empresa: true,
      },
    });

  if (!cte) {
    return {
      success: false as const,
      message: "CT-e não encontrado.",
    };
  }

  if (
    ![
      "RASCUNHO",
      "VALIDADO",
      "REJEITADO",
    ].includes(cte.status)
  ) {
    return {
      success: false as const,
      message:
        "Este CT-e não está em uma situação que permita emissão.",
    };
  }

  const configuracao =
    await prisma.configuracaoFiscal.findUnique({
      where: { empresaId },
    });

  const erros = validarCte({
    cte,
    empresa: cte.empresa,
    configuracao,
  });

  if (erros.length > 0) {
    return {
      success: false as const,
      message:
        "Corrija as pendências do CT-e antes de transmitir.",
      erros,
    };
  }

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

  try {
    const [gerado, certificado] =
      await Promise.all([
        gerarXmlCte(cteId),
        carregarCertificadoA1Cte(
          empresaId
        ),
      ]);

    const xmlAssinado = assinarCteXml({
      xml: gerado.xml,
      certificadoBase64:
        certificado.certificadoBase64,
      chavePrivadaPem:
        certificado.chavePrivadaPem,
    });

    await prisma.conhecimentoTransporte.update({
      where: { id: cteId },
      data: {
        status: "PROCESSANDO",
        chaveAcesso: gerado.chaveAcesso,
        numeroAleatorio:
          gerado.codigoNumerico,
        qrCode: gerado.qrCode,
        xmlGerado: gerado.xml,
        xmlAssinado,
        motivoRejeicao: null,
      },
    });

    let resposta: string;

    try {
      resposta = await transmitirCteSefaz({
        xmlAssinado,
        uf,
        ambiente: configuracao.ambiente,
        certificado,
      });
    } catch (error) {
      await prisma.conhecimentoTransporte.update({
        where: { id: cteId },
        data: {
          status: "VALIDADO",
          motivoStatusSefaz:
            "Falha de comunicação com a SEFAZ. O documento não foi marcado como rejeitado.",
        },
      });

      console.error(
        "Erro de comunicação com a SEFAZ CT-e:",
        error
      );

      return {
        success: false as const,
        message:
          "Não foi possível comunicar com a SEFAZ. O CT-e continua validado e pode ser transmitido novamente.",
      };
    }

    const retorno =
      interpretarRetornoCte(resposta);

    const autorizado =
      retorno.cStat === "100" &&
      Boolean(retorno.nProt) &&
      Boolean(retorno.protocoloXml);

    if (autorizado) {
      const xmlAutorizado =
        montarCteProcessado({
          xmlAssinado,
          protocoloXml:
            retorno.protocoloXml!,
        });

      await prisma.conhecimentoTransporte.update({
        where: { id: cteId },
        data: {
          status: "AUTORIZADO",
          protocoloAutorizacao:
            retorno.nProt,
          dataAutorizacao:
            retorno.dhRecbto
              ? new Date(
                  retorno.dhRecbto
                )
              : new Date(),
          codigoStatusSefaz:
            retorno.cStat,
          motivoStatusSefaz:
            retorno.xMotivo,
          versaoAplicacaoSefaz:
            retorno.verAplic,
          motivoRejeicao: null,
          xmlRetornoSefaz: resposta,
          xmlAutorizado,
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
        autorizado: true as const,
        message:
          retorno.xMotivo ||
          "CT-e autorizado pela SEFAZ.",
        protocolo: retorno.nProt,
        chaveAcesso:
          gerado.chaveAcesso,
      };
    }

    await prisma.conhecimentoTransporte.update({
      where: { id: cteId },
      data: {
        status: "REJEITADO",
        codigoStatusSefaz:
          retorno.cStat,
        motivoStatusSefaz:
          retorno.xMotivo,
        versaoAplicacaoSefaz:
          retorno.verAplic,
        motivoRejeicao:
          retorno.xMotivo ||
          "Rejeição retornada pela SEFAZ.",
        xmlRetornoSefaz: resposta,
      },
    });

    revalidatePath(
      `/empresa/${empresaId}/cte`
    );
    revalidatePath(
      `/empresa/${empresaId}/cte/${cteId}`
    );

    return {
      success: false as const,
      autorizado: false as const,
      message:
        retorno.cStat
          ? `${retorno.cStat} - ${retorno.xMotivo || "CT-e rejeitado pela SEFAZ."}`
          : "A SEFAZ retornou uma resposta não reconhecida.",
    };
  } catch (error) {
    console.error(
      "Erro ao preparar emissão do CT-e:",
      error
    );

    const mensagem =
      error instanceof Error
        ? error.message
        : "";

    if (
      mensagem ===
      "CERTIFICADO_DIGITAL_NAO_CONFIGURADO"
    ) {
      return {
        success: false as const,
        message:
          "Cadastre um certificado digital A1 antes de emitir o CT-e.",
      };
    }

    if (
      mensagem ===
      "CERTIFICADO_DIGITAL_EXPIRADO"
    ) {
      return {
        success: false as const,
        message:
          "O certificado digital está expirado.",
      };
    }

    return {
      success: false as const,
      message:
        "Não foi possível preparar o CT-e para transmissão.",
    };
  }
}

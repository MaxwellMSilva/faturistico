"use server";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { carregarCertificadoA1Cte } from "@/lib/cte/certificado-a1";
import {
  extrairDadosNfeParaCte,
  type DadosNfeParaCte,
} from "@/lib/cte/nfe-origem";
import {
  somenteNumeros,
  validarChaveAcesso,
} from "@/lib/cte/util";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { buscarXmlNfePorChave } from "@/lib/nfe/distribuicao-dfe";

function mensagemErroNfe(
  error: unknown
) {
  const codigo =
    error instanceof Error
      ? error.message
      : "";

  if (
    codigo === "XML_NFE_VAZIO" ||
    codigo === "XML_NFE_INVALIDO"
  ) {
    return "O arquivo informado não contém uma NF-e válida.";
  }

  if (
    codigo ===
    "XML_NAO_E_NFE_MODELO_55"
  ) {
    return "O XML informado não é de uma NF-e modelo 55.";
  }

  if (
    codigo ===
    "XML_NFE_SEM_PROTOCOLO_AUTORIZACAO"
  ) {
    return "Use o XML autorizado da NF-e, contendo o protocolo de autorização.";
  }

  if (
    codigo ===
    "XML_NFE_NAO_AUTORIZADO"
  ) {
    return "A NF-e informada não está autorizada.";
  }

  if (
    codigo === "CHAVE_NFE_INVALIDA"
  ) {
    return "A chave da NF-e é inválida.";
  }

  if (
    codigo ===
    "CERTIFICADO_DIGITAL_NAO_CONFIGURADO"
  ) {
    return "Configure um certificado digital A1 para consultar a NF-e pela chave.";
  }

  if (
    codigo ===
    "CERTIFICADO_DIGITAL_EXPIRADO"
  ) {
    return "O certificado digital A1 está expirado.";
  }

  if (
    codigo.startsWith(
      "NFE_DISTRIBUICAO_137"
    )
  ) {
    return "Nenhuma NF-e foi localizada para essa chave e para este CNPJ interessado.";
  }

  if (
    codigo.startsWith(
      "NFE_DISTRIBUICAO_656"
    )
  ) {
    return "A consulta foi temporariamente bloqueada pelo Ambiente Nacional por consumo indevido. Aguarde o prazo informado pela SEFAZ antes de tentar novamente.";
  }

  if (
    codigo.startsWith(
      "NFE_DISTRIBUICAO_XML_COMPLETO_INDISPONIVEL"
    )
  ) {
    return "A SEFAZ localizou a NF-e, mas não disponibilizou o XML completo para esta empresa. Verifique se ela consta como destinatária, transportadora ou autorizada no XML.";
  }

  if (
    codigo.startsWith(
      "NFE_DISTRIBUICAO_"
    )
  ) {
    const detalhe =
      codigo.split(":")
        .slice(1)
        .join(":")
        .trim();

    return detalhe ||
      "Não foi possível obter a NF-e no Ambiente Nacional.";
  }

  return "Não foi possível processar a NF-e informada.";
}

async function validarAcesso(
  empresaId: string
) {
  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_CRIAR
  );
}

export async function processarXmlNfeParaCte({
  empresaId,
  xml,
}: {
  empresaId: string;
  xml: string;
}) {
  await validarAcesso(empresaId);

  if (
    !xml ||
    xml.length > 10_000_000
  ) {
    return {
      success: false as const,
      message:
        "O XML da NF-e é inválido ou excede o tamanho permitido.",
    };
  }

  try {
    const dados: DadosNfeParaCte =
      extrairDadosNfeParaCte(xml);

    return {
      success: true as const,
      dados,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        mensagemErroNfe(error),
    };
  }
}

export async function buscarNfePorChaveParaCte({
  empresaId,
  chaveAcesso,
}: {
  empresaId: string;
  chaveAcesso: string;
}) {
  await validarAcesso(empresaId);

  const chave =
    somenteNumeros(chaveAcesso);

  if (!validarChaveAcesso(chave)) {
    return {
      success: false as const,
      message:
        "Informe uma chave de NF-e válida com 44 dígitos.",
    };
  }

  const [empresa, configuracao] =
    await Promise.all([
      prisma.empresa.findUnique({
        where: { id: empresaId },
        select: {
          cnpj: true,
          uf: true,
        },
      }),
      prisma.configuracaoFiscal.findUnique({
        where: { empresaId },
        select: {
          ambiente: true,
        },
      }),
    ]);

  if (!empresa?.uf) {
    return {
      success: false as const,
      message:
        "Complete a UF da empresa antes de consultar NF-e pela chave.",
    };
  }

  if (!configuracao) {
    return {
      success: false as const,
      message:
        "Configure o ambiente fiscal da empresa antes de consultar a NF-e.",
    };
  }

  try {
    const certificado =
      await carregarCertificadoA1Cte(
        empresaId
      );

    const xml =
      await buscarXmlNfePorChave({
        empresaCnpj: empresa.cnpj,
        empresaUf: empresa.uf,
        ambiente:
          configuracao.ambiente,
        chaveAcesso: chave,
        certificado,
      });

    const dados =
      extrairDadosNfeParaCte(xml);

    return {
      success: true as const,
      dados,
    };
  } catch (error) {
    console.error(
      "Erro ao consultar NF-e para iniciar CT-e:",
      error
    );

    return {
      success: false as const,
      message:
        mensagemErroNfe(error),
    };
  }
}

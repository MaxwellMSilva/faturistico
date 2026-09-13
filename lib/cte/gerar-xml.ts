import { prisma } from "@/lib/prisma";
import { gerarChaveAcessoCte } from "@/lib/cte/chave-acesso";
import {
  CODIGOS_UF,
  escaparXml,
  formatarDataHoraCte,
  formatarDecimal,
  somenteNumeros,
  tag,
} from "@/lib/cte/util";

const NAMESPACE_CTE =
  "http://www.portalfiscal.inf.br/cte";

const HOMOLOGACAO_NOME =
  "CT-E EMITIDO EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL";

const CODIGO_UNIDADE = {
  METRO_CUBICO: "00",
  QUILOGRAMA: "01",
  TONELADA: "02",
  UNIDADE: "03",
  LITRO: "04",
  MMBTU: "05",
} as const;

const CODIGO_TIPO_SERVICO = {
  NORMAL: "0",
  SUBCONTRATACAO: "1",
  REDESPACHO: "2",
  REDESPACHO_INTERMEDIARIO: "3",
  SERVICO_VINCULADO_MULTIMODAL: "4",
} as const;

const CODIGO_TOMADOR = {
  REMETENTE: "0",
  EXPEDIDOR: "1",
  RECEBEDOR: "2",
  DESTINATARIO: "3",
} as const;

function tagDocumento(
  documento: string
) {
  const numeros = somenteNumeros(documento);

  if (numeros.length === 14) {
    return tag("CNPJ", numeros);
  }

  return tag("CPF", numeros);
}

function indicadorIe(
  ie: string | null | undefined
) {
  const valor = ie?.trim().toUpperCase();

  if (!valor) {
    return "9";
  }

  if (valor === "ISENTO") {
    return "2";
  }

  return "1";
}

function gerarEnderecoParticipante(
  nomeTag: string,
  participante: {
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    codigoMunicipio: string;
    municipio: string;
    cep: string | null;
    uf: string;
    codigoPais: string;
    pais: string;
  }
) {
  return (
    `<${nomeTag}>` +
    tag("xLgr", participante.logradouro) +
    tag("nro", participante.numero) +
    tag("xCpl", participante.complemento) +
    tag("xBairro", participante.bairro) +
    tag(
      "cMun",
      somenteNumeros(
        participante.codigoMunicipio
      )
    ) +
    tag("xMun", participante.municipio) +
    tag("CEP", somenteNumeros(participante.cep)) +
    tag("UF", participante.uf.toUpperCase()) +
    tag(
      "cPais",
      somenteNumeros(participante.codigoPais) ||
        "1058"
    ) +
    tag("xPais", participante.pais || "BRASIL") +
    `</${nomeTag}>`
  );
}

function gerarParticipante(
  nomeTag: "rem" | "exped" | "receb" | "dest",
  participante: {
    cpfCnpj: string;
    inscricaoEstadual: string | null;
    nome: string;
    nomeFantasia: string | null;
    telefone: string | null;
    email: string | null;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    codigoMunicipio: string;
    municipio: string;
    cep: string | null;
    uf: string;
    codigoPais: string;
    pais: string;
  },
  homologacao: boolean
) {
  const enderecos = {
    rem: "enderReme",
    exped: "enderExped",
    receb: "enderReceb",
    dest: "enderDest",
  } as const;

  return (
    `<${nomeTag}>` +
    tagDocumento(participante.cpfCnpj) +
    tag("IE", participante.inscricaoEstadual) +
    tag(
      "xNome",
      homologacao
        ? HOMOLOGACAO_NOME
        : participante.nome
    ) +
    tag("xFant", participante.nomeFantasia) +
    tag("fone", somenteNumeros(participante.telefone)) +
    gerarEnderecoParticipante(
      enderecos[nomeTag],
      participante
    ) +
    tag("email", participante.email) +
    `</${nomeTag}>`
  );
}

function gerarIcms(
  cte: {
    grupoIcms: string;
    cstIcms: string;
    percentualReducaoBc: unknown;
    baseCalculoIcms: unknown;
    aliquotaIcms: unknown;
    valorIcms: unknown;
    valorCreditoIcms: unknown;
    baseCalculoStRetido: unknown;
    aliquotaStRetido: unknown;
    valorIcmsStRetido: unknown;
    codigoBeneficioFiscal: string | null;
  }
) {
  const cst =
    somenteNumeros(cte.cstIcms)
      .padStart(2, "0")
      .slice(-2);

  switch (cte.grupoIcms) {
    case "ICMS00":
      return (
        `<ICMS00>` +
        tag("CST", "00") +
        tag("vBC", formatarDecimal(cte.baseCalculoIcms)) +
        tag("pICMS", formatarDecimal(cte.aliquotaIcms)) +
        tag("vICMS", formatarDecimal(cte.valorIcms)) +
        `</ICMS00>`
      );

    case "ICMS20":
      return (
        `<ICMS20>` +
        tag("CST", "20") +
        tag("pRedBC", formatarDecimal(cte.percentualReducaoBc)) +
        tag("vBC", formatarDecimal(cte.baseCalculoIcms)) +
        tag("pICMS", formatarDecimal(cte.aliquotaIcms)) +
        tag("vICMS", formatarDecimal(cte.valorIcms)) +
        tag("cBenef", cte.codigoBeneficioFiscal) +
        `</ICMS20>`
      );

    case "ICMS45":
      return (
        `<ICMS45>` +
        tag("CST", cst || "40") +
        tag("cBenef", cte.codigoBeneficioFiscal) +
        `</ICMS45>`
      );

    case "ICMS60":
      return (
        `<ICMS60>` +
        tag("CST", "60") +
        tag("vBCSTRet", formatarDecimal(cte.baseCalculoStRetido)) +
        tag("vICMSSTRet", formatarDecimal(cte.valorIcmsStRetido)) +
        tag("pICMSSTRet", formatarDecimal(cte.aliquotaStRetido)) +
        (cte.valorCreditoIcms !== null
          ? tag("vCred", formatarDecimal(cte.valorCreditoIcms))
          : "") +
        `</ICMS60>`
      );

    case "ICMS90":
      return (
        `<ICMS90>` +
        tag("CST", "90") +
        (cte.percentualReducaoBc !== null
          ? tag("pRedBC", formatarDecimal(cte.percentualReducaoBc))
          : "") +
        tag("vBC", formatarDecimal(cte.baseCalculoIcms)) +
        tag("pICMS", formatarDecimal(cte.aliquotaIcms)) +
        tag("vICMS", formatarDecimal(cte.valorIcms)) +
        (cte.valorCreditoIcms !== null
          ? tag("vCred", formatarDecimal(cte.valorCreditoIcms))
          : "") +
        tag("cBenef", cte.codigoBeneficioFiscal) +
        `</ICMS90>`
      );

    case "ICMS_OUTRA_UF":
      return (
        `<ICMSOutraUF>` +
        tag("CST", "90") +
        (cte.percentualReducaoBc !== null
          ? tag("pRedBCOutraUF", formatarDecimal(cte.percentualReducaoBc))
          : "") +
        tag("vBCOutraUF", formatarDecimal(cte.baseCalculoIcms)) +
        tag("pICMSOutraUF", formatarDecimal(cte.aliquotaIcms)) +
        tag("vICMSOutraUF", formatarDecimal(cte.valorIcms)) +
        `</ICMSOutraUF>`
      );

    case "ICMSSN":
    default:
      return (
        `<ICMSSN>` +
        tag("CST", "90") +
        tag("indSN", "1") +
        `</ICMSSN>`
      );
  }
}

function gerarIcmsUfFim(
  cte: {
    baseCalculoUfFim: unknown;
    percentualFcpUfFim: unknown;
    percentualIcmsUfFim: unknown;
    percentualIcmsInterestadual: unknown;
    valorFcpUfFim: unknown;
    valorIcmsUfFim: unknown;
    valorIcmsUfInicio: unknown;
  }
) {
  if (cte.baseCalculoUfFim === null) {
    return "";
  }

  return (
    `<ICMSUFFim>` +
    tag("vBCUFFim", formatarDecimal(cte.baseCalculoUfFim)) +
    tag("pFCPUFFim", formatarDecimal(cte.percentualFcpUfFim)) +
    tag("pICMSUFFim", formatarDecimal(cte.percentualIcmsUfFim)) +
    tag("pICMSInter", formatarDecimal(cte.percentualIcmsInterestadual)) +
    tag("vFCPUFFim", formatarDecimal(cte.valorFcpUfFim)) +
    tag("vICMSUFFim", formatarDecimal(cte.valorIcmsUfFim)) +
    tag("vICMSUFIni", formatarDecimal(cte.valorIcmsUfInicio)) +
    `</ICMSUFFim>`
  );
}

function gerarIbsCbs(
  cte: {
    cstIbsCbs: string | null;
    classificacaoTributariaIbsCbs: string | null;
    baseCalculoIbsCbs: unknown;
    aliquotaIbsUf: unknown;
    valorIbsUf: unknown;
    aliquotaIbsMunicipio: unknown;
    valorIbsMunicipio: unknown;
    valorIbs: unknown;
    aliquotaCbs: unknown;
    valorCbs: unknown;
    valorTotalDfe: unknown;
    valorPrestacao: unknown;
  }
) {
  if (
    !cte.cstIbsCbs ||
    !cte.classificacaoTributariaIbsCbs
  ) {
    return {
      grupo: "",
      total: "",
    };
  }

  let grupoEspecifico = "";

  if (cte.baseCalculoIbsCbs !== null) {
    grupoEspecifico =
      `<gIBSCBS>` +
      tag("vBC", formatarDecimal(cte.baseCalculoIbsCbs)) +
      `<gIBSUF>` +
      tag("pIBSUF", formatarDecimal(cte.aliquotaIbsUf, 4)) +
      tag("vIBSUF", formatarDecimal(cte.valorIbsUf)) +
      `</gIBSUF>` +
      `<gIBSMun>` +
      tag("pIBSMun", formatarDecimal(cte.aliquotaIbsMunicipio, 4)) +
      tag("vIBSMun", formatarDecimal(cte.valorIbsMunicipio)) +
      `</gIBSMun>` +
      tag("vIBS", formatarDecimal(cte.valorIbs)) +
      `<gCBS>` +
      tag("pCBS", formatarDecimal(cte.aliquotaCbs, 4)) +
      tag("vCBS", formatarDecimal(cte.valorCbs)) +
      `</gCBS>` +
      `</gIBSCBS>`;
  }

  const valorTotal =
    cte.valorTotalDfe !== null
      ? Number(cte.valorTotalDfe)
      : Number(cte.valorPrestacao) +
        Number(cte.valorIbs ?? 0) +
        Number(cte.valorCbs ?? 0);

  return {
    grupo:
      `<IBSCBS>` +
      tag(
        "CST",
        somenteNumeros(cte.cstIbsCbs)
          .padStart(3, "0")
          .slice(-3)
      ) +
      tag(
        "cClassTrib",
        somenteNumeros(
          cte.classificacaoTributariaIbsCbs
        )
          .padStart(6, "0")
          .slice(-6)
      ) +
      grupoEspecifico +
      `</IBSCBS>`,
    total: tag(
      "vTotDFe",
      formatarDecimal(valorTotal)
    ),
  };
}

export async function gerarXmlCte(
  cteId: string
) {
  const cte =
    await prisma.conhecimentoTransporte.findUnique({
      where: { id: cteId },
      include: {
        empresa: {
          include: {
            configuracaoFiscal: true,
          },
        },
        participantes: true,
        documentosNfe: true,
        quantidadesCarga: true,
        componentesValor: true,
        pagamentosVinculados: true,
      },
    });

  if (!cte) {
    throw new Error("CTE_NAO_ENCONTRADO");
  }

  if (cte.tipoCte !== "NORMAL") {
    throw new Error(
      "EMISSAO_TIPO_CTE_NAO_IMPLEMENTADA"
    );
  }

  const configuracao =
    cte.empresa.configuracaoFiscal;

  if (!configuracao) {
    throw new Error(
      "CONFIGURACAO_FISCAL_NAO_ENCONTRADA"
    );
  }

  const ufEmitente =
    cte.empresa.uf?.toUpperCase() ?? "";

  const codigoUf = CODIGOS_UF[ufEmitente];

  if (!codigoUf) {
    throw new Error("UF_EMITENTE_INVALIDA");
  }

  const numeroAleatorio =
    cte.numeroAleatorio ?? "00000000";

  const chaveInfo =
    gerarChaveAcessoCte({
      uf: ufEmitente,
      cnpj: cte.empresa.cnpj,
      dataEmissao: cte.dataEmissao,
      serie: cte.serie,
      numero: cte.numero,
      codigoNumerico: numeroAleatorio,
    });

  const homologacao =
    configuracao.ambiente ===
    "HOMOLOGACAO";

  const tpAmb = homologacao ? "2" : "1";

  const participantes =
    new Map(
      cte.participantes.map((item) => [
        item.papel,
        item,
      ])
    );

  const remetente =
    participantes.get("REMETENTE");
  const destinatario =
    participantes.get("DESTINATARIO");

  if (!remetente || !destinatario) {
    throw new Error(
      "PARTICIPANTES_OBRIGATORIOS_AUSENTES"
    );
  }

  const papelTomador =
    cte.tomadorServico === "OUTROS"
      ? "TOMADOR_OUTROS"
      : cte.tomadorServico;

  const tomador =
    participantes.get(papelTomador);

  if (!tomador) {
    throw new Error("TOMADOR_NAO_ENCONTRADO");
  }

  const indIEToma =
    indicadorIe(tomador.inscricaoEstadual);

  let grupoTomador = "";

  if (cte.tomadorServico === "OUTROS") {
    grupoTomador =
      `<toma4>` +
      tag("toma", "4") +
      tagDocumento(tomador.cpfCnpj) +
      tag("IE", tomador.inscricaoEstadual) +
      tag(
        "xNome",
        homologacao
          ? HOMOLOGACAO_NOME
          : tomador.nome
      ) +
      tag("xFant", tomador.nomeFantasia) +
      tag("fone", somenteNumeros(tomador.telefone)) +
      gerarEnderecoParticipante(
        "enderToma",
        tomador
      ) +
      tag("email", tomador.email) +
      `</toma4>`;
  } else {
    grupoTomador =
      `<toma3>` +
      tag(
        "toma",
        CODIGO_TOMADOR[
          cte.tomadorServico
        ]
      ) +
      `</toma3>`;
  }

  const crt =
    configuracao.regimeTributario ===
    "SIMPLES_NACIONAL"
      ? "1"
      : configuracao.regimeTributario ===
          "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE"
        ? "2"
        : "3";

  const emitente = cte.empresa;

  const emit =
    `<emit>` +
    tag("CNPJ", somenteNumeros(emitente.cnpj)) +
    tag("IE", emitente.inscricaoEstadual) +
    tag("xNome", emitente.razaoSocial) +
    tag("xFant", emitente.nomeFantasia) +
    `<enderEmit>` +
    tag("xLgr", emitente.logradouro) +
    tag("nro", emitente.numero) +
    tag("xCpl", emitente.complemento) +
    tag("xBairro", emitente.bairro) +
    tag("cMun", somenteNumeros(emitente.codigoMunicipio)) +
    tag("xMun", emitente.municipio) +
    tag("CEP", somenteNumeros(emitente.cep)) +
    tag("UF", ufEmitente) +
    tag("fone", somenteNumeros(emitente.telefone)) +
    `</enderEmit>` +
    tag("CRT", crt) +
    `</emit>`;

  const rem =
    gerarParticipante(
      "rem",
      remetente,
      homologacao
    );

  const expedidor =
    participantes.get("EXPEDIDOR");

  const exped = expedidor
    ? gerarParticipante(
        "exped",
        expedidor,
        homologacao
      )
    : "";

  const recebedor =
    participantes.get("RECEBEDOR");

  const receb = recebedor
    ? gerarParticipante(
        "receb",
        recebedor,
        homologacao
      )
    : "";

  const dest =
    gerarParticipante(
      "dest",
      destinatario,
      homologacao
    );

  const componentes =
    cte.componentesValor
      .map(
        (item) =>
          `<Comp>` +
          tag("xNome", item.nome) +
          tag(
            "vComp",
            formatarDecimal(item.valor)
          ) +
          `</Comp>`
      )
      .join("");

  const vPrest =
    `<vPrest>` +
    tag(
      "vTPrest",
      formatarDecimal(cte.valorPrestacao)
    ) +
    tag(
      "vRec",
      formatarDecimal(cte.valorReceber)
    ) +
    componentes +
    `</vPrest>`;

  const ibsCbs = gerarIbsCbs(cte);

  const imp =
    `<imp>` +
    `<ICMS>` +
    gerarIcms(cte) +
    `</ICMS>` +
    (cte.valorTotalTributos !== null
      ? tag(
          "vTotTrib",
          formatarDecimal(
            cte.valorTotalTributos
          )
        )
      : "") +
    tag("infAdFisco", cte.informacoesFisco) +
    gerarIcmsUfFim(cte) +
    ibsCbs.grupo +
    ibsCbs.total +
    `</imp>`;

  const quantidades =
    cte.quantidadesCarga
      .map(
        (item) =>
          `<infQ>` +
          tag(
            "cUnid",
            CODIGO_UNIDADE[item.unidade]
          ) +
          tag("tpMed", item.tipoMedida) +
          tag(
            "qCarga",
            formatarDecimal(
              item.quantidade,
              4
            )
          ) +
          `</infQ>`
      )
      .join("");

  const infCarga =
    `<infCarga>` +
    tag("vCarga", formatarDecimal(cte.valorCarga)) +
    tag("proPred", cte.produtoPredominante) +
    tag(
      "xOutCat",
      cte.outrasCaracteristicasCarga
    ) +
    (cte.valorCargaAverbacao !== null
      ? tag(
          "vCargaAverb",
          formatarDecimal(
            cte.valorCargaAverbacao
          )
        )
      : "") +
    quantidades +
    `</infCarga>`;

  const documentos =
    cte.documentosNfe
      .map(
        (item) =>
          `<infNFe>` +
          tag("chave", item.chaveAcesso) +
          `</infNFe>`
      )
      .join("");

  const infDoc = documentos
    ? `<infDoc>${documentos}</infDoc>`
    : "";

  const rntrc =
    cte.rntrc?.trim().toUpperCase() ||
    configuracao.rntrc?.trim().toUpperCase() ||
    "";

  const infModal =
    `<infModal versaoModal="4.00">` +
    `<rodo>` +
    tag("RNTRC", rntrc) +
    `</rodo>` +
    `</infModal>`;

  const infCTeNorm =
    `<infCTeNorm>` +
    infCarga +
    infDoc +
    infModal +
    `</infCTeNorm>`;

  const compl = cte.informacoesAdicionais
    ? `<compl>${tag(
        "xObs",
        cte.informacoesAdicionais
      )}</compl>`
    : "";

  const ide =
    `<ide>` +
    tag("cUF", codigoUf) +
    tag("cCT", chaveInfo.codigoNumerico) +
    tag("CFOP", somenteNumeros(cte.cfop)) +
    tag("natOp", cte.naturezaOperacao) +
    tag("mod", "57") +
    tag("serie", cte.serie) +
    tag("nCT", cte.numero) +
    tag(
      "dhEmi",
      formatarDataHoraCte(cte.dataEmissao)
    ) +
    tag("tpImp", "1") +
    tag("tpEmis", "1") +
    tag("cDV", chaveInfo.dv) +
    tag("tpAmb", tpAmb) +
    tag("tpCTe", "0") +
    tag("procEmi", "0") +
    tag("verProc", "Faturistico 0.1.0") +
    tag(
      "cMunEnv",
      somenteNumeros(
        cte.codigoMunicipioEnvio
      )
    ) +
    tag("xMunEnv", cte.municipioEnvio) +
    tag("UFEnv", cte.ufEnvio) +
    tag("modal", "01") +
    tag(
      "tpServ",
      CODIGO_TIPO_SERVICO[
        cte.tipoServico
      ]
    ) +
    tag(
      "cMunIni",
      somenteNumeros(
        cte.codigoMunicipioInicio
      )
    ) +
    tag("xMunIni", cte.municipioInicio) +
    tag("UFIni", cte.ufInicio) +
    tag(
      "cMunFim",
      somenteNumeros(
        cte.codigoMunicipioFim
      )
    ) +
    tag("xMunFim", cte.municipioFim) +
    tag("UFFim", cte.ufFim) +
    tag("retira", "1") +
    tag("indIEToma", indIEToma) +
    grupoTomador +
    `</ide>`;

  const pagamentos =
    cte.pagamentosVinculados.length > 0
      ? `<pgtoVinc>` +
        cte.pagamentosVinculados
          .map(
            (pagamento) =>
              `<pgto nPag="${String(
                pagamento.numeroPagamento
              ).padStart(3, "0")}" idTransacao="${escaparXml(
                pagamento.idTransacao
              )}">` +
              tag(
                "tpMeioPgto",
                pagamento.tipoMeioPagamento
              ) +
              tag(
                "CNPJReceb",
                somenteNumeros(
                  pagamento.cnpjRecebedor
                )
              ) +
              tag(
                "CNPJBasePSP",
                somenteNumeros(
                  pagamento.cnpjBasePsp
                )
              ) +
              `</pgto>`
          )
          .join("") +
        `</pgtoVinc>`
      : "";

  const id = `CTe${chaveInfo.chave}`;

  const infCte =
    `<infCte xmlns="${NAMESPACE_CTE}" Id="${id}" versao="4.00">` +
    ide +
    compl +
    emit +
    rem +
    exped +
    receb +
    dest +
    vPrest +
    imp +
    infCTeNorm +
    pagamentos +
    `</infCte>`;

  const qrCode =
    `https://dfe-portal.svrs.rs.gov.br/cte/qrCode?chCTe=${chaveInfo.chave}&tpAmb=${tpAmb}`;

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<CTe xmlns="${NAMESPACE_CTE}">` +
    infCte +
    `<infCTeSupl>` +
    `<qrCodCTe>${escaparXml(qrCode)}</qrCodCTe>` +
    `</infCTeSupl>` +
    `</CTe>`;

  return {
    xml,
    chaveAcesso: chaveInfo.chave,
    codigoNumerico:
      chaveInfo.codigoNumerico,
    qrCode,
    ambiente: configuracao.ambiente,
  };
}

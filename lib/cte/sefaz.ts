import https from "node:https";
import { gzipSync } from "node:zlib";

import type {
  AmbienteFiscal,
} from "@prisma/client";

import type {
  CertificadoA1Cte,
} from "@/lib/cte/certificado-a1";

const NAMESPACE_CTE =
  "http://www.portalfiscal.inf.br/cte";

const UFS_SVRS = new Set([
  "AC",
  "AL",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "PA",
  "PB",
  "PI",
  "RJ",
  "RN",
  "RO",
  "SC",
  "SE",
  "TO",
]);

type ServicoCte =
  | "CTeRecepcaoSincV4"
  | "CTeStatusServicoV4"
  | "CTeConsultaV4"
  | "CTeRecepcaoEventoV4";

const METODOS: Record<
  ServicoCte,
  string
> = {
  CTeRecepcaoSincV4: "cteRecepcao",
  CTeStatusServicoV4:
    "cteStatusServicoCT",
  CTeConsultaV4: "cteConsultaCT",
  CTeRecepcaoEventoV4:
    "cteRecepcaoEvento",
};

export function obterUrlSefazCte({
  uf,
  ambiente,
  servico,
}: {
  uf: string;
  ambiente: AmbienteFiscal;
  servico: ServicoCte;
}) {
  const sigla = uf.toUpperCase();

  if (!UFS_SVRS.has(sigla)) {
    throw new Error(
      `AUTORIZADOR_CTE_NAO_CONFIGURADO_${sigla}`
    );
  }

  const host =
    ambiente === "HOMOLOGACAO"
      ? "cte-homologacao.svrs.rs.gov.br"
      : "cte.svrs.rs.gov.br";

  return `https://${host}/ws/${servico}/${servico}.asmx`;
}

function criarEnvelopeSoap({
  servico,
  conteudo,
}: {
  servico: ServicoCte;
  conteudo: string;
}) {
  const namespace =
    `http://www.portalfiscal.inf.br/cte/wsdl/${servico}`;

  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap12:Envelope ` +
    `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
    `xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<cteDadosMsg xmlns="${namespace}">` +
    conteudo +
    `</cteDadosMsg>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`
  );
}

async function chamarSoap({
  url,
  servico,
  certificado,
  conteudo,
}: {
  url: string;
  servico: ServicoCte;
  certificado: CertificadoA1Cte;
  conteudo: string;
}) {
  const envelope =
    criarEnvelopeSoap({
      servico,
      conteudo,
    });

  const corpo = Buffer.from(
    envelope,
    "utf8"
  );

  const metodo = METODOS[servico];

  const soapAction =
    `http://www.portalfiscal.inf.br/cte/wsdl/${servico}/${metodo}`;

  return new Promise<string>(
    (resolve, reject) => {
      const destino = new URL(url);

      const requisicao = https.request(
        {
          protocol: destino.protocol,
          hostname: destino.hostname,
          port: destino.port
            ? Number(destino.port)
            : 443,
          path:
            destino.pathname +
            destino.search,
          method: "POST",
          pfx: certificado.pfx,
          passphrase:
            certificado.senha,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
          headers: {
            "Content-Type":
              `application/soap+xml; charset=utf-8; action="${soapAction}"`,
            "Content-Length":
              String(corpo.length),
            Accept:
              "application/soap+xml, text/xml, */*",
          },
        },
        (resposta) => {
          const partes: Buffer[] = [];

          resposta.on(
            "data",
            (parte: Buffer) => {
              partes.push(
                Buffer.from(parte)
              );
            }
          );

          resposta.on("end", () => {
            const texto =
              Buffer.concat(partes)
                .toString("utf8");

            const status =
              resposta.statusCode ?? 0;

            if (
              status < 200 ||
              status >= 300
            ) {
              reject(
                new Error(
                  `SEFAZ_HTTP_${status}: ${texto.slice(0, 1500)}`
                )
              );
              return;
            }

            resolve(texto);
          });
        }
      );

      requisicao.setTimeout(
        30000,
        () => {
          requisicao.destroy(
            new Error(
              "SEFAZ_TIMEOUT"
            )
          );
        }
      );

      requisicao.on(
        "error",
        reject
      );

      requisicao.write(corpo);
      requisicao.end();
    }
  );
}

export async function transmitirCteSefaz({
  xmlAssinado,
  uf,
  ambiente,
  certificado,
}: {
  xmlAssinado: string;
  uf: string;
  ambiente: AmbienteFiscal;
  certificado: CertificadoA1Cte;
}) {
  const compactado =
    gzipSync(
      Buffer.from(
        xmlAssinado,
        "utf8"
      )
    ).toString("base64");

  return chamarSoap({
    url: obterUrlSefazCte({
      uf,
      ambiente,
      servico: "CTeRecepcaoSincV4",
    }),
    servico: "CTeRecepcaoSincV4",
    certificado,
    conteudo: compactado,
  });
}

export async function consultarStatusSefazCte({
  uf,
  codigoUf,
  ambiente,
  certificado,
}: {
  uf: string;
  codigoUf: string;
  ambiente: AmbienteFiscal;
  certificado: CertificadoA1Cte;
}) {
  const xml =
    `<consStatServCTe versao="4.00" xmlns="${NAMESPACE_CTE}">` +
    `<tpAmb>${ambiente === "HOMOLOGACAO" ? "2" : "1"}</tpAmb>` +
    `<cUF>${codigoUf}</cUF>` +
    `<xServ>STATUS</xServ>` +
    `</consStatServCTe>`;

  return chamarSoap({
    url: obterUrlSefazCte({
      uf,
      ambiente,
      servico:
        "CTeStatusServicoV4",
    }),
    servico: "CTeStatusServicoV4",
    certificado,
    conteudo: xml,
  });
}

export async function consultarCteSefaz({
  chaveAcesso,
  uf,
  ambiente,
  certificado,
}: {
  chaveAcesso: string;
  uf: string;
  ambiente: AmbienteFiscal;
  certificado: CertificadoA1Cte;
}) {
  const xml =
    `<consSitCTe versao="4.00" xmlns="${NAMESPACE_CTE}">` +
    `<tpAmb>${ambiente === "HOMOLOGACAO" ? "2" : "1"}</tpAmb>` +
    `<xServ>CONSULTAR</xServ>` +
    `<chCTe>${chaveAcesso}</chCTe>` +
    `</consSitCTe>`;

  return chamarSoap({
    url: obterUrlSefazCte({
      uf,
      ambiente,
      servico: "CTeConsultaV4",
    }),
    servico: "CTeConsultaV4",
    certificado,
    conteudo: xml,
  });
}

export async function enviarEventoCteSefaz({
  xmlEventoAssinado,
  uf,
  ambiente,
  certificado,
}: {
  xmlEventoAssinado: string;
  uf: string;
  ambiente: AmbienteFiscal;
  certificado: CertificadoA1Cte;
}) {
  return chamarSoap({
    url: obterUrlSefazCte({
      uf,
      ambiente,
      servico:
        "CTeRecepcaoEventoV4",
    }),
    servico: "CTeRecepcaoEventoV4",
    certificado,
    conteudo: xmlEventoAssinado,
  });
}

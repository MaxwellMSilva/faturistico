import https from "node:https";
import { gunzipSync } from "node:zlib";

import type {
  AmbienteFiscal,
} from "@prisma/client";

import type {
  CertificadoA1Cte,
} from "@/lib/cte/certificado-a1";
import {
  CODIGOS_UF,
  escaparXml,
  extrairTagXml,
  somenteNumeros,
} from "@/lib/cte/util";

const NAMESPACE_NFE =
  "http://www.portalfiscal.inf.br/nfe";
const NAMESPACE_WS =
  "http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe";
const SOAP_ACTION =
  `${NAMESPACE_WS}/nfeDistDFeInteresse`;

function obterUrl(
  ambiente: AmbienteFiscal
) {
  return ambiente === "HOMOLOGACAO"
    ? "https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx"
    : "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";
}

function criarEnvelope({
  ambiente,
  cUfAutor,
  cnpj,
  chave,
}: {
  ambiente: AmbienteFiscal;
  cUfAutor: string;
  cnpj: string;
  chave: string;
}) {
  const tpAmb =
    ambiente === "HOMOLOGACAO"
      ? "2"
      : "1";

  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<soap:Envelope ` +
    `xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
    `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
    `xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
    `<soap:Body>` +
    `<nfeDistDFeInteresse xmlns="${NAMESPACE_WS}">` +
    `<nfeDadosMsg>` +
    `<distDFeInt xmlns="${NAMESPACE_NFE}" versao="1.01">` +
    `<tpAmb>${tpAmb}</tpAmb>` +
    `<cUFAutor>${escaparXml(cUfAutor)}</cUFAutor>` +
    `<CNPJ>${escaparXml(cnpj)}</CNPJ>` +
    `<consChNFe>` +
    `<chNFe>${escaparXml(chave)}</chNFe>` +
    `</consChNFe>` +
    `</distDFeInt>` +
    `</nfeDadosMsg>` +
    `</nfeDistDFeInteresse>` +
    `</soap:Body>` +
    `</soap:Envelope>`
  );
}

async function chamarAmbienteNacional({
  ambiente,
  envelope,
  certificado,
}: {
  ambiente: AmbienteFiscal;
  envelope: string;
  certificado: CertificadoA1Cte;
}) {
  const corpo = Buffer.from(
    envelope,
    "utf8"
  );
  const destino = new URL(
    obterUrl(ambiente)
  );

  return new Promise<string>(
    (resolve, reject) => {
      const requisicao = https.request(
        {
          protocol: destino.protocol,
          hostname: destino.hostname,
          port: 443,
          path: destino.pathname,
          method: "POST",
          pfx: certificado.pfx,
          passphrase:
            certificado.senha,
          rejectUnauthorized: true,
          minVersion: "TLSv1.2",
          headers: {
            "Content-Type":
              "text/xml; charset=utf-8",
            SOAPAction:
              `"${SOAP_ACTION}"`,
            "Content-Length":
              String(corpo.length),
            Accept:
              "text/xml, application/xml, */*",
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
                  `NFE_DISTRIBUICAO_HTTP_${status}: ${texto.slice(0, 1200)}`
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
              "NFE_DISTRIBUICAO_TIMEOUT"
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

function extrairDocZip(
  xml: string
) {
  const resultado = xml.match(
    /<(?:\w+:)?docZip\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?docZip>/i
  );

  if (!resultado) {
    return null;
  }

  const schema =
    resultado[1].match(
      /\bschema=["']([^"']+)["']/i
    )?.[1] ?? "";

  return {
    schema,
    conteudo:
      resultado[2]
        .replace(/\s+/g, "")
        .trim(),
  };
}

export async function buscarXmlNfePorChave({
  empresaCnpj,
  empresaUf,
  ambiente,
  chaveAcesso,
  certificado,
}: {
  empresaCnpj: string;
  empresaUf: string;
  ambiente: AmbienteFiscal;
  chaveAcesso: string;
  certificado: CertificadoA1Cte;
}) {
  const cnpj =
    somenteNumeros(empresaCnpj);
  const uf = empresaUf
    .trim()
    .toUpperCase();
  const cUfAutor =
    CODIGOS_UF[uf];

  if (cnpj.length !== 14) {
    throw new Error(
      "CNPJ_EMPRESA_INVALIDO"
    );
  }

  if (!cUfAutor) {
    throw new Error(
      "UF_EMPRESA_INVALIDA"
    );
  }

  const envelope = criarEnvelope({
    ambiente,
    cUfAutor,
    cnpj,
    chave: chaveAcesso,
  });

  const respostaSoap =
    await chamarAmbienteNacional({
      ambiente,
      envelope,
      certificado,
    });

  const resultado =
    extrairTagXml(
      respostaSoap,
      "nfeDistDFeInteresseResult"
    ) ?? respostaSoap;

  const cStat =
    extrairTagXml(
      resultado,
      "cStat"
    ) ?? "";
  const xMotivo =
    extrairTagXml(
      resultado,
      "xMotivo"
    ) ?? "";

  if (cStat !== "138") {
    const erro = new Error(
      `NFE_DISTRIBUICAO_${cStat || "SEM_STATUS"}: ${xMotivo || "NF-e não localizada."}`
    );
    throw erro;
  }

  const docZip =
    extrairDocZip(resultado);

  if (!docZip?.conteudo) {
    throw new Error(
      "NFE_DISTRIBUICAO_SEM_DOCUMENTO"
    );
  }

  let xmlNfe: string;

  try {
    xmlNfe = gunzipSync(
      Buffer.from(
        docZip.conteudo,
        "base64"
      )
    ).toString("utf8");
  } catch {
    throw new Error(
      "NFE_DISTRIBUICAO_DOCUMENTO_INVALIDO"
    );
  }

  if (!/<(?:\w+:)?NFe\b/i.test(xmlNfe)) {
    throw new Error(
      `NFE_DISTRIBUICAO_XML_COMPLETO_INDISPONIVEL:${docZip.schema}`
    );
  }

  return xmlNfe;
}

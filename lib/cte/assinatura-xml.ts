import {
  createHash,
  createSign,
} from "node:crypto";

const XMLDSIG =
  "http://www.w3.org/2000/09/xmldsig#";

const C14N =
  "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";

const ENVELOPED =
  "http://www.w3.org/2000/09/xmldsig#enveloped-signature";

const RSA_SHA1 =
  "http://www.w3.org/2000/09/xmldsig#rsa-sha1";

const SHA1 =
  "http://www.w3.org/2000/09/xmldsig#sha1";

function normalizarXmlControlado(
  xml: string
) {
  return xml
    .replace(/^\s*<\?xml[^>]*\?>\s*/i, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function localizarInfAssinavel(
  xml: string,
  nome: "infCte" | "infEvento"
) {
  const expressao = new RegExp(
    `<${nome}\\b[^>]*\\bId="([^"]+)"[^>]*>[\\s\\S]*?<\\/${nome}>`
  );

  const resultado = xml.match(expressao);

  if (!resultado) {
    throw new Error(
      `XML_SEM_${nome.toUpperCase()}_ASSINAVEL`
    );
  }

  return {
    id: resultado[1],
    conteudo:
      normalizarXmlControlado(
        resultado[0]
      ),
  };
}

export function criarAssinaturaXml({
  xml,
  certificadoBase64,
  chavePrivadaPem,
  elemento = "infCte",
}: {
  xml: string;
  certificadoBase64: string;
  chavePrivadaPem: string;
  elemento?: "infCte" | "infEvento";
}) {
  const assinavel =
    localizarInfAssinavel(
      xml,
      elemento
    );

  const digestValue =
    createHash("sha1")
      .update(
        assinavel.conteudo,
        "utf8"
      )
      .digest("base64");

  const signedInfo =
    `<SignedInfo xmlns="${XMLDSIG}">` +
    `<CanonicalizationMethod Algorithm="${C14N}"></CanonicalizationMethod>` +
    `<SignatureMethod Algorithm="${RSA_SHA1}"></SignatureMethod>` +
    `<Reference URI="#${assinavel.id}">` +
    `<Transforms>` +
    `<Transform Algorithm="${ENVELOPED}"></Transform>` +
    `<Transform Algorithm="${C14N}"></Transform>` +
    `</Transforms>` +
    `<DigestMethod Algorithm="${SHA1}"></DigestMethod>` +
    `<DigestValue>${digestValue}</DigestValue>` +
    `</Reference>` +
    `</SignedInfo>`;

  const assinatura =
    createSign("RSA-SHA1");

  assinatura.update(
    signedInfo,
    "utf8"
  );

  assinatura.end();

  const signatureValue =
    assinatura.sign(
      chavePrivadaPem,
      "base64"
    );

  return (
    `<Signature xmlns="${XMLDSIG}">` +
    signedInfo +
    `<SignatureValue>${signatureValue}</SignatureValue>` +
    `<KeyInfo><X509Data><X509Certificate>${certificadoBase64}</X509Certificate></X509Data></KeyInfo>` +
    `</Signature>`
  );
}

export function assinarCteXml({
  xml,
  certificadoBase64,
  chavePrivadaPem,
}: {
  xml: string;
  certificadoBase64: string;
  chavePrivadaPem: string;
}) {
  const assinatura =
    criarAssinaturaXml({
      xml,
      certificadoBase64,
      chavePrivadaPem,
      elemento: "infCte",
    });

  const fechamento = "</CTe>";

  if (!xml.includes(fechamento)) {
    throw new Error("XML_CTE_INVALIDO");
  }

  return xml.replace(
    fechamento,
    `${assinatura}${fechamento}`
  );
}

export function assinarEventoCteXml({
  xml,
  certificadoBase64,
  chavePrivadaPem,
}: {
  xml: string;
  certificadoBase64: string;
  chavePrivadaPem: string;
}) {
  const assinatura =
    criarAssinaturaXml({
      xml,
      certificadoBase64,
      chavePrivadaPem,
      elemento: "infEvento",
    });

  const fechamento = "</eventoCTe>";

  if (!xml.includes(fechamento)) {
    throw new Error("XML_EVENTO_CTE_INVALIDO");
  }

  return xml.replace(
    fechamento,
    `${assinatura}${fechamento}`
  );
}

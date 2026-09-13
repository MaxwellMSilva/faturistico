import {
  extrairBlocoXml,
  extrairTagXml,
} from "@/lib/cte/util";

export type RetornoSefazCte = {
  cStat: string | null;
  xMotivo: string | null;
  nProt: string | null;
  dhRecbto: string | null;
  verAplic: string | null;
  chaveAcesso: string | null;
  protocoloXml: string | null;
};

export function interpretarRetornoCte(
  xml: string
): RetornoSefazCte {
  const protocoloXml =
    extrairBlocoXml(xml, "protCTe");

  const bloco =
    protocoloXml
      ? extrairBlocoXml(
          protocoloXml,
          "infProt"
        ) ?? protocoloXml
      : xml;

  return {
    cStat: extrairTagXml(
      bloco,
      "cStat"
    ),
    xMotivo: extrairTagXml(
      bloco,
      "xMotivo"
    ),
    nProt: extrairTagXml(
      bloco,
      "nProt"
    ),
    dhRecbto: extrairTagXml(
      bloco,
      "dhRecbto"
    ),
    verAplic: extrairTagXml(
      bloco,
      "verAplic"
    ),
    chaveAcesso: extrairTagXml(
      bloco,
      "chCTe"
    ),
    protocoloXml,
  };
}

export function montarCteProcessado({
  xmlAssinado,
  protocoloXml,
}: {
  xmlAssinado: string;
  protocoloXml: string;
}) {
  const cte = xmlAssinado.replace(
    /^\s*<\?xml[^>]*\?>\s*/i,
    ""
  );

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<cteProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/cte">` +
    cte +
    protocoloXml +
    `</cteProc>`
  );
}

export function interpretarRetornoEventoCte(
  xml: string
) {
  const retornoEvento =
    extrairBlocoXml(
      xml,
      "retEventoCTe"
    ) ?? xml;

  const info =
    extrairBlocoXml(
      retornoEvento,
      "infEvento"
    ) ?? retornoEvento;

  return {
    cStat: extrairTagXml(
      info,
      "cStat"
    ),
    xMotivo: extrairTagXml(
      info,
      "xMotivo"
    ),
    nProt: extrairTagXml(
      info,
      "nProt"
    ),
    dhRegEvento: extrairTagXml(
      info,
      "dhRegEvento"
    ),
    retEventoXml:
      extrairBlocoXml(
        xml,
        "retEventoCTe"
      ),
  };
}

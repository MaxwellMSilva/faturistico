import {
  extrairBlocoXml,
  extrairTagXml,
  somenteNumeros,
  validarChaveAcesso,
} from "@/lib/cte/util";

export type DadosNfeParaCte = {
  chaveAcesso: string;
  numeroNfe: string | null;
  serieNfe: string | null;
  dataEmissaoNfe: string | null;

  emitenteDocumento: string;
  emitenteNome: string;
  emitenteCodigoMunicipio: string;
  emitenteMunicipio: string;
  emitenteUf: string;

  destinatarioDocumento: string;
  destinatarioNome: string;
  destinatarioCodigoMunicipio: string;
  destinatarioMunicipio: string;
  destinatarioUf: string;

  valorNota: number;
  produtoPredominante: string;
  pesoBruto: number | null;
  quantidadeVolumes: number | null;
};

function numeroXml(
  valor: string | null
): number | null {
  if (!valor) return null;

  const numero = Number(
    valor.replace(",", ".")
  );

  return Number.isFinite(numero)
    ? numero
    : null;
}

function extrairBlocosXml(
  xml: string,
  nome: string
) {
  const expressao = new RegExp(
    `<(?:\\w+:)?${nome}(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:\\w+:)?${nome}>`,
    "gi"
  );

  return xml.match(expressao) ?? [];
}

function extrairChaveAcesso(
  xml: string
) {
  const infNfe =
    xml.match(
      /<(?:\w+:)?infNFe\b[^>]*\bId=["']NFe(\d{44})["'][^>]*>/i
    )?.[1];

  return somenteNumeros(
    infNfe ??
      extrairTagXml(xml, "chNFe") ??
      ""
  );
}

function documentoParticipante(
  bloco: string
) {
  return somenteNumeros(
    extrairTagXml(bloco, "CNPJ") ??
      extrairTagXml(bloco, "CPF") ??
      ""
  );
}

function participanteEndereco(
  bloco: string,
  nomeEndereco: string
) {
  const endereco =
    extrairBlocoXml(
      bloco,
      nomeEndereco
    ) ?? "";

  return {
    codigoMunicipio:
      somenteNumeros(
        extrairTagXml(
          endereco,
          "cMun"
        ) ?? ""
      ),
    municipio:
      extrairTagXml(
        endereco,
        "xMun"
      ) ?? "",
    uf:
      (
        extrairTagXml(
          endereco,
          "UF"
        ) ?? ""
      ).toUpperCase(),
  };
}

function produtoPredominante(
  xml: string
) {
  const produtos =
    extrairBlocosXml(xml, "det")
      .map((det) => {
        const prod =
          extrairBlocoXml(
            det,
            "prod"
          ) ?? det;

        return {
          nome:
            extrairTagXml(
              prod,
              "xProd"
            ) ?? "",
          valor:
            numeroXml(
              extrairTagXml(
                prod,
                "vProd"
              )
            ) ?? 0,
        };
      })
      .filter((item) =>
        Boolean(item.nome)
      )
      .sort(
        (a, b) => b.valor - a.valor
      );

  return produtos[0]?.nome ?? "";
}

function somarTagsNumericas(
  xml: string,
  nome: string
) {
  const expressao = new RegExp(
    `<(?:\\w+:)?${nome}(?:\\s[^>]*)?>([^<]+)<\\/(?:\\w+:)?${nome}>`,
    "gi"
  );

  let soma = 0;
  let encontrou = false;
  let resultado:
    | RegExpExecArray
    | null;

  while (
    (resultado = expressao.exec(xml))
  ) {
    const numero =
      numeroXml(resultado[1]);

    if (numero !== null) {
      soma += numero;
      encontrou = true;
    }
  }

  return encontrou ? soma : null;
}

export function extrairDadosNfeParaCte(
  xmlOriginal: string
): DadosNfeParaCte {
  const xml = xmlOriginal.trim();

  if (!xml) {
    throw new Error(
      "XML_NFE_VAZIO"
    );
  }

  const nfe =
    extrairBlocoXml(xml, "NFe");

  if (!nfe) {
    throw new Error(
      "XML_NFE_INVALIDO"
    );
  }

  const ide =
    extrairBlocoXml(
      nfe,
      "ide"
    ) ?? "";

  if (
    extrairTagXml(ide, "mod") !==
    "55"
  ) {
    throw new Error(
      "XML_NAO_E_NFE_MODELO_55"
    );
  }

  const protocolo =
    extrairBlocoXml(
      xml,
      "infProt"
    );

  if (!protocolo) {
    throw new Error(
      "XML_NFE_SEM_PROTOCOLO_AUTORIZACAO"
    );
  }

  if (
    extrairTagXml(
      protocolo,
      "cStat"
    ) !== "100"
  ) {
    throw new Error(
      "XML_NFE_NAO_AUTORIZADO"
    );
  }

  const chaveAcesso =
    extrairChaveAcesso(xml);

  if (
    !validarChaveAcesso(
      chaveAcesso
    )
  ) {
    throw new Error(
      "CHAVE_NFE_INVALIDA"
    );
  }

  const emitente =
    extrairBlocoXml(
      nfe,
      "emit"
    ) ?? "";
  const destinatario =
    extrairBlocoXml(
      nfe,
      "dest"
    ) ?? "";

  const emitenteEndereco =
    participanteEndereco(
      emitente,
      "enderEmit"
    );
  const destinatarioEndereco =
    participanteEndereco(
      destinatario,
      "enderDest"
    );

  const total =
    extrairBlocoXml(
      nfe,
      "ICMSTot"
    ) ?? "";

  return {
    chaveAcesso,
    numeroNfe:
      extrairTagXml(ide, "nNF"),
    serieNfe:
      extrairTagXml(ide, "serie"),
    dataEmissaoNfe:
      extrairTagXml(ide, "dhEmi") ??
      extrairTagXml(ide, "dEmi"),

    emitenteDocumento:
      documentoParticipante(
        emitente
      ),
    emitenteNome:
      extrairTagXml(
        emitente,
        "xNome"
      ) ?? "",
    emitenteCodigoMunicipio:
      emitenteEndereco.codigoMunicipio,
    emitenteMunicipio:
      emitenteEndereco.municipio,
    emitenteUf:
      emitenteEndereco.uf,

    destinatarioDocumento:
      documentoParticipante(
        destinatario
      ),
    destinatarioNome:
      extrairTagXml(
        destinatario,
        "xNome"
      ) ?? "",
    destinatarioCodigoMunicipio:
      destinatarioEndereco.codigoMunicipio,
    destinatarioMunicipio:
      destinatarioEndereco.municipio,
    destinatarioUf:
      destinatarioEndereco.uf,

    valorNota:
      numeroXml(
        extrairTagXml(
          total,
          "vNF"
        )
      ) ?? 0,
    produtoPredominante:
      produtoPredominante(nfe),
    pesoBruto:
      somarTagsNumericas(
        nfe,
        "pesoB"
      ),
    quantidadeVolumes:
      somarTagsNumericas(
        nfe,
        "qVol"
      ),
  };
}

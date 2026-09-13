export const CODIGOS_UF: Record<string, string> = {
  RO: "11",
  AC: "12",
  AM: "13",
  RR: "14",
  PA: "15",
  AP: "16",
  TO: "17",
  MA: "21",
  PI: "22",
  CE: "23",
  RN: "24",
  PB: "25",
  PE: "26",
  AL: "27",
  SE: "28",
  BA: "29",
  MG: "31",
  ES: "32",
  RJ: "33",
  SP: "35",
  PR: "41",
  SC: "42",
  RS: "43",
  MS: "50",
  MT: "51",
  GO: "52",
  DF: "53",
};

export function somenteNumeros(
  valor: string | null | undefined
) {
  return valor?.replace(/\D/g, "") ?? "";
}

export function escaparXml(
  valor: string | number | null | undefined
) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function formatarDecimal(
  valor: unknown,
  casas = 2
) {
  const numero = Number(valor ?? 0);

  if (!Number.isFinite(numero)) {
    return (0).toFixed(casas);
  }

  return numero.toFixed(casas);
}

export function formatarDataHoraCte(
  data: Date
) {
  const partes = new Intl.DateTimeFormat(
    "sv-SE",
    {
      timeZone: "America/Porto_Velho",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  ).formatToParts(data);

  const mapa = Object.fromEntries(
    partes.map((parte) => [
      parte.type,
      parte.value,
    ])
  );

  return `${mapa.year}-${mapa.month}-${mapa.day}T${mapa.hour}:${mapa.minute}:${mapa.second}-04:00`;
}

export function tag(
  nome: string,
  valor: string | number | null | undefined
) {
  if (
    valor === null ||
    valor === undefined ||
    String(valor) === ""
  ) {
    return "";
  }

  return `<${nome}>${escaparXml(valor)}</${nome}>`;
}

export function extrairTagXml(
  xml: string,
  nome: string
) {
  const expressao = new RegExp(
    `<(?:\\w+:)?${nome}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${nome}>`,
    "i"
  );

  const resultado = xml.match(expressao);

  if (!resultado) {
    return null;
  }

  return resultado[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

export function extrairBlocoXml(
  xml: string,
  nome: string
) {
  const expressao = new RegExp(
    `<(?:\\w+:)?${nome}(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:\\w+:)?${nome}>`,
    "i"
  );

  return xml.match(expressao)?.[0] ?? null;
}

export function validarChaveAcesso(
  chave: string
) {
  const numeros = somenteNumeros(chave);

  if (numeros.length !== 44) {
    return false;
  }

  let peso = 2;
  let soma = 0;

  for (let indice = 42; indice >= 0; indice--) {
    soma += Number(numeros[indice]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }

  const resto = soma % 11;
  const dv = resto < 2 ? 0 : 11 - resto;

  return dv === Number(numeros[43]);
}

export type TipoOperacaoCfop =
  | "ENTRADA"
  | "SAIDA";

export type DestinoOperacaoCfop =
  | "INTERNA"
  | "INTERESTADUAL"
  | "EXTERIOR";

export function somenteNumerosCfop(
  valor?: string | null
) {
  return (valor ?? "").replace(
    /\D/g,
    ""
  );
}

export function normalizarCfop(
  valor?: string | null
) {
  return somenteNumerosCfop(valor);
}

export function cfopValido(
  valor?: string | null
) {
  return /^[123567]\d{3}$/.test(
    normalizarCfop(valor)
  );
}

export function obterTipoOperacaoCfop(
  valor?: string | null
): TipoOperacaoCfop | null {
  const primeiroDigito =
    normalizarCfop(valor).charAt(0);

  if (["1", "2", "3"].includes(
    primeiroDigito
  )) {
    return "ENTRADA";
  }

  if (["5", "6", "7"].includes(
    primeiroDigito
  )) {
    return "SAIDA";
  }

  return null;
}

export function obterDestinoOperacaoCfop(
  valor?: string | null
): DestinoOperacaoCfop | null {
  const primeiroDigito =
    normalizarCfop(valor).charAt(0);

  if (["1", "5"].includes(
    primeiroDigito
  )) {
    return "INTERNA";
  }

  if (["2", "6"].includes(
    primeiroDigito
  )) {
    return "INTERESTADUAL";
  }

  if (["3", "7"].includes(
    primeiroDigito
  )) {
    return "EXTERIOR";
  }

  return null;
}

export function obterCfopFiscal(
  valor?: string | null
) {
  const cfop = normalizarCfop(valor);

  return cfopValido(cfop)
    ? cfop
    : "";
}

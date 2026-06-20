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
  const numeros =
    somenteNumerosCfop(valor);

  if (numeros.length === 6) {
    return `${numeros.slice(
      0,
      4
    )}-${numeros.slice(4)}`;
  }

  return numeros;
}

export function cfopValido(
  valor?: string | null
) {
  const tamanho =
    somenteNumerosCfop(valor).length;

  return tamanho === 4 || tamanho === 6;
}

export function obterCfopFiscal(
  valor?: string | null
) {
  return somenteNumerosCfop(
    valor
  ).slice(0, 4);
}

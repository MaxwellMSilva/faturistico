function calcularDigito(base: string, pesos: number[]) {
  const soma = pesos.reduce(
    (total, peso, indice) => total + Number(base[indice]) * peso,
    0
  );
  const resto = soma % 11;
  return resto < 2 ? "0" : String(11 - resto);
}

export function validarDocumentoCliente(tipoPessoa: string, valor: string) {
  if (tipoPessoa !== "FISICA" && tipoPessoa !== "JURIDICA") {
    return "Informe um tipo de pessoa válido.";
  }

  const erro = tipoPessoa === "FISICA"
    ? "Informe um CPF válido."
    : "Informe um CNPJ válido.";

  if (typeof valor !== "string" || !/^[\d.\/\s-]+$/.test(valor)) {
    return erro;
  }

  const documento = valor.replace(/\D/g, "");
  const tamanho = tipoPessoa === "FISICA" ? 11 : 14;
  if (documento.length !== tamanho || /^(\d)\1+$/.test(documento)) {
    return erro;
  }

  const pesos = tipoPessoa === "FISICA"
    ? [[10, 9, 8, 7, 6, 5, 4, 3, 2], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]]
    : [[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]];
  const base = documento.slice(0, -2);
  const primeiro = calcularDigito(base, pesos[0]);
  const segundo = calcularDigito(base + primeiro, pesos[1]);

  return documento === base + primeiro + segundo ? null : erro;
}

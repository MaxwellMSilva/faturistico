export function gerarCodigoNumerico() {
  return Math.floor(
    10000000 + Math.random() * 90000000
  ).toString();
}

export function calcularDigitoVerificador(
  chaveSemDv: string
) {
  let peso = 2;
  let soma = 0;

  for (
    let i = chaveSemDv.length - 1;
    i >= 0;
    i--
  ) {
    soma +=
      Number(chaveSemDv[i]) * peso;

    peso++;

    if (peso > 9) {
      peso = 2;
    }
  }

  const resto = soma % 11;

  return resto < 2
    ? 0
    : 11 - resto;
}

type Params = {
  uf: string;
  cnpj: string;
  modelo: string;
  serie: number;
  numero: number;
};

export function gerarChaveAcesso({
  uf,
  cnpj,
  modelo,
  serie,
  numero,
}: Params) {
  const data = new Date();

  const aamm =
    String(
      data.getFullYear()
    ).slice(-2) +
    String(
      data.getMonth() + 1
    ).padStart(2, "0");

  const codigoNumerico =
    gerarCodigoNumerico();

  const serieFormatada =
    String(serie).padStart(3, "0");

  const numeroFormatado =
    String(numero).padStart(9, "0");

  const chaveSemDv =
    `${uf}` +
    `${aamm}` +
    `${cnpj}` +
    `${modelo}` +
    `${serieFormatada}` +
    `${numeroFormatado}` +
    `1` +
    `${codigoNumerico}`;

  const dv =
    calcularDigitoVerificador(
      chaveSemDv
    );

  return {
    chave:
      chaveSemDv + dv,
    codigoNumerico,
  };
}
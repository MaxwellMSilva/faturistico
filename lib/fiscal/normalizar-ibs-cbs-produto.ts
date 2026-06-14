type DadosIbsCbsProduto = {
  cstIbsCbs?: string;

  classificacaoTributariaIbsCbs?:
    string;

  aliquotaIbsUf?: number;
  aliquotaIbsMun?: number;
  aliquotaCbs?: number;
};

function somenteNumeros(
  valor?: string
) {
  return valor?.replace(/\D/g, "") ?? "";
}

function validarPercentual(
  valor: number,
  nome: string
) {
  if (
    !Number.isFinite(valor) ||
    valor < 0 ||
    valor > 100
  ) {
    throw new Error(
      `${nome} deve estar entre 0 e 100.`
    );
  }
}

export function normalizarIbsCbsProduto(
  data: DadosIbsCbsProduto
) {
  const cstIbsCbs =
    somenteNumeros(
      data.cstIbsCbs
    );

  const classificacaoTributaria =
    somenteNumeros(
      data
        .classificacaoTributariaIbsCbs
    );

  const aliquotaIbsUf =
    data.aliquotaIbsUf ?? 0;

  const aliquotaIbsMun =
    data.aliquotaIbsMun ?? 0;

  const aliquotaCbs =
    data.aliquotaCbs ?? 0;

  validarPercentual(
    aliquotaIbsUf,
    "A alíquota do IBS estadual"
  );

  validarPercentual(
    aliquotaIbsMun,
    "A alíquota do IBS municipal"
  );

  validarPercentual(
    aliquotaCbs,
    "A alíquota da CBS"
  );

  const possuiCst =
    Boolean(cstIbsCbs);

  const possuiClassificacao =
    Boolean(
      classificacaoTributaria
    );

  if (
    possuiCst !==
    possuiClassificacao
  ) {
    throw new Error(
      "Informe o CST e o cClassTrib do IBS/CBS."
    );
  }

  if (
    possuiCst &&
    cstIbsCbs.length !== 3
  ) {
    throw new Error(
      "O CST do IBS/CBS deve possuir 3 números."
    );
  }

  if (
    possuiClassificacao &&
    classificacaoTributaria.length !==
      6
  ) {
    throw new Error(
      "O cClassTrib deve possuir 6 números."
    );
  }

  if (
    possuiCst &&
    possuiClassificacao &&
    !classificacaoTributaria.startsWith(
      cstIbsCbs
    )
  ) {
    throw new Error(
      "Os três primeiros números do cClassTrib devem coincidir com o CST do IBS/CBS."
    );
  }

  return {
    cstIbsCbs:
      cstIbsCbs || null,

    classificacaoTributariaIbsCbs:
      classificacaoTributaria ||
      null,

    aliquotaIbsUf,
    aliquotaIbsMun,
    aliquotaCbs,
  };
}
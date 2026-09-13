import { Prisma } from "@prisma/client";

type RegimeTributario =
  | "SIMPLES_NACIONAL"
  | "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE"
  | "REGIME_NORMAL";

type CalcularTributosItemData = {
  regimeTributario: RegimeTributario;

  quantidade: Prisma.Decimal;
  valorUnitario: Prisma.Decimal;
  valorDesconto: Prisma.Decimal;
  dataEmissao?: Date | null;

  // ICMS

  cstIcms?: string | null;
  csosnIcms?: string | null;

  reducaoBcIcms?: Prisma.Decimal | null;
  aliquotaIcms?: Prisma.Decimal | null;

  // PIS

  cstPis?: string | null;
  aliquotaPis?: Prisma.Decimal | null;

  // COFINS

  cstCofins?: string | null;
  aliquotaCofins?: Prisma.Decimal | null;

  // IPI

  cstIpi?: string | null;
  codigoEnquadramentoIpi?: string | null;
  aliquotaIpi?: Prisma.Decimal | null;

  // IBS e CBS

  cstIbsCbs?: string | null;
  classificacaoTributariaIbsCbs?: string | null;

  aliquotaIbsUf?: Prisma.Decimal | null;
  aliquotaIbsMun?: Prisma.Decimal | null;
  aliquotaCbs?: Prisma.Decimal | null;
};

function decimalOuZero(
  valor?: Prisma.Decimal | null
) {
  return (
    valor ?? new Prisma.Decimal(0)
  );
}

function codigoOpcional(
  valor?: string | null
) {
  const codigo = valor
    ?.replace(/\D/g, "")
    .trim();

  return codigo || null;
}

function validarPercentual(
  nome: string,
  valor: Prisma.Decimal
) {
  if (
    valor.lessThan(0) ||
    valor.greaterThan(100)
  ) {
    throw new Error(
      `${nome} deve estar entre 0 e 100.`
    );
  }
}

function maiorQueZero(
  valor: Prisma.Decimal
) {
  return valor.greaterThan(0);
}

export function calcularTributosItem({
  regimeTributario,
  quantidade,
  valorUnitario,
  valorDesconto,
  dataEmissao,
  cstIcms,
  csosnIcms,
  reducaoBcIcms,
  aliquotaIcms,
  cstPis,
  aliquotaPis,
  cstCofins,
  aliquotaCofins,
  cstIpi,
  codigoEnquadramentoIpi,
  aliquotaIpi,
  cstIbsCbs,
  classificacaoTributariaIbsCbs,
  aliquotaIbsUf,
  aliquotaIbsMun,
  aliquotaCbs,
}: CalcularTributosItemData) {
  const zero = new Prisma.Decimal(0);

  if (quantidade.lessThanOrEqualTo(0)) {
    throw new Error(
      "A quantidade deve ser maior que zero."
    );
  }

  if (valorUnitario.lessThan(0)) {
    throw new Error(
      "O valor unitário não pode ser negativo."
    );
  }

  if (valorDesconto.lessThan(0)) {
    throw new Error(
      "O desconto não pode ser negativo."
    );
  }

  const usaCsosn =
    regimeTributario === "SIMPLES_NACIONAL" ||
    regimeTributario ===
      "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE";

  const cstIcmsNormalizado =
    codigoOpcional(cstIcms);
  const csosnNormalizado =
    codigoOpcional(csosnIcms);
  const cstPisNormalizado =
    codigoOpcional(cstPis);
  const cstCofinsNormalizado =
    codigoOpcional(cstCofins);
  const cstIpiNormalizado =
    codigoOpcional(cstIpi);
  const enquadramentoIpiNormalizado =
    codigoOpcional(codigoEnquadramentoIpi);
  const cstIbsCbsNormalizado =
    codigoOpcional(cstIbsCbs);
  const classificacaoIbsCbsNormalizada =
    codigoOpcional(
      classificacaoTributariaIbsCbs
    );

  if (
    usaCsosn &&
    !/^\d{3}$/.test(
      csosnNormalizado ?? ""
    )
  ) {
    throw new Error(
      "Informe um CSOSN de ICMS válido no cadastro do produto."
    );
  }

  if (
    !usaCsosn &&
    !/^\d{2}$/.test(
      cstIcmsNormalizado ?? ""
    )
  ) {
    throw new Error(
      "Informe um CST de ICMS válido no cadastro do produto."
    );
  }

  if (
    !/^\d{2}$/.test(
      cstPisNormalizado ?? ""
    )
  ) {
    throw new Error(
      "Informe um CST de PIS válido no cadastro do produto."
    );
  }

  if (
    !/^\d{2}$/.test(
      cstCofinsNormalizado ?? ""
    )
  ) {
    throw new Error(
      "Informe um CST de COFINS válido no cadastro do produto."
    );
  }

  const reducaoIcms =
    decimalOuZero(reducaoBcIcms);
  const percentualIcms =
    decimalOuZero(aliquotaIcms);
  const percentualPis =
    decimalOuZero(aliquotaPis);
  const percentualCofins =
    decimalOuZero(aliquotaCofins);
  const percentualIpi =
    decimalOuZero(aliquotaIpi);

  let percentualIbsUf =
    decimalOuZero(aliquotaIbsUf);
  let percentualIbsMun =
    decimalOuZero(aliquotaIbsMun);
  let percentualCbs =
    decimalOuZero(aliquotaCbs);

  const anoEmissao =
    dataEmissao?.getFullYear();

  /*
   * Para a tributação integral padrão (CST 000 / cClassTrib 000001),
   * a NT 2025.002 define em 2026 IBS-UF 0,1%, IBS-Mun 0% e CBS 0,9%.
   * O sistema não depende da alíquota digitada no cadastro para esse caso.
   */
  if (
    anoEmissao === 2026 &&
    cstIbsCbsNormalizado === "000" &&
    classificacaoIbsCbsNormalizada === "000001"
  ) {
    percentualIbsUf =
      new Prisma.Decimal("0.1");
    percentualIbsMun = zero;
    percentualCbs =
      new Prisma.Decimal("0.9");
  }

  validarPercentual(
    "A redução da base de ICMS",
    reducaoIcms
  );
  validarPercentual(
    "A alíquota de ICMS",
    percentualIcms
  );
  validarPercentual(
    "A alíquota de PIS",
    percentualPis
  );
  validarPercentual(
    "A alíquota de COFINS",
    percentualCofins
  );
  validarPercentual(
    "A alíquota de IPI",
    percentualIpi
  );
  validarPercentual(
    "A alíquota do IBS estadual",
    percentualIbsUf
  );
  validarPercentual(
    "A alíquota do IBS municipal",
    percentualIbsMun
  );
  validarPercentual(
    "A alíquota da CBS",
    percentualCbs
  );

  const valorBruto = quantidade
    .times(valorUnitario)
    .toDecimalPlaces(2);

  if (
    valorDesconto.greaterThan(valorBruto)
  ) {
    throw new Error(
      "O desconto não pode ser maior que o valor bruto do item."
    );
  }

  const valorLiquido = valorBruto
    .minus(valorDesconto)
    .toDecimalPlaces(2);

  const possuiIcms =
    maiorQueZero(percentualIcms);

  const baseCalculoIcms = possuiIcms
    ? valorLiquido
        .times(
          new Prisma.Decimal(100).minus(
            reducaoIcms
          )
        )
        .dividedBy(100)
        .toDecimalPlaces(2)
    : zero;

  const valorIcms = baseCalculoIcms
    .times(percentualIcms)
    .dividedBy(100)
    .toDecimalPlaces(2);

  const possuiPis =
    maiorQueZero(percentualPis);
  const baseCalculoPis = possuiPis
    ? valorLiquido
    : zero;
  const valorPis = baseCalculoPis
    .times(percentualPis)
    .dividedBy(100)
    .toDecimalPlaces(2);

  const possuiCofins =
    maiorQueZero(percentualCofins);
  const baseCalculoCofins = possuiCofins
    ? valorLiquido
    : zero;
  const valorCofins = baseCalculoCofins
    .times(percentualCofins)
    .dividedBy(100)
    .toDecimalPlaces(2);

  const possuiIpi =
    maiorQueZero(percentualIpi);

  if (
    possuiIpi &&
    !/^\d{2}$/.test(
      cstIpiNormalizado ?? ""
    )
  ) {
    throw new Error(
      "Informe um CST de IPI válido no cadastro do produto."
    );
  }

  if (
    possuiIpi &&
    !/^\d{3}$/.test(
      enquadramentoIpiNormalizado ?? ""
    )
  ) {
    throw new Error(
      "Informe um código de enquadramento do IPI com 3 números."
    );
  }

  const baseCalculoIpi = possuiIpi
    ? valorLiquido
    : zero;
  const valorIpi = baseCalculoIpi
    .times(percentualIpi)
    .dividedBy(100)
    .toDecimalPlaces(2);

  const possuiAliquotaIbsCbs =
    maiorQueZero(percentualIbsUf) ||
    maiorQueZero(percentualIbsMun) ||
    maiorQueZero(percentualCbs);

  const possuiCodigoIbsCbs = Boolean(
    cstIbsCbsNormalizado ||
      classificacaoIbsCbsNormalizada
  );

  const possuiIbsCbs =
    possuiAliquotaIbsCbs ||
    possuiCodigoIbsCbs;

  if (possuiIbsCbs) {
    if (
      !/^\d{3}$/.test(
        cstIbsCbsNormalizado ?? ""
      )
    ) {
      throw new Error(
        "Informe um CST de IBS/CBS válido com 3 números."
      );
    }

    if (
      !/^\d{6}$/.test(
        classificacaoIbsCbsNormalizada ?? ""
      )
    ) {
      throw new Error(
        "Informe um cClassTrib válido com 6 números."
      );
    }

    if (
      !classificacaoIbsCbsNormalizada?.startsWith(
        cstIbsCbsNormalizado!
      )
    ) {
      throw new Error(
        "Os três primeiros números do cClassTrib devem coincidir com o CST do IBS/CBS."
      );
    }
  }

  /*
   * Base RTC conforme a composição da NT 2025.002 para os componentes
   * que o Faturístico já modela no item: vProd - vDesc - vPIS - vCOFINS
   * - vICMS. Frete, seguro, II, FCP, DIFAL, monofásico, ISSQN e IS serão
   * somados/subtraídos nesta mesma função quando seus grupos forem
   * incorporados ao item da NF-e.
   */
  let baseCalculoIbsCbs = possuiIbsCbs
    ? valorLiquido
        .minus(valorPis)
        .minus(valorCofins)
        .minus(valorIcms)
        .toDecimalPlaces(2)
    : zero;

  if (baseCalculoIbsCbs.lessThan(0)) {
    baseCalculoIbsCbs = zero;
  }

  const valorIbsUf = baseCalculoIbsCbs
    .times(percentualIbsUf)
    .dividedBy(100)
    .toDecimalPlaces(2);

  const valorIbsMun = baseCalculoIbsCbs
    .times(percentualIbsMun)
    .dividedBy(100)
    .toDecimalPlaces(2);

  const valorIbs = valorIbsUf
    .plus(valorIbsMun)
    .toDecimalPlaces(2);

  const valorCbs = baseCalculoIbsCbs
    .times(percentualCbs)
    .dividedBy(100)
    .toDecimalPlaces(2);

  return {
    valorBruto,
    valorLiquido,

    cstIcms: usaCsosn
      ? null
      : cstIcmsNormalizado,
    csosnIcms: usaCsosn
      ? csosnNormalizado
      : null,
    reducaoBcIcms: reducaoIcms,
    baseCalculoIcms,
    aliquotaIcms: percentualIcms,
    valorIcms,

    cstPis: cstPisNormalizado,
    baseCalculoPis,
    aliquotaPis: percentualPis,
    valorPis,

    cstCofins: cstCofinsNormalizado,
    baseCalculoCofins,
    aliquotaCofins: percentualCofins,
    valorCofins,

    cstIpi: cstIpiNormalizado,
    codigoEnquadramentoIpi:
      cstIpiNormalizado
        ? enquadramentoIpiNormalizado ??
          "999"
        : null,
    baseCalculoIpi,
    aliquotaIpi: percentualIpi,
    valorIpi,

    cstIbsCbs: possuiIbsCbs
      ? cstIbsCbsNormalizado
      : null,
    classificacaoTributariaIbsCbs:
      possuiIbsCbs
        ? classificacaoIbsCbsNormalizada
        : null,
    baseCalculoIbsCbs,
    aliquotaIbsUf: percentualIbsUf,
    valorIbsUf,
    aliquotaIbsMun: percentualIbsMun,
    valorIbsMun,
    valorIbs,
    aliquotaCbs: percentualCbs,
    valorCbs,
  };
}

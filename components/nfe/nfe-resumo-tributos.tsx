import {
  Landmark,
  Percent,
  ReceiptText,
  Scale,
  type LucideIcon,
} from "lucide-react";

type Props = {
  // ICMS

  valorBaseIcms: number;
  valorIcms: number;

  // PIS, COFINS e IPI

  valorPis: number;
  valorCofins: number;
  valorIpi: number;

  // IBS e CBS

  valorBaseIbsCbs: number;

  valorIbsUf: number;
  valorIbsMun: number;
  valorIbs: number;

  valorCbs: number;
};

function normalizarValor(
  valor: number
) {
  return Number.isFinite(valor)
    ? valor
    : 0;
}

function formatarMoeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(
    normalizarValor(valor)
  );
}

export function NfeResumoTributos({
  valorBaseIcms,
  valorIcms,

  valorPis,
  valorCofins,
  valorIpi,

  valorBaseIbsCbs,

  valorIbsUf,
  valorIbsMun,
  valorIbs,

  valorCbs,
}: Props) {
  const totalTributosAtuais =
    normalizarValor(valorIcms) +
    normalizarValor(valorPis) +
    normalizarValor(
      valorCofins
    ) +
    normalizarValor(valorIpi);

  /*
   * O valorIbs já representa a soma
   * do IBS estadual e municipal.
   *
   * Portanto, não somamos novamente
   * valorIbsUf e valorIbsMun.
   */

  const totalIbsCbs =
    normalizarValor(valorIbs) +
    normalizarValor(valorCbs);

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Cabeçalho */}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ReceiptText
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Resumo tributário
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Valores calculados a partir
                da tributação aplicada aos
                itens da NF-e.
              </p>
            </div>
          </div>

          <div className="w-full rounded-xl border bg-muted/10 px-4 py-3 sm:w-auto sm:min-w-52 sm:text-right">
            <p className="text-xs font-medium text-muted-foreground">
              Tributos do modelo atual
            </p>

            <p className="mt-1 text-xl font-bold tracking-tight">
              {formatarMoeda(
                totalTributosAtuais
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-7 border-t bg-muted/[0.02] p-5 sm:p-6">
        {/* Tributos atuais */}

        <TributoGrupo
          icone={Landmark}
          sigla="ATUAL"
          titulo="Tributos do modelo atual"
          descricao="ICMS, PIS, COFINS e IPI calculados nos itens do documento."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <CardTributo
              sigla="BC ICMS"
              titulo="Base de cálculo do ICMS"
              descricao="Valor utilizado como base para calcular o ICMS."
              valor={
                valorBaseIcms
              }
              destaque="base"
            />

            <CardTributo
              sigla="ICMS"
              titulo="Imposto sobre Circulação de Mercadorias e Serviços"
              descricao="Tributo estadual aplicado à circulação de mercadorias."
              valor={valorIcms}
            />

            <CardTributo
              sigla="PIS"
              titulo="Programa de Integração Social"
              descricao="Contribuição federal incidente sobre a receita."
              valor={valorPis}
            />

            <CardTributo
              sigla="COFINS"
              titulo="Contribuição para o Financiamento da Seguridade Social"
              descricao="Contribuição federal destinada à seguridade social."
              valor={valorCofins}
            />

            <CardTributo
              sigla="IPI"
              titulo="Imposto sobre Produtos Industrializados"
              descricao="Tributo federal aplicado a produtos industrializados."
              valor={valorIpi}
            />
          </div>
        </TributoGrupo>

        {/* Reforma tributária */}

        <div className="border-t pt-7">
          <TributoGrupo
            icone={Scale}
            sigla="REFORMA"
            titulo="IBS e CBS"
            descricao="Tributos relacionados ao novo modelo de tributação sobre o consumo."
            complemento={
              <div className="w-full rounded-xl border bg-background px-4 py-3 sm:w-auto sm:min-w-48 sm:text-right">
                <p className="text-xs font-medium text-muted-foreground">
                  Total IBS + CBS
                </p>

                <p className="mt-1 text-lg font-bold text-primary">
                  {formatarMoeda(
                    totalIbsCbs
                  )}
                </p>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <CardTributo
                sigla="BC IBS/CBS"
                titulo="Base de cálculo do IBS e da CBS"
                descricao="Valor utilizado para calcular os novos tributos."
                valor={
                  valorBaseIbsCbs
                }
                destaque="base"
              />

              <CardTributo
                sigla="IBS UF"
                titulo="IBS estadual"
                descricao="Parcela do IBS destinada ao estado."
                valor={valorIbsUf}
              />

              <CardTributo
                sigla="IBS MUN"
                titulo="IBS municipal"
                descricao="Parcela do IBS destinada ao município."
                valor={valorIbsMun}
              />

              <CardTributo
                sigla="IBS"
                titulo="Imposto sobre Bens e Serviços"
                descricao="Total do IBS estadual e municipal."
                valor={valorIbs}
                destaque="total"
              />

              <CardTributo
                sigla="CBS"
                titulo="Contribuição sobre Bens e Serviços"
                descricao="Contribuição federal sobre bens e serviços."
                valor={valorCbs}
              />
            </div>
          </TributoGrupo>
        </div>
      </div>

      {/* Observação */}

      <div className="border-t p-5 sm:p-6">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <Percent
            size={18}
            className="mt-0.5 shrink-0 text-primary"
          />

          <p className="text-xs leading-5 text-muted-foreground">
            Os valores exibidos são
            consolidados a partir dos itens
            da NF-e. Alterações em
            quantidade, preço, desconto ou
            classificação fiscal provocam
            o recálculo automático dos
            tributos.
          </p>
        </div>
      </div>
    </section>
  );
}

type TributoGrupoProps = {
  icone: LucideIcon;

  sigla: string;
  titulo: string;
  descricao: string;

  complemento?: React.ReactNode;

  children: React.ReactNode;
};

function TributoGrupo({
  icone: Icone,
  sigla,
  titulo,
  descricao,
  complemento,
  children,
}: TributoGrupoProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icone size={19} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">
                {titulo}
              </h3>

              <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary">
                {sigla}
              </span>
            </div>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
              {descricao}
            </p>
          </div>
        </div>

        {complemento}
      </div>

      {children}
    </section>
  );
}

type CardTributoProps = {
  sigla: string;
  titulo: string;
  descricao: string;

  valor: number;

  destaque?:
    | "base"
    | "total";
};

function CardTributo({
  sigla,
  titulo,
  descricao,
  valor,
  destaque,
}: CardTributoProps) {
  const valorNormalizado =
    normalizarValor(valor);

  return (
    <article
      className={[
        "flex min-h-48 flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm",
        destaque === "total"
          ? "border-primary/30 bg-primary/5"
          : destaque === "base"
            ? "bg-muted/20"
            : "bg-background",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={[
            "inline-flex rounded-md border px-2 py-1 text-[10px] font-bold tracking-wide",
            destaque === "total"
              ? "border-primary/30 bg-primary/10 text-primary"
              : "bg-muted/40 text-muted-foreground",
          ].join(" ")}
        >
          {sigla}
        </span>

        {destaque === "total" && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
            Total
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold leading-5">
          {titulo}
        </p>

        <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
          {descricao}
        </p>
      </div>

      <div className="mt-auto border-t pt-4">
        <p
          className={[
            "text-lg font-bold tracking-tight",
            destaque === "total"
              ? "text-primary"
              : "text-foreground",
          ].join(" ")}
        >
          {formatarMoeda(
            valorNormalizado
          )}
        </p>

        {valorNormalizado === 0 && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            Sem valor calculado
          </p>
        )}
      </div>
    </article>
  );
}
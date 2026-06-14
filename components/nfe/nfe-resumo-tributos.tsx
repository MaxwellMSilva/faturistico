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
   * O valorIbs já representa a soma do
   * IBS estadual e municipal.
   *
   * Por isso, não somamos novamente
   * valorIbsUf e valorIbsMun.
   */

  const totalIbsCbs =
    normalizarValor(valorIbs) +
    normalizarValor(valorCbs);

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      {/* Cabeçalho */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ReceiptText size={20} />
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

        <div className="rounded-xl border bg-muted/10 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Tributos do modelo atual
          </p>

          <p className="mt-1 text-lg font-bold">
            {formatarMoeda(
              totalTributosAtuais
            )}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ICMS, PIS, COFINS e IPI */}

        <TributoGrupo
          icone={Landmark}
          titulo="ICMS, PIS, COFINS e IPI"
          descricao="Tributos atualmente calculados nos itens do documento."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <CardTributo
              titulo="Base de ICMS"
              valor={valorBaseIcms}
              destaque="base"
            />

            <CardTributo
              titulo="ICMS"
              valor={valorIcms}
            />

            <CardTributo
              titulo="PIS"
              valor={valorPis}
            />

            <CardTributo
              titulo="COFINS"
              valor={valorCofins}
            />

            <CardTributo
              titulo="IPI"
              valor={valorIpi}
            />
          </div>
        </TributoGrupo>

        {/* IBS e CBS */}

        <div className="border-t pt-6">
          <TributoGrupo
            icone={Scale}
            titulo="IBS e CBS"
            descricao="Valores relacionados à nova tributação sobre o consumo."
            complemento={
              <div className="rounded-lg border bg-muted/10 px-3 py-2 text-right">
                <p className="text-xs text-muted-foreground">
                  Total IBS + CBS
                </p>

                <p className="mt-1 font-semibold">
                  {formatarMoeda(
                    totalIbsCbs
                  )}
                </p>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <CardTributo
                titulo="Base IBS/CBS"
                valor={
                  valorBaseIbsCbs
                }
                destaque="base"
              />

              <CardTributo
                titulo="IBS estadual"
                valor={valorIbsUf}
              />

              <CardTributo
                titulo="IBS municipal"
                valor={valorIbsMun}
              />

              <CardTributo
                titulo="Total do IBS"
                valor={valorIbs}
                destaque="total"
              />

              <CardTributo
                titulo="CBS"
                valor={valorCbs}
              />
            </div>
          </TributoGrupo>
        </div>
      </div>

      {/* Observação */}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Percent
          size={18}
          className="mt-0.5 shrink-0 text-primary"
        />

        <p className="text-xs leading-5 text-muted-foreground">
          Os valores exibidos são
          consolidados a partir dos itens.
          Alterações em quantidade, preço,
          desconto ou classificação fiscal
          provocam o recálculo automático
          dos tributos.
        </p>
      </div>
    </section>
  );
}

type TributoGrupoProps = {
  icone: LucideIcon;

  titulo: string;
  descricao: string;

  complemento?: React.ReactNode;

  children: React.ReactNode;
};

function TributoGrupo({
  icone: Icone,
  titulo,
  descricao,
  complemento,
  children,
}: TributoGrupoProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icone size={17} />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              {titulo}
            </h3>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
  titulo: string;
  valor: number;

  destaque?:
    | "base"
    | "total";
};

function CardTributo({
  titulo,
  valor,
  destaque,
}: CardTributoProps) {
  const valorNormalizado =
    normalizarValor(valor);

  return (
    <div
      className={[
        "rounded-xl border p-4 transition-colors",
        destaque === "total"
          ? "border-primary/30 bg-primary/5"
          : destaque === "base"
            ? "bg-muted/10"
            : "bg-background",
      ].join(" ")}
    >
      <p className="text-xs text-muted-foreground">
        {titulo}
      </p>

      <p
        className={[
          "mt-1",
          destaque === "total"
            ? "font-bold text-primary"
            : "font-semibold",
        ].join(" ")}
      >
        {formatarMoeda(
          valorNormalizado
        )}
      </p>

      {valorNormalizado === 0 && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Sem valor calculado
        </p>
      )}
    </div>
  );
}
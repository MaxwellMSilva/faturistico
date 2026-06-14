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

function formatarMoeda(
  valor: number
) {
  const valorValido =
    Number.isFinite(valor)
      ? valor
      : 0;

  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valorValido);
}

type CardTributoProps = {
  titulo: string;
  valor: number;
};

function CardTributo({
  titulo,
  valor,
}: CardTributoProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">
        {titulo}
      </p>

      <p className="mt-1 font-semibold">
        {formatarMoeda(valor)}
      </p>
    </div>
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
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">
          Resumo tributário
        </h2>

        <p className="text-sm text-muted-foreground">
          Valores calculados a partir da
          tributação dos itens da NF-e.
        </p>
      </div>

      {/* Tributos do modelo atual */}

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">
            ICMS, PIS, COFINS e IPI
          </h3>

          <p className="text-xs text-muted-foreground">
            Tributos atualmente calculados
            nos itens.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <CardTributo
            titulo="Base de ICMS"
            valor={valorBaseIcms}
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
      </section>

      {/* IBS e CBS */}

      <section className="space-y-3 border-t pt-6">
        <div>
          <h3 className="text-sm font-semibold">
            IBS e CBS
          </h3>

          <p className="text-xs text-muted-foreground">
            Valores da nova tributação sobre
            o consumo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <CardTributo
            titulo="Base IBS/CBS"
            valor={valorBaseIbsCbs}
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
          />

          <CardTributo
            titulo="CBS"
            valor={valorCbs}
          />
        </div>
      </section>
    </div>
  );
}
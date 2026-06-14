type Props = {
  valorBaseIcms: number;
  valorIcms: number;
  valorPis: number;
  valorCofins: number;
  valorIpi: number;
};

function formatarMoeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

export function NfeResumoTributos({
  valorBaseIcms,
  valorIcms,
  valorPis,
  valorCofins,
  valorIpi,
}: Props) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          Resumo tributário
        </h2>

        <p className="text-sm text-muted-foreground">
          Valores calculados a partir da
          tributação dos itens.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">
            Base de ICMS
          </p>

          <p className="mt-1 font-semibold">
            {formatarMoeda(
              valorBaseIcms
            )}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">
            ICMS
          </p>

          <p className="mt-1 font-semibold">
            {formatarMoeda(
              valorIcms
            )}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">
            PIS
          </p>

          <p className="mt-1 font-semibold">
            {formatarMoeda(
              valorPis
            )}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">
            COFINS
          </p>

          <p className="mt-1 font-semibold">
            {formatarMoeda(
              valorCofins
            )}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">
            IPI
          </p>

          <p className="mt-1 font-semibold">
            {formatarMoeda(
              valorIpi
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
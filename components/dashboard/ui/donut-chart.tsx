import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./card";

export type DonutChartItem = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  title: string;
  subtitle?: string;
  items: DonutChartItem[];
  centerLabel?: string;
  centerValue?: string;
  className?: string;
};

export function DonutChart({
  title,
  subtitle,
  items,
  centerLabel = "Total",
  centerValue,
  className,
}: DonutChartProps) {
  const total = items.reduce(
    (acc, item) => acc + item.value,
    0
  );

  const raio = 40;
  const circunferencia = 2 * Math.PI * raio;
  let offset = 0;

  const segmentos = items.map((item) => {
    const porcentagem =
      total > 0
        ? item.value / total
        : 0;

    const comprimento =
      porcentagem * circunferencia;

    const segmento = {
      ...item,
      porcentagem: Math.round(
        porcentagem * 100
      ),
      dasharray: `${comprimento} ${circunferencia - comprimento}`,
      dashoffset: -offset,
    };

    offset += comprimento;

    return segmento;
  });

  const valorCentral =
    centerValue ??
    total.toLocaleString("pt-BR");

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>

        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6 pt-2">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r={raio}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/50"
            />

            {total > 0 ? (
              segmentos.map((segmento) => (
                <circle
                  key={segmento.label}
                  cx="50"
                  cy="50"
                  r={raio}
                  fill="none"
                  stroke={segmento.color}
                  strokeWidth="12"
                  strokeDasharray={
                    segmento.dasharray
                  }
                  strokeDashoffset={
                    segmento.dashoffset
                  }
                  strokeLinecap="round"
                />
              ))
            ) : (
              <circle
                cx="50"
                cy="50"
                r={raio}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="12"
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[11px] text-muted-foreground">
              {centerLabel}
            </p>

            <p className="text-xl font-bold tracking-tight">
              {valorCentral}
            </p>
          </div>
        </div>

        <div className="grid w-full gap-2">
          {items.map((item) => {
            const porcentagem =
              total > 0
                ? Math.round(
                    (item.value / total) *
                      100
                  )
                : 0;

            return (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        item.color,
                    }}
                  />

                  <span className="truncate text-muted-foreground">
                    {item.label}
                  </span>
                </div>

                <span className="shrink-0 font-medium">
                  {porcentagem}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";

import {
  ArrowRight,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge, type BadgeVariant } from "./badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

export type ActivityRow = {
  id: string;
  tipo: string;
  data: string;
  destino: string;
  categoria?: string;
  categoriaVariant?: BadgeVariant;
  valor: string;
  status: string;
  statusVariant: BadgeVariant;
  href?: string;
  icon?: LucideIcon;
};

type ActivityTableProps = {
  title?: string;
  rows: ActivityRow[];
  viewAllHref?: string;
  className?: string;
};

function ActivityTableRoot({
  title = "NF-e recentes",
  rows,
  viewAllHref,
  className,
}: ActivityTableProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todas
          </Link>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-y border-border/60 bg-muted/20">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Data
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Documento
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Cliente
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Valor
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma NF-e registrada.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const Icone =
                    row.icon ?? FileText;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {row.data}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icone size={14} />
                          </div>

                          {row.href ? (
                            <Link
                              href={row.href}
                              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                              {row.tipo}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium">
                              {row.tipo}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="max-w-[180px] truncate px-4 py-4 text-sm">
                        {row.destino}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            row.statusVariant
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right text-sm font-semibold">
                        {row.valor}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {viewAllHref && (
        <CardFooter className="justify-between">
          <span className="text-xs text-muted-foreground">
            {rows.length} registros exibidos
          </span>

          <Link
            href={viewAllHref}
            className={cn(
              "inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            )}
          >
            Ver todas

            <ArrowRight size={14} />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export const ActivityTable = ActivityTableRoot;

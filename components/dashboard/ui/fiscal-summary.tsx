import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./card";

type FiscalSummaryItem = {
  label: string;
  value: string;
  tone: "green" | "red" | "blue" | "purple";
};

type FiscalSummaryProps = {
  title?: string;
  badge?: string;
  items: FiscalSummaryItem[];
  className?: string;
};

const toneStyles: Record<
  FiscalSummaryItem["tone"],
  string
> = {
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-100",
  red: "bg-red-50 text-red-700 border-red-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  purple:
    "bg-violet-50 text-violet-700 border-violet-100",
};

export function FiscalSummary({
  title = "Análise de emissões",
  badge,
  items,
  className,
}: FiscalSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>

        {badge && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {badge}
          </span>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-2xl border px-4 py-4",
                toneStyles[item.tone]
              )}
            >
              <p className="text-xs font-medium opacity-80">
                {item.label}
              </p>

              <p className="mt-1 text-lg font-bold tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

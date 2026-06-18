import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Card } from "./card";
import { Sparkline } from "./sparkline";

type MetricDelta = {
  value: string;
  trend: "up" | "down" | "neutral";
};

type MetricCardProps = {
  label: string;
  value: string | number;
  delta?: MetricDelta;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  className?: string;
};

function MetricCardRoot({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  href,
  sparklineData,
  sparklineColor = "#3B82F6",
  className,
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "overflow-hidden p-0 transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0_0_0/0.08)]",
        href &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-muted-foreground">
            {label}
          </p>

          {Icon && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon size={15} />
            </div>
          )}
        </div>

        <p className="mt-3 text-[28px] font-bold leading-none tracking-tight">
          {value}
        </p>

        {(delta || hint) && (
          <div className="mt-3 flex items-center gap-2">
            {delta && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  delta.trend === "up" &&
                    "bg-emerald-50 text-emerald-700",
                  delta.trend === "down" &&
                    "bg-red-50 text-red-600",
                  delta.trend ===
                    "neutral" &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {delta.trend === "up" && (
                  <ArrowUpRight size={12} />
                )}

                {delta.trend === "down" && (
                  <ArrowDownRight size={12} />
                )}

                {delta.value}
              </span>
            )}

            {hint && (
              <span className="text-[11px] text-muted-foreground">
                {hint}
              </span>
            )}
          </div>
        )}
      </div>

      {sparklineData &&
        sparklineData.length > 0 && (
          <div className="px-2 pb-2">
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
            />
          </div>
        )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href}>{content}</Link>
    );
  }

  return content;
}

export const MetricCard = MetricCardRoot;

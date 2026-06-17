import Link from "next/link";

import {
  ArrowDownRight,
  ArrowUpRight,
  Info,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Card } from "./card";

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
  className?: string;
};

function MetricCardRoot({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  href,
  className,
}: MetricCardProps) {
  const content = (
    <Card
      className={cn(
        "p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-[0_8px_24px_rgb(0_0_0/0.06)]",
        href &&
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[13px] text-muted-foreground">
            {label}
          </p>

          <Info
            size={13}
            className="text-muted-foreground/50"
          />
        </div>

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
        <div className="mt-3 flex items-center justify-between gap-2">
          {hint && (
            <span className="text-xs text-muted-foreground">
              {hint}
            </span>
          )}

          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                delta.trend === "up" &&
                  "text-emerald-600",
                delta.trend === "down" &&
                  "text-red-600",
                delta.trend ===
                  "neutral" &&
                  "text-muted-foreground"
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

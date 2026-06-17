"use client";

import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./card";

export type BarChartItem = {
  label: string;
  value: number;
};

type BarChartProps = {
  title: string;
  subtitle?: string;
  data: BarChartItem[];
  activeIndex?: number;
  className?: string;
};

export function BarChart({
  title,
  subtitle,
  data,
  activeIndex,
  className,
}: BarChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => d.value),
    1
  );

  const highlight =
    activeIndex ??
    data.findIndex(
      (d) => d.value === maxValue
    );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>

          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="flex h-[180px] items-end gap-2 sm:gap-3">
          {data.map((item, index) => {
            const height = Math.max(
              (item.value / maxValue) *
                100,
              4
            );

            const isActive =
              index === highlight;

            return (
              <div
                key={item.label}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="relative flex h-full w-full items-end justify-center">
                  {isActive &&
                    item.value > 0 && (
                      <div className="absolute -top-8 rounded-md border border-border/60 bg-popover px-2 py-1 text-[10px] font-medium shadow-sm">
                        {item.value}
                      </div>
                    )}

                  <div
                    className={cn(
                      "w-full max-w-[36px] rounded-t-md transition-all duration-300",
                      isActive
                        ? "bg-primary"
                        : "bg-muted group-hover:bg-muted-foreground/20"
                    )}
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="text-[10px] font-medium text-muted-foreground">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

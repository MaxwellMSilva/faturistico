import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

const variantStyles: Record<
  BadgeVariant,
  string
> = {
  default:
    "bg-primary/10 text-primary",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger:
    "bg-red-500/10 text-red-700 dark:text-red-400",
  neutral:
    "bg-muted text-muted-foreground",
};

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: BadgeVariant;
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant };

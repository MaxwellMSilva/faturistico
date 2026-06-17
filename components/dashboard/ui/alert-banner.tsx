import {
  AlertTriangle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AlertBannerVariant =
  | "info"
  | "warning"
  | "danger";

const variantConfig: Record<
  AlertBannerVariant,
  {
    icon: LucideIcon;
    container: string;
    iconColor: string;
  }
> = {
  info: {
    icon: Sparkles,
    container:
      "border-blue-200/80 bg-blue-50/80 dark:border-blue-900/40 dark:bg-blue-950/30",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    container:
      "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/30",
    iconColor: "text-amber-600",
  },
  danger: {
    icon: AlertTriangle,
    container:
      "border-red-200/80 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/30",
    iconColor: "text-red-600",
  },
};

type AlertBannerProps = {
  title: string;
  description?: string;
  variant?: AlertBannerVariant;
  className?: string;
};

export function AlertBanner({
  title,
  description,
  variant = "info",
  className,
}: AlertBannerProps) {
  const config =
    variantConfig[variant];

  const Icone = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm",
        config.container,
        className
      )}
    >
      <Icone
        size={16}
        className={cn(
          "mt-0.5 shrink-0",
          config.iconColor
        )}
      />

      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {title}
        </p>

        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

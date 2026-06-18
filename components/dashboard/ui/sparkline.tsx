import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  color?: string;
  className?: string;
};

export function Sparkline({
  data,
  color = "#3B82F6",
  className,
}: SparklineProps) {
  if (data.length < 2) {
    return (
      <svg
        viewBox="0 0 120 32"
        className={cn("h-8 w-full", className)}
        preserveAspectRatio="none"
      >
        <path
          d="M0,16 L120,16"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.3"
        />
      </svg>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x =
        (index / (data.length - 1)) *
        120;

      const y =
        28 -
        ((value - min) / range) * 24;

      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,32 ${points} 120,32`;

  return (
    <svg
      viewBox="0 0 120 32"
      className={cn("h-8 w-full", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={`spark-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.25"
          />

          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <polygon
        points={areaPoints}
        fill={`url(#spark-${color.replace("#", "")})`}
      />

      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

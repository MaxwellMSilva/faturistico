import { Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card } from "./card";

type PreviewCardProps = {
  titulo: string;
  subtitulo: string;
  identificador: string;
  meta?: string;
  className?: string;
};

export function PreviewCard({
  titulo,
  subtitulo,
  identificador,
  meta,
  className,
}: PreviewCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 p-0 shadow-[0_12px_40px_rgb(37_99_235/0.25)]",
        className
      )}
    >
      <div className="relative aspect-[1.6/1] w-full bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex h-9 w-12 items-center justify-center rounded-md border border-white/20 bg-white/10 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-0.5">
              {Array.from({ length: 4 }).map(
                (_, i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-amber-300/90"
                  />
                )
              )}
            </div>
          </div>

          <Building2
            size={22}
            className="opacity-80"
          />
        </div>

        <div className="mt-8">
          <p className="font-mono text-lg tracking-[0.2em]">
            {identificador}
          </p>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/70">
                {subtitulo}
              </p>

              <p className="mt-1 text-sm font-semibold">
                {titulo}
              </p>
            </div>

            {meta && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/70">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {meta}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>
    </Card>
  );
}

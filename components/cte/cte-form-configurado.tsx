"use client";

import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  CteForm as CteFormBase,
} from "@/components/cte/cte-form";

type Props =
  ComponentProps<typeof CteFormBase>;

export function CteForm(
  props: Props
) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const cteComParametrosCentrais =
    useMemo(() => {
      if (!props.cte) {
        return props.cte;
      }

      return {
        ...props.cte,
        rntrc:
          props.configuracao?.rntrc ??
          props.cte.rntrc,
      };
    }, [
      props.cte,
      props.configuracao?.rntrc,
    ]);

  useEffect(() => {
    function bloquearRntrc() {
      const container =
        containerRef.current;

      if (!container) {
        return;
      }

      const campo =
        container.querySelector<HTMLInputElement>(
          'input[placeholder="8 dígitos ou ISENTO"]'
        );

      if (!campo) {
        return;
      }

      if (!campo.disabled) {
        campo.disabled = true;
      }

      campo.setAttribute(
        "aria-readonly",
        "true"
      );
      campo.title =
        "Altere o RNTRC em Configurações > Parâmetros de emissão > CT-e.";
    }

    bloquearRntrc();

    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const observer =
      new MutationObserver(
        bloquearRntrc
      );

    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: [
        "disabled",
      ],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="space-y-3"
    >
      <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Ambiente, série, numeração e RNTRC são parâmetros globais. Para alterá-los, acesse <strong className="font-semibold text-foreground">Configurações → Parâmetros de emissão</strong>.
      </div>

      <CteFormBase
        {...props}
        cte={
          cteComParametrosCentrais
        }
      />
    </div>
  );
}

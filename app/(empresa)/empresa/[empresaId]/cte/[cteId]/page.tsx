import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { getCte } from "@/actions/cte/get-cte";
import { getDadosFormCte } from "@/actions/cte/get-dados-form-cte";
import { CteActions } from "@/components/cte/cte-actions";
import { CteForm } from "@/components/cte/cte-form";
import {
  contextoPossuiPrivilegioEmpresa,
  validarPrivilegioEmpresa,
} from "@/lib/empresa/validar-privilegio-empresa";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS: Record<
  string,
  { label: string; className: string }
> = {
  RASCUNHO: {
    label: "Rascunho",
    className:
      "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  VALIDANDO: {
    label: "Validando",
    className:
      "border-sky-300 bg-sky-50 text-sky-700",
  },
  VALIDADO: {
    label: "Validado",
    className:
      "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  PROCESSANDO: {
    label: "Processando",
    className:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  AUTORIZADO: {
    label: "Autorizado",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REJEITADO: {
    label: "Rejeitado",
    className:
      "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
  CANCELADO: {
    label: "Cancelado",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  },
};

type Props = {
  params: Promise<{
    empresaId: string;
    cteId: string;
  }>;
};

export default async function CteDetalhesPage({
  params,
}: Props) {
  const { empresaId, cteId } =
    await params;

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.CTE_VISUALIZAR,
      {
        exigirEmpresaAtiva: false,
      }
    );

  const [cte, dados] =
    await Promise.all([
      getCte(empresaId, cteId),
      getDadosFormCte(empresaId),
    ]);

  if (!cte) {
    notFound();
  }

  const possui = (
    privilegio: PrivilegioEmpresa
  ) =>
    contextoPossuiPrivilegioEmpresa(
      contexto,
      privilegio
    );

  const editavel = [
    "RASCUNHO",
    "VALIDADO",
    "REJEITADO",
  ].includes(cte.status);

  const podeEditar =
    editavel &&
    possui(
      PrivilegioEmpresa.CTE_EDITAR
    );

  const status =
    STATUS[cte.status] ?? {
      label: cte.status,
      className: "",
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link
            href={`/empresa/${empresaId}/cte`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Voltar para CT-e
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              CT-e {cte.numero}/{cte.serie}
            </h1>
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                status.className
              )}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Modelo 57 · Modal rodoviário · {dados.configuracao?.ambiente === "PRODUCAO" ? "Produção" : "Homologação"}
          </p>
        </div>

        <CteActions
          empresaId={empresaId}
          cteId={cteId}
          status={cte.status}
          podeValidar={possui(
            PrivilegioEmpresa.CTE_VALIDAR
          )}
          podeEmitir={possui(
            PrivilegioEmpresa.CTE_EMITIR
          )}
          podeCancelar={possui(
            PrivilegioEmpresa.CTE_CANCELAR
          )}
          podeExcluir={possui(
            PrivilegioEmpresa.CTE_EXCLUIR_RASCUNHO
          )}
          possuiXml={Boolean(
            cte.xmlAutorizado ??
              cte.xmlAssinado ??
              cte.xmlGerado
          )}
        />
      </div>

      {(cte.chaveAcesso ||
        cte.protocoloAutorizacao ||
        cte.motivoStatusSefaz) && (
        <div className="grid gap-3 rounded-2xl border bg-card p-5 shadow-sm md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Chave de acesso
            </p>
            <p className="mt-1 break-all font-mono text-sm">
              {cte.chaveAcesso ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Protocolo
            </p>
            <p className="mt-1 font-mono text-sm">
              {cte.protocoloAutorizacao ?? "—"}
            </p>
          </div>
          {cte.motivoStatusSefaz && (
            <div className="md:col-span-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-sm">
              <KeyRound
                size={16}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <span>
                {cte.codigoStatusSefaz
                  ? `${cte.codigoStatusSefaz} - `
                  : ""}
                {cte.motivoStatusSefaz}
              </span>
            </div>
          )}
        </div>
      )}

      {!podeEditar && editavel && (
        <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Você pode consultar este CT-e, mas não possui permissão para editar os dados.
        </div>
      )}

      <CteForm
        empresaId={empresaId}
        empresa={dados.empresa}
        clientes={dados.clientes}
        configuracao={dados.configuracao}
        cte={cte}
        somenteLeitura={!podeEditar}
      />
    </div>
  );
}

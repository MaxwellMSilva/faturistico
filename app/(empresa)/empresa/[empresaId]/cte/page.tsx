import Link from "next/link";

import {
  FileText,
  Plus,
  Search,
} from "lucide-react";
import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { getCtes } from "@/actions/cte/get-ctes";
import { getResumoConfiguracaoCte } from "@/actions/cte/get-resumo-configuracao-cte";
import { CteConfigCard } from "@/components/cte/cte-config-card";
import {
  buttonVariants,
} from "@/components/ui/button";
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
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
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

function dinheiro(valor: number) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

function dataHora(data: Date) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "America/Porto_Velho",
    }
  ).format(data);
}

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
  searchParams: Promise<{
    busca?: string;
  }>;
};

export default async function CtePage({
  params,
  searchParams,
}: Props) {
  const { empresaId } = await params;
  const { busca = "" } =
    await searchParams;

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.CTE_VISUALIZAR,
      {
        exigirEmpresaAtiva: false,
      }
    );

  const possui = (
    privilegio: PrivilegioEmpresa
  ) =>
    contextoPossuiPrivilegioEmpresa(
      contexto,
      privilegio
    );

  const podeCriar = possui(
    PrivilegioEmpresa.CTE_CRIAR
  );

  const podeEditarConfiguracao =
    possui(
      PrivilegioEmpresa.CONFIGURACOES_EDITAR
    );

  const [ctes, resumo] =
    await Promise.all([
      getCtes(empresaId),
      getResumoConfiguracaoCte(
        empresaId
      ),
    ]);

  const termo =
    busca.trim().toLowerCase();

  const filtrados = termo
    ? ctes.filter((cte) => {
        const valores = [
          cte.numero,
          cte.serie,
          cte.status,
          cte.remetente?.nome,
          cte.remetente?.cpfCnpj,
          cte.destinatario?.nome,
          cte.destinatario?.cpfCnpj,
          cte.municipioInicio,
          cte.ufInicio,
          cte.municipioFim,
          cte.ufFim,
          cte.chaveAcesso,
        ];

        return valores.some((valor) =>
          String(valor ?? "")
            .toLowerCase()
            .includes(termo)
        );
      })
    : ctes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            CT-e
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conhecimentos de Transporte Eletrônicos — modelo 57.
          </p>
        </div>

        {podeCriar && (
          <Link
            href={`/empresa/${empresaId}/cte/novo`}
            className={cn(
              buttonVariants({
                size: "lg",
              }),
              "h-10 gap-2"
            )}
          >
            <Plus size={16} />
            Novo CT-e
          </Link>
        )}
      </div>

      <CteConfigCard
        empresaId={empresaId}
        configuracao={
          resumo.configuracao
        }
        possuiCertificado={
          resumo.possuiCertificado
        }
        certificadoExpirado={
          resumo.certificadoExpirado
        }
        validadeCertificado={
          resumo.validadeCertificado
        }
        podeEditarConfiguracao={
          podeEditarConfiguracao
        }
      />

      <form className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="relative max-w-xl">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por número, cliente, documento, rota ou chave..."
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={24} />
            </div>
            <h2 className="mt-4 font-semibold">
              Nenhum CT-e encontrado
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {termo
                ? "Não encontramos documentos para a busca informada."
                : "Crie o primeiro CT-e para começar a emissão de conhecimentos de transporte."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    CT-e
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Emissão
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Remetente
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Destinatário
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Rota
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Prestação
                  </th>
                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtrados.map((cte) => {
                  const status =
                    STATUS[cte.status] ?? {
                      label: cte.status,
                      className: "",
                    };

                  return (
                    <tr
                      key={cte.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/empresa/${empresaId}/cte/${cte.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {cte.numero}/{cte.serie}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Modelo 57
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {dataHora(
                          cte.dataEmissao
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-52 truncate font-medium">
                          {cte.remetente?.nome ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cte.remetente?.cpfCnpj ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-52 truncate font-medium">
                          {cte.destinatario?.nome ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cte.destinatario?.cpfCnpj ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {cte.municipioInicio}/{cte.ufInicio}
                        <span className="mx-2 text-muted-foreground">
                          →
                        </span>
                        {cte.municipioFim}/{cte.ufFim}
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        {dinheiro(
                          cte.valorPrestacao
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                            status.className
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

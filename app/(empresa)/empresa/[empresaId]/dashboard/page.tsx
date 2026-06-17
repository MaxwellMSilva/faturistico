import {
  CircleCheck,
  FileText,
  Package,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";

import { DashboardToolbar } from "@/components/dashboard/dashboard-toolbar";
import {
  ActivityTable,
  type ActivityRow,
} from "@/components/dashboard/ui/activity-table";
import { AlertBanner } from "@/components/dashboard/ui/alert-banner";
import {
  BarChart,
  type BarChartItem,
} from "@/components/dashboard/ui/bar-chart";
import {
  type BadgeVariant,
} from "@/components/dashboard/ui/badge";
import { MetricCard } from "@/components/dashboard/ui/metric-card";
import { PreviewCard } from "@/components/dashboard/ui/preview-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/dashboard/ui/card";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

const mesesAbrev = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const statusLabels: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  RASCUNHO: {
    label: "Rascunho",
    variant: "neutral",
  },
  VALIDANDO: {
    label: "Validando",
    variant: "warning",
  },
  AUTORIZADA: {
    label: "Autorizada",
    variant: "success",
  },
  REJEITADA: {
    label: "Rejeitada",
    variant: "danger",
  },
  CANCELADA: {
    label: "Cancelada",
    variant: "neutral",
  },
};

function formatarMoeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

function formatarCnpj(
  cnpj: string
) {
  const numeros =
    cnpj.replace(/\D/g, "");

  if (numeros.length !== 14) {
    return cnpj;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function formatarCnpjMascara(
  cnpj: string
) {
  const formatado =
    formatarCnpj(cnpj);

  return formatado.replace(
    /\d(?=\d{4})/g,
    "•"
  );
}

function formatarDataHora(
  data: Date
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(data);
}

export default async function EmpresaDashboardPage({
  params,
}: Props) {
  const { empresaId } =
    await params;

  const { empresa } =
    await getContextoEmpresa(
      empresaId
    );

  const agora = new Date();
  const inicioPeriodo =
    new Date(
      agora.getFullYear(),
      agora.getMonth() - 6,
      1
    );

  const [
    totalClientes,
    totalProdutos,
    totalNfe,
    totalNfeAutorizadas,
    totalNfeRejeitadas,
    notasRecentes,
    notasPeriodo,
  ] = await Promise.all([
    prisma.cliente.count({
      where: {
        empresaId,
        ativo: true,
      },
    }),

    prisma.produto.count({
      where: {
        empresaId,
        ativo: true,
      },
    }),

    prisma.notaFiscal.count({
      where: {
        empresaId,
        tipoDocumento: "NFE",
      },
    }),

    prisma.notaFiscal.count({
      where: {
        empresaId,
        tipoDocumento: "NFE",
        status: "AUTORIZADA",
      },
    }),

    prisma.notaFiscal.count({
      where: {
        empresaId,
        tipoDocumento: "NFE",
        status: "REJEITADA",
      },
    }),

    prisma.notaFiscal.findMany({
      where: {
        empresaId,
        tipoDocumento: "NFE",
      },
      orderBy: {
        dataEmissao: "desc",
      },
      take: 5,
      select: {
        id: true,
        numero: true,
        serie: true,
        dataEmissao: true,
        status: true,
        valorProdutos: true,
        cliente: {
          select: {
            nome: true,
          },
        },
      },
    }),

    prisma.notaFiscal.findMany({
      where: {
        empresaId,
        tipoDocumento: "NFE",
        dataEmissao: {
          gte: inicioPeriodo,
        },
      },
      select: {
        dataEmissao: true,
      },
    }),
  ]);

  const empresaNome =
    empresa.nomeFantasia?.trim() ||
    empresa.razaoSocial;

  const baseUrl =
    `/empresa/${empresaId}`;

  const taxaAutorizacao =
    totalNfe > 0
      ? Math.round(
          (totalNfeAutorizadas /
            totalNfe) *
            100
        )
      : 0;

  const atualizadoEm =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(agora);

  const contagemMensal =
    new Map<number, number>();

  for (
    let i = 6;
    i >= 0;
    i--
  ) {
    const mes =
      (agora.getMonth() - i + 12) %
      12;

    contagemMensal.set(mes, 0);
  }

  for (const nota of notasPeriodo) {
    const mes =
      nota.dataEmissao.getMonth();

    contagemMensal.set(
      mes,
      (contagemMensal.get(mes) ??
        0) + 1
    );
  }

  const dadosGrafico: BarChartItem[] =
    Array.from(
      contagemMensal.entries()
    ).map(([mes, valor]) => ({
      label: mesesAbrev[mes],
      value: valor,
    }));

  const atividade: ActivityRow[] =
    notasRecentes.map((nota) => {
      const status =
        statusLabels[
          nota.status
        ] ?? {
          label: nota.status,
          variant:
            "neutral" as BadgeVariant,
        };

      const destino =
        nota.cliente.nome;

      return {
        id: nota.id,
        tipo: `NF-e ${nota.numero}/${nota.serie}`,
        data: formatarDataHora(
          nota.dataEmissao
        ),
        destino,
        valor: formatarMoeda(
          Number(nota.valorProdutos)
        ),
        status: status.label,
        statusVariant:
          status.variant,
        href: `${baseUrl}/nfe/${nota.id}`,
      };
    });

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <DashboardToolbar
        atualizadoEm={atualizadoEm}
        novaNfeHref={`${baseUrl}/nfe`}
        clientesHref={`${baseUrl}/clientes`}
        configuracoesHref={`${baseUrl}/configuracoes`}
      />

      {totalNfeRejeitadas > 0 && (
        <AlertBanner
          variant="danger"
          title={`${totalNfeRejeitadas} NF-e rejeitada${totalNfeRejeitadas > 1 ? "s" : ""} precisam de atenção`}
          description="Revise os documentos com erro de validação antes de reenviar."
        />
      )}

      {!empresa.ativo && (
        <AlertBanner
          variant="warning"
          title="Empresa inativa no sistema"
          description="Algumas operações fiscais podem estar indisponíveis até a reativação."
        />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Clientes ativos"
          value={totalClientes}
          hint="Cadastros disponíveis"
          icon={Users}
          href={`${baseUrl}/clientes`}
        />

        <MetricCard
          label="Produtos ativos"
          value={totalProdutos}
          hint="Itens e serviços"
          icon={Package}
          href={`${baseUrl}/produtos`}
        />

        <MetricCard
          label="NF-e cadastradas"
          value={totalNfe}
          hint="Documentos no sistema"
          icon={FileText}
          href={`${baseUrl}/nfe`}
        />

        <MetricCard
          label="NF-e autorizadas"
          value={totalNfeAutorizadas}
          hint="Documentos aprovados"
          icon={CircleCheck}
          href={`${baseUrl}/nfe`}
          delta={
            totalNfe > 0
              ? {
                  value: `${taxaAutorizacao}% do total`,
                  trend: "up",
                }
              : undefined
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <BarChart
          title="Visão de emissões"
          subtitle="NF-e emitidas nos últimos 7 meses"
          data={dadosGrafico}
        />

        <div className="space-y-4">
          <PreviewCard
            titulo={empresaNome}
            subtitulo="Empresa"
            identificador={formatarCnpjMascara(
              empresa.cnpj
            )}
            meta={
              empresa.ativo
                ? "Ativa"
                : "Inativa"
            }
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                Meta de autorização
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold tracking-tight">
                  {taxaAutorizacao}%
                </p>

                <span className="text-xs text-muted-foreground">
                  alvo 95%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(taxaAutorizacao, 100)}%`,
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {totalNfeAutorizadas} de{" "}
                {totalNfe} documentos
                autorizados
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <ActivityTable
        rows={atividade}
        viewAllHref={`${baseUrl}/nfe`}
      />
    </div>
  );
}

import {
  CircleCheck,
  FileText,
  Package,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";

import {
  ActivityTable,
  type ActivityRow,
} from "@/components/dashboard/ui/activity-table";
import { AlertBanner } from "@/components/dashboard/ui/alert-banner";
import {
  DonutChart,
  type DonutChartItem,
} from "@/components/dashboard/ui/donut-chart";
import {
  type BadgeVariant,
} from "@/components/dashboard/ui/badge";
import { FiscalSummary } from "@/components/dashboard/ui/fiscal-summary";
import { MetricCard } from "@/components/dashboard/ui/metric-card";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

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

const statusDonutColors: Record<
  string,
  string
> = {
  AUTORIZADA: "#10B981",
  RASCUNHO: "#94A3B8",
  VALIDANDO: "#F59E0B",
  REJEITADA: "#EF4444",
  CANCELADA: "#CBD5E1",
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

function formatarData(
  data: Date
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(data);
}

function calcularVariacao(
  atual: number,
  anterior: number
) {
  if (anterior === 0) {
    return atual > 0
      ? {
          value: "+100%",
          trend: "up" as const,
        }
      : undefined;
  }

  const diferenca =
    ((atual - anterior) /
      anterior) *
    100;

  const arredondado = Math.round(
    Math.abs(diferenca)
  );

  if (diferenca > 0) {
    return {
      value: `+${arredondado}%`,
      trend: "up" as const,
    };
  }

  if (diferenca < 0) {
    return {
      value: `-${arredondado}%`,
      trend: "down" as const,
    };
  }

  return {
    value: "0%",
    trend: "neutral" as const,
  };
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
  const inicioMesAtual = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    1
  );
  const inicioMesAnterior = new Date(
    agora.getFullYear(),
    agora.getMonth() - 1,
    1
  );
  const fimMesAnterior = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    0,
    23,
    59,
    59
  );
  const inicioPeriodo =
    new Date(
      agora.getFullYear(),
      agora.getMonth() - 6,
      1
    );

  const filtroNfe = {
    empresaId,
    tipoDocumento: "NFE" as const,
  };

  const [
    totalClientes,
    totalProdutos,
    totalNfe,
    totalNfeAutorizadas,
    totalNfeRejeitadas,
    totalNfeRascunho,
    notasRecentes,
    notasPeriodo,
    faturamentoAutorizado,
    faturamentoMesAtual,
    faturamentoMesAnterior,
    nfeMesAtual,
    nfeMesAnterior,
    statusAgrupados,
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
      where: filtroNfe,
    }),

    prisma.notaFiscal.count({
      where: {
        ...filtroNfe,
        status: "AUTORIZADA",
      },
    }),

    prisma.notaFiscal.count({
      where: {
        ...filtroNfe,
        status: "REJEITADA",
      },
    }),

    prisma.notaFiscal.count({
      where: {
        ...filtroNfe,
        status: "RASCUNHO",
      },
    }),

    prisma.notaFiscal.findMany({
      where: filtroNfe,
      orderBy: {
        dataEmissao: "desc",
      },
      take: 6,
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
        ...filtroNfe,
        dataEmissao: {
          gte: inicioPeriodo,
        },
      },
      select: {
        dataEmissao: true,
        status: true,
        valorProdutos: true,
      },
    }),

    prisma.notaFiscal.aggregate({
      where: {
        ...filtroNfe,
        status: "AUTORIZADA",
      },
      _sum: {
        valorProdutos: true,
      },
    }),

    prisma.notaFiscal.aggregate({
      where: {
        ...filtroNfe,
        status: "AUTORIZADA",
        dataEmissao: {
          gte: inicioMesAtual,
        },
      },
      _sum: {
        valorProdutos: true,
      },
    }),

    prisma.notaFiscal.aggregate({
      where: {
        ...filtroNfe,
        status: "AUTORIZADA",
        dataEmissao: {
          gte: inicioMesAnterior,
          lte: fimMesAnterior,
        },
      },
      _sum: {
        valorProdutos: true,
      },
    }),

    prisma.notaFiscal.count({
      where: {
        ...filtroNfe,
        dataEmissao: {
          gte: inicioMesAtual,
        },
      },
    }),

    prisma.notaFiscal.count({
      where: {
        ...filtroNfe,
        dataEmissao: {
          gte: inicioMesAnterior,
          lte: fimMesAnterior,
        },
      },
    }),

    prisma.notaFiscal.groupBy({
      by: ["status"],
      where: filtroNfe,
      _count: {
        _all: true,
      },
    }),
  ]);

  const baseUrl =
    `/empresa/${empresaId}`;

  const totalFaturado = Number(
    faturamentoAutorizado._sum
      .valorProdutos ?? 0
  );
  const faturadoMesAtual = Number(
    faturamentoMesAtual._sum
      .valorProdutos ?? 0
  );
  const faturadoMesAnterior = Number(
    faturamentoMesAnterior._sum
      .valorProdutos ?? 0
  );

  const taxaAutorizacao =
    totalNfe > 0
      ? Math.round(
          (totalNfeAutorizadas /
            totalNfe) *
            100
        )
      : 0;

  const contagemMensal =
    new Map<
      number,
      { quantidade: number; valor: number }
    >();

  for (
    let i = 6;
    i >= 0;
    i--
  ) {
    const mes =
      (agora.getMonth() - i + 12) %
      12;

    contagemMensal.set(mes, {
      quantidade: 0,
      valor: 0,
    });
  }

  for (const nota of notasPeriodo) {
    const mes =
      nota.dataEmissao.getMonth();

    const atual =
      contagemMensal.get(mes) ?? {
        quantidade: 0,
        valor: 0,
      };

    contagemMensal.set(mes, {
      quantidade:
        atual.quantidade + 1,
      valor:
        atual.valor +
        Number(nota.valorProdutos),
    });
  }

  const serieQuantidade = Array.from(
    contagemMensal.values()
  ).map((item) => item.quantidade);

  const serieFaturamento = Array.from(
    contagemMensal.values()
  ).map((item) => item.valor);

  const donutItens: DonutChartItem[] =
    statusAgrupados
      .map((item) => ({
        label:
          statusLabels[item.status]
            ?.label ?? item.status,
        value: item._count._all,
        color:
          statusDonutColors[
            item.status
          ] ?? "#94A3B8",
      }))
      .filter((item) => item.value > 0)
      .sort(
        (a, b) => b.value - a.value
      );

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

      return {
        id: nota.id,
        tipo: `NF-e ${nota.numero}/${nota.serie}`,
        data: formatarData(
          nota.dataEmissao
        ),
        destino:
          nota.cliente.nome,
        valor: formatarMoeda(
          Number(nota.valorProdutos)
        ),
        status: status.label,
        statusVariant:
          status.variant,
        href: `${baseUrl}/nfe/${nota.id}`,
      };
    });

  const crescimentoFaturamento =
    calcularVariacao(
      faturadoMesAtual,
      faturadoMesAnterior
    );

  return (
    <div className="w-full space-y-6">
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
          label="Faturamento autorizado"
          value={formatarMoeda(
            totalFaturado
          )}
          hint="vs mês anterior"
          delta={calcularVariacao(
            faturadoMesAtual,
            faturadoMesAnterior
          )}
          icon={FileText}
          href={`${baseUrl}/nfe`}
          sparklineData={
            serieFaturamento
          }
          sparklineColor="#3B82F6"
        />

        <MetricCard
          label="NF-e do mês"
          value={nfeMesAtual}
          hint="emissões no período"
          delta={calcularVariacao(
            nfeMesAtual,
            nfeMesAnterior
          )}
          icon={CircleCheck}
          href={`${baseUrl}/nfe`}
          sparklineData={
            serieQuantidade
          }
          sparklineColor="#6366F1"
        />

        <MetricCard
          label="Clientes ativos"
          value={totalClientes}
          hint="cadastros disponíveis"
          icon={Users}
          href={`${baseUrl}/clientes`}
          sparklineData={
            serieQuantidade
          }
          sparklineColor="#10B981"
        />

        <MetricCard
          label="Produtos ativos"
          value={totalProdutos}
          hint="itens e serviços"
          icon={Package}
          href={`${baseUrl}/produtos`}
          sparklineData={
            serieQuantidade
          }
          sparklineColor="#8B5CF6"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <ActivityTable
          title="NF-e recentes"
          rows={atividade}
          viewAllHref={`${baseUrl}/nfe`}
        />

        <DonutChart
          title="Distribuição de NF-e"
          subtitle="Por status dos documentos"
          items={donutItens}
          centerLabel="Total NF-e"
          centerValue={String(totalNfe)}
        />
      </section>

      <FiscalSummary
        badge={
          crescimentoFaturamento
            ? `${crescimentoFaturamento.value} crescimento`
            : undefined
        }
        items={[
          {
            label: "Faturamento do mês",
            value: formatarMoeda(
              faturadoMesAtual
            ),
            tone: "green",
          },
          {
            label: "NF-e em rascunho",
            value: String(
              totalNfeRascunho
            ),
            tone: "red",
          },
          {
            label: "NF-e autorizadas",
            value: String(
              totalNfeAutorizadas
            ),
            tone: "blue",
          },
          {
            label: "Taxa de autorização",
            value: `${taxaAutorizacao}%`,
            tone: "purple",
          },
        ]}
      />
    </div>
  );
}

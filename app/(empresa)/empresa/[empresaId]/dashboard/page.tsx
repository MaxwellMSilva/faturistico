import {
  PrivilegioEmpresa,
} from "@prisma/client";

import Link from "next/link";

import {
  ArrowRight,
  Car,
  CircleCheck,
  FileText,
  Landmark,
  Package,
  Settings,
  Truck,
  UserRound,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";
import { obterPrivilegiosEmpresa } from "@/lib/empresa/obter-privilegios-empresa";

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

type EntradaModulo = {
  titulo: string;
  descricao: string;
  href: string;
  privilegios: PrivilegioEmpresa[];
  icone: typeof FileText;
};

function criarModulosEntrada(
  baseUrl: string
): EntradaModulo[] {
  return [
    {
      titulo: "Clientes",
      descricao:
        "Consulte e mantenha os cadastros comerciais.",
      href: `${baseUrl}/clientes`,
      privilegios: [
        PrivilegioEmpresa.CLIENTES_VISUALIZAR,
      ],
      icone: Users,
    },
    {
      titulo: "Produtos",
      descricao:
        "Acesse itens, servicos e dados fiscais.",
      href: `${baseUrl}/produtos`,
      privilegios: [
        PrivilegioEmpresa.PRODUTOS_VISUALIZAR,
      ],
      icone: Package,
    },
    {
      titulo: "Naturezas",
      descricao:
        "Gerencie operacoes fiscais da NF-e.",
      href: `${baseUrl}/naturezas-operacao`,
      privilegios: [
        PrivilegioEmpresa.NATUREZAS_VISUALIZAR,
      ],
      icone: Landmark,
    },
    {
      titulo: "NF-e",
      descricao:
        "Acompanhe e edite documentos fiscais.",
      href: `${baseUrl}/nfe`,
      privilegios: [
        PrivilegioEmpresa.NFE_VISUALIZAR,
      ],
      icone: FileText,
    },
    {
      titulo: "Transportadores",
      descricao:
        "Consulte transportadores vinculados.",
      href: `${baseUrl}/transportadores`,
      privilegios: [
        PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,
      ],
      icone: Truck,
    },
    {
      titulo: "Veiculos",
      descricao:
        "Acesse a frota usada no transporte.",
      href: `${baseUrl}/veiculos`,
      privilegios: [
        PrivilegioEmpresa.VEICULOS_VISUALIZAR,
      ],
      icone: Car,
    },
    {
      titulo: "Motoristas",
      descricao:
        "Consulte motoristas cadastrados.",
      href: `${baseUrl}/motoristas`,
      privilegios: [
        PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,
      ],
      icone: UserRound,
    },
    {
      titulo: "Configuracoes",
      descricao:
        "Acesse fiscal e certificado digital.",
      href: `${baseUrl}/configuracoes`,
      privilegios: [
        PrivilegioEmpresa.CONFIGURACOES_VISUALIZAR,
        PrivilegioEmpresa.CERTIFICADO_VISUALIZAR,
      ],
      icone: Settings,
    },
  ];
}

function TelaEntradaEmpresa({
  empresaNome,
  modulos,
}: {
  empresaNome: string;
  modulos: EntradaModulo[];
}) {
  return (
    <div className="w-full space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">
            Ambiente da empresa
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            {empresaNome}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            O dashboard nao esta liberado para
            visualizacao neste perfil. Escolha um
            modulo disponivel para continuar.
          </p>
        </div>
      </section>

      {modulos.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modulos.map((modulo) => {
            const Icone = modulo.icone;

            return (
              <Link
                key={modulo.href}
                href={modulo.href}
                className="group flex min-h-40 flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icone size={21} />
                  </div>

                  <h2 className="mt-4 text-base font-semibold tracking-tight">
                    {modulo.titulo}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {modulo.descricao}
                  </p>
                </div>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Abrir
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Settings size={20} />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight">
                Nenhum modulo disponivel
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Peca a um administrador para revisar as
                permissoes deste usuario.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
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

  const permissoes =
    await obterPrivilegiosEmpresa(
      empresaId
    );

  function podeVer(
    privilegio: PrivilegioEmpresa
  ) {
    return permissoes.privilegios.includes(
      privilegio
    );
  }

  const baseUrl =
    `/empresa/${empresaId}`;

  if (
    !podeVer(
      PrivilegioEmpresa.DASHBOARD_VISUALIZAR
    )
  ) {
    const modulos =
      criarModulosEntrada(
        baseUrl
      ).filter((modulo) =>
        modulo.privilegios.some(
          (privilegio) =>
            podeVer(privilegio)
        )
      );

    return (
      <TelaEntradaEmpresa
        empresaNome={
          empresa.nomeFantasia ??
          empresa.razaoSocial
        }
        modulos={modulos}
      />
    );
  }

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
        href: podeVer(
          PrivilegioEmpresa.NFE_VISUALIZAR
        )
          ? `${baseUrl}/nfe/${nota.id}`
          : undefined,
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
          href={
            podeVer(
              PrivilegioEmpresa.NFE_VISUALIZAR
            )
              ? `${baseUrl}/nfe`
              : undefined
          }
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
          href={
            podeVer(
              PrivilegioEmpresa.NFE_VISUALIZAR
            )
              ? `${baseUrl}/nfe`
              : undefined
          }
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
          href={
            podeVer(
              PrivilegioEmpresa.CLIENTES_VISUALIZAR
            )
              ? `${baseUrl}/clientes`
              : undefined
          }
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
          href={
            podeVer(
              PrivilegioEmpresa.PRODUTOS_VISUALIZAR
            )
              ? `${baseUrl}/produtos`
              : undefined
          }
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
          viewAllHref={
            podeVer(
              PrivilegioEmpresa.NFE_VISUALIZAR
            )
              ? `${baseUrl}/nfe`
              : undefined
          }
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

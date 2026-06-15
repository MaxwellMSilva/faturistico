import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CircleCheck,
  ClipboardList,
  FileText,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

const nomesPermissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  VISUALIZADOR: "Visualizador",
};

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

export default async function EmpresaDashboardPage({
  params,
}: Props) {
  const { empresaId } =
    await params;

  const {
    empresa,
    acesso,
  } = await getContextoEmpresa(
    empresaId
  );

  const [
    totalClientes,
    totalProdutos,
    totalNfe,
    totalNfeAutorizadas,
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
  ]);

  const empresaNome =
    empresa.nomeFantasia?.trim() ||
    empresa.razaoSocial;

  const permissao =
    nomesPermissoes[
      acesso.permissao
    ] ?? acesso.permissao;

  const municipio =
    empresa.municipio
      ? `${empresa.municipio}${
          empresa.uf
            ? ` - ${empresa.uf}`
            : ""
        }`
      : "Não informado";

  const baseUrl =
    `/empresa/${empresaId}`;

  const indicadores = [
    {
      titulo: "Clientes ativos",
      valor: totalClientes,
      descricao:
        "Clientes disponíveis para emissão",
      icon: Users,
      href: `${baseUrl}/clientes`,
    },
    {
      titulo: "Produtos ativos",
      valor: totalProdutos,
      descricao:
        "Produtos e serviços cadastrados",
      icon: Package,
      href: `${baseUrl}/produtos`,
    },
    {
      titulo: "NF-e cadastradas",
      valor: totalNfe,
      descricao:
        "Total de documentos no sistema",
      icon: FileText,
      href: `${baseUrl}/nfe`,
    },
    {
      titulo: "NF-e autorizadas",
      valor: totalNfeAutorizadas,
      descricao:
        "Documentos autorizados",
      icon: CircleCheck,
      href: `${baseUrl}/nfe`,
    },
  ];

  const atalhos = [
    {
      titulo: "Clientes",
      descricao:
        "Cadastre e gerencie destinatários.",
      href: `${baseUrl}/clientes`,
      icon: Users,
    },
    {
      titulo: "Produtos",
      descricao:
        "Gerencie produtos e dados tributários.",
      href: `${baseUrl}/produtos`,
      icon: Package,
    },
    {
      titulo: "Naturezas de operação",
      descricao:
        "Configure CFOP e finalidade das operações.",
      href: `${baseUrl}/naturezas-operacao`,
      icon: ClipboardList,
    },
    {
      titulo: "Configurações",
      descricao:
        "Ajuste os dados fiscais da empresa.",
      href: `${baseUrl}/configuracoes`,
      icon: Settings,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Apresentação */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Building2 size={27} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">
                  Ambiente selecionado
                </p>

                <h1
                  className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl"
                  title={empresaNome}
                >
                  {empresaNome}
                </h1>

                {empresa.nomeFantasia && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {empresa.razaoSocial}
                  </p>
                )}
              </div>
            </div>

            <div
              className={[
                "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
                empresa.ativo
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 text-destructive",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  empresa.ativo
                    ? "bg-emerald-500"
                    : "bg-destructive",
                ].join(" ")}
              />

              {empresa.ativo
                ? "Empresa ativa"
                : "Empresa inativa"}
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores */}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Visão geral
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Resumo dos principais dados desta empresa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {indicadores.map(
            (indicador) => {
              const Icone =
                indicador.icon;

              return (
                <Link
                  key={indicador.titulo}
                  href={indicador.href}
                  className="group rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {indicador.titulo}
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight">
                        {indicador.valor}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icone size={21} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                      {indicador.descricao}
                    </p>

                    <ArrowRight
                      size={16}
                      className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </div>
                </Link>
              );
            }
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Acesso rápido */}

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Acesso rápido
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Acesse os principais módulos da empresa.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {atalhos.map(
              (atalho) => {
                const Icone =
                  atalho.icon;

                return (
                  <Link
                    key={atalho.href}
                    href={atalho.href}
                    className="group flex items-start gap-3 rounded-xl border bg-muted/10 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icone size={19} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">
                          {atalho.titulo}
                        </p>

                        <ArrowRight
                          size={15}
                          className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                        />
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {atalho.descricao}
                      </p>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </section>

        {/* Dados do acesso */}

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Dados do acesso
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Identificação da empresa e sua permissão.
            </p>
          </div>

          <dl className="mt-5 divide-y rounded-xl border">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 size={17} />
              </div>

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  CNPJ
                </dt>

                <dd className="mt-1 text-sm font-medium">
                  {formatarCnpj(
                    empresa.cnpj
                  )}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin size={17} />
              </div>

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Município
                </dt>

                <dd className="mt-1 text-sm font-medium">
                  {municipio}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck size={17} />
              </div>

              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">
                  Sua permissão
                </dt>

                <dd className="mt-1 text-sm font-medium">
                  {permissao}
                </dd>
              </div>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
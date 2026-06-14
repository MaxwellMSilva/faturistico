import {
  Building2,
  FileText,
  Package,
  Users,
} from "lucide-react";

import { getContextoEmpresa } from "@/lib/empresa/get-contexto-empresa";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;
};

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

  const empresaNome =
    empresa.nomeFantasia ??
    empresa.razaoSocial;

  const cards = [
    {
      titulo: "Clientes",
      valor: "0",
      icon: Users,
    },
    {
      titulo: "Produtos",
      valor: "0",
      icon: Package,
    },
    {
      titulo: "NF-e emitidas",
      valor: "0",
      icon: FileText,
    },
    {
      titulo: "Empresa",
      valor:
        empresa.ativo
          ? "Ativa"
          : "Inativa",
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Ambiente selecionado
        </p>

        <h1 className="text-3xl font-bold">
          {empresaNome}
        </h1>

        <p className="mt-1 text-muted-foreground">
          {empresa.razaoSocial}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.titulo}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {card.titulo}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {card.valor}
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Dados do acesso
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">
              CNPJ
            </p>

            <p className="font-medium">
              {empresa.cnpj}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Município
            </p>

            <p className="font-medium">
              {empresa.municipio
                ? `${empresa.municipio}${
                    empresa.uf
                      ? ` - ${empresa.uf}`
                      : ""
                  }`
                : "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Permissão
            </p>

            <p className="font-medium">
              {acesso.permissao}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
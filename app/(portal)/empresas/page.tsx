import Link from "next/link";

import {
  Building2,
  LogIn,
  Plus,
  Search,
} from "lucide-react";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    busca?: string;
  }>;
};

const permissoes: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  FATURAMENTO: "Faturamento",
  OPERADOR: "Operador",
  VISUALIZADOR: "Visualizador",
};

function formatarCnpj(cnpj: string) {
  const numeros = cnpj.replace(/\D/g, "");

  if (numeros.length !== 14) {
    return cnpj;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

export default async function EmpresasPage({
  searchParams,
}: Props) {
  const { busca = "" } =
    await searchParams;

  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    redirect("/entrar");
  }

  const acessosRaw =
    await prisma.usuarioEmpresa.findMany({
      where: {
        usuarioId: session.user.id,
        ativo: true,
      },

      include: {
        empresa: true,
      },

      orderBy: {
        empresa: {
          razaoSocial: "asc",
        },
      },
    });

  const termo =
    busca.trim().toLowerCase();

  const acessos = termo
    ? acessosRaw.filter((acesso) => {
        const empresa = acesso.empresa;

        return [
          empresa.razaoSocial,
          empresa.nomeFantasia,
          empresa.cnpj,
        ].some((valor) =>
          valor
            ?.toLowerCase()
            .includes(termo)
        );
      })
    : acessosRaw;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Empresas
          </h1>

          <p className="text-muted-foreground">
            Escolha uma empresa para entrar
            no ambiente de trabalho.
          </p>
        </div>

        <Button asChild>
          <Link href="/empresas/nova">
            <Plus size={17} />
            Nova Empresa
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Empresas disponíveis
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {acessosRaw.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={22} />
            </div>
          </div>
        </div>
      </div>

      <form
        method="GET"
        className="flex max-w-xl gap-2"
      >
        <Input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
        />

        <Button
          type="submit"
          variant="outline"
        >
          <Search size={17} />
          Buscar
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Empresa
              </th>

              <th className="p-4 text-left">
                CNPJ
              </th>

              <th className="p-4 text-left">
                Município
              </th>

              <th className="p-4 text-left">
                Permissão
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {acessos.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {busca
                    ? "Nenhuma empresa encontrada para a busca informada."
                    : "Nenhuma empresa vinculada à sua conta."}
                </td>
              </tr>
            ) : (
              acessos.map((acesso) => {
                const empresa =
                  acesso.empresa;

                return (
                  <tr
                    key={acesso.id}
                    className="border-t transition-colors hover:bg-muted/20"
                  >
                    <td className="p-4">
                      <p className="font-medium">
                        {empresa.razaoSocial}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {empresa.nomeFantasia ??
                          "Sem nome fantasia"}
                      </p>
                    </td>

                    <td className="p-4">
                      {formatarCnpj(
                        empresa.cnpj
                      )}
                    </td>

                    <td className="p-4">
                      {empresa.municipio
                        ? `${empresa.municipio}${
                            empresa.uf
                              ? ` - ${empresa.uf}`
                              : ""
                          }`
                        : "-"}
                    </td>

                    <td className="p-4">
                      {permissoes[
                        acesso.permissao
                      ] ?? acesso.permissao}
                    </td>

                    <td className="p-4">
                      <span
                        className={
                          empresa.ativo
                            ? "inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "inline-flex rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700"
                        }
                      >
                        {empresa.ativo
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        asChild
                        disabled={
                          !empresa.ativo
                        }
                      >
                        <Link
                          href={`/empresa/${empresa.id}/dashboard`}
                        >
                          <LogIn size={17} />
                          Entrar
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
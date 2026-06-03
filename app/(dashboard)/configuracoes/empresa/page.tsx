import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { getEmpresas } from "@/actions/empresa/get-empresas";

import { Input } from "@/components/ui/input";

import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EmpresasPage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (!session?.user?.id) {
    return (
      <div>
        Usuário não autenticado.
      </div>
    );
  }

  const empresasRaw =
    await getEmpresas(
      session.user.id
    );

  const empresas = JSON.parse(
    JSON.stringify(empresasRaw)
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Empresas
        </h1>

        <p className="text-muted-foreground">
          Gerencie as empresas cadastradas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border bg-card p-4 shadow-sm">

          <p className="text-sm text-muted-foreground">
            Total de Empresas
          </p>

          <h2 className="text-3xl font-bold">
            {empresas.length}
          </h2>

        </div>

      </div>

      <div className="flex items-center justify-between gap-4">

        <Input
          placeholder="Buscar empresa..."
          className="max-w-sm"
        />

        <Link
          href="/configuracoes/empresa/nova"
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Nova Empresa
        </Link>

      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">

        <table className="w-full">

          <thead className="bg-muted/30">

            <tr>
              <th className="p-4 text-left">
                Razão Social
              </th>

              <th className="p-4 text-left">
                Nome Fantasia
              </th>

              <th className="p-4 text-left">
                CNPJ
              </th>

              <th className="p-4 text-left">
                Município
              </th>

              <th className="p-4 text-left">
                UF
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                Ações
              </th>
            </tr>

          </thead>

          <tbody>

            {empresas.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-4 text-center text-muted-foreground"
                >
                  Nenhuma empresa cadastrada
                </td>
              </tr>
            ) : (
              empresas.map(
                (empresa: any) => (
                  <tr
                    key={empresa.id}
                    className="border-t hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      {empresa.razaoSocial}
                    </td>

                    <td className="p-4">
                      {empresa.nomeFantasia ?? "-"}
                    </td>

                    <td className="p-4">
                      {empresa.cnpj}
                    </td>

                    <td className="p-4">
                      {empresa.municipio ?? "-"}
                    </td>

                    <td className="p-4">
                      {empresa.uf ?? "-"}
                    </td>

                    <td className="p-4">
                      {empresa.ativo
                        ? "Ativa"
                        : "Inativa"}
                    </td>

                    <td className="p-4">

                      <Link
                        href="/configuracoes/empresa"
                        className="rounded border px-3 py-1 text-sm hover:bg-muted"
                      >
                        Editar
                      </Link>

                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
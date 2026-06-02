import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog";

import { Input } from "@/components/ui/input";

import { ClienteDeleteButton } from "@/components/clientes/cliente-delete-button";
import { ClienteEditButton } from "@/components/clientes/cliente-edit-button";

export const dynamic = "force-dynamic";

import { getClientes } from "@/actions/clientes/get-clientes";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Clientes
        </h1>

        <p className="text-muted-foreground">
          Gerencie os clientes cadastrados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Total de Clientes
          </p>

          <div className="mt-2 flex items-center gap-2">
            <h2 className="text-4xl font-bold">
              {clientes.length}
            </h2>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar cliente..."
          className="max-w-sm"
        />

        <NovoClienteDialog />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">CPF/CNPJ</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Telefone</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-4 text-center text-muted-foreground"
                >
                  Nenhum cliente encontrado
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b hover:bg-muted/40 transition-colors"
                >
                  <td className="p-4">
                    {cliente.nome}
                  </td>

                  <td className="p-4">
                    {cliente.cpfCnpj}
                  </td>

                  <td className="p-4">
                    {cliente.email ?? "-"}
                  </td>

                  <td className="p-4">
                    {cliente.telefone ?? "-"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <ClienteEditButton
                        id={cliente.id}
                        nome={cliente.nome}
                        cpfCnpj={cliente.cpfCnpj}
                        email={cliente.email}
                        telefone={cliente.telefone}
                      />

                      <ClienteDeleteButton
                        id={cliente.id}
                        nome={cliente.nome}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
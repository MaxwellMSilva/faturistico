import {
  Search,
  Users,
} from "lucide-react";

import { getClientes } from "@/actions/clientes/get-clientes";

import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog";
import { ClienteEditButton } from "@/components/clientes/cliente-edit-button";
import { ClienteDeleteButton } from "@/components/clientes/cliente-delete-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
  }>;
};

function formatarDocumento(
  documento: string
) {
  const numeros =
    documento.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
  }

  if (numeros.length === 14) {
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  return documento;
}

function formatarTelefone(
  telefone: string | null
) {
  if (!telefone) {
    return "-";
  }

  const numeros =
    telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  return telefone;
}

export default async function ClientesPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const clientesRaw =
    await getClientes(
      empresaId
    );

  const termo =
    busca.trim().toLowerCase();

  const clientes = termo
    ? clientesRaw.filter(
        (cliente) =>
          [
            cliente.nome,
            cliente.cpfCnpj,
            cliente.email,
            cliente.telefone,
          ].some((valor) =>
            valor
              ?.toLowerCase()
              .includes(termo)
          )
      )
    : clientesRaw;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Clientes
          </h1>

          <p className="text-muted-foreground">
            Gerencie os clientes desta empresa.
          </p>
        </div>

        <NovoClienteDialog
          empresaId={empresaId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total de Clientes
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {clientesRaw.length}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={22} />
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
          placeholder="Buscar por nome, CPF, CNPJ, telefone ou e-mail..."
        />

        <Button
          type="submit"
          variant="outline"
        >
          <Search size={17} />
          Buscar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left">
                Nome
              </th>

              <th className="p-4 text-left">
                Tipo
              </th>

              <th className="p-4 text-left">
                CPF/CNPJ
              </th>

              <th className="p-4 text-left">
                Município
              </th>

              <th className="p-4 text-left">
                Contato
              </th>

              <th className="p-4 text-right">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  {busca
                    ? "Nenhum cliente encontrado."
                    : "Nenhum cliente cadastrado nesta empresa."}
                </td>
              </tr>
            ) : (
              clientes.map(
                (cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-t transition-colors hover:bg-muted/20"
                  >
                    <td className="p-4">
                      <p className="font-medium">
                        {cliente.nome}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {cliente.email ??
                          "Sem e-mail"}
                      </p>
                    </td>

                    <td className="p-4">
                      {cliente.tipoPessoa ===
                      "FISICA"
                        ? "Pessoa Física"
                        : "Pessoa Jurídica"}
                    </td>

                    <td className="p-4">
                      {formatarDocumento(
                        cliente.cpfCnpj
                      )}
                    </td>

                    <td className="p-4">
                      {cliente.municipio
                        ? `${cliente.municipio}${
                            cliente.uf
                              ? ` - ${cliente.uf}`
                              : ""
                          }`
                        : "-"}
                    </td>

                    <td className="p-4">
                      {formatarTelefone(
                        cliente.telefone
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <ClienteEditButton
                          empresaId={
                            empresaId
                          }
                          cliente={{
                            id: cliente.id,

                            tipoPessoa:
                              cliente.tipoPessoa,

                            nome:
                              cliente.nome,

                            cpfCnpj:
                              cliente.cpfCnpj,

                            inscricaoEstadual:
                              cliente.inscricaoEstadual,

                            inscricaoMunicipal:
                              cliente.inscricaoMunicipal,

                            suframa:
                              cliente.suframa,

                            email:
                              cliente.email,

                            telefone:
                              cliente.telefone,

                            cep:
                              cliente.cep,

                            logradouro:
                              cliente.logradouro,

                            numero:
                              cliente.numero,

                            complemento:
                              cliente.complemento,

                            bairro:
                              cliente.bairro,

                            municipio:
                              cliente.municipio,

                            codigoMunicipio:
                              cliente.codigoMunicipio,

                            uf:
                              cliente.uf,
                          }}
                        />

                        <ClienteDeleteButton
                          empresaId={
                            empresaId
                          }
                          clienteId={
                            cliente.id
                          }
                          clienteNome={
                            cliente.nome
                          }
                        />
                      </div>
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
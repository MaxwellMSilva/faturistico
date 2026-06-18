import Link from "next/link";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import {
  Building2,
  Power,
  PowerOff,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { getClientes } from "@/actions/clientes/get-clientes";

import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog";
import { ClienteEditButton } from "@/components/clientes/cliente-edit-button";
import { ClienteDeleteButton } from "@/components/clientes/cliente-delete-button";
import { ClienteStatusButton } from "@/components/clientes/cliente-status-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
    status?: string;
  }>;
};

type FiltroStatus =
  | "TODOS"
  | "ATIVOS"
  | "INATIVOS";

function somenteNumeros(
  valor?: string | null
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function normalizarStatus(
  valor?: string
): FiltroStatus {
  const status =
    valor?.toUpperCase();

  if (status === "ATIVOS") {
    return "ATIVOS";
  }

  if (status === "INATIVOS") {
    return "INATIVOS";
  }

  return "TODOS";
}

function formatarDocumento(
  documento: string
) {
  const numeros =
    somenteNumeros(documento);

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
  telefone?: string | null
) {
  if (!telefone) {
    return "Não informado";
  }

  const numeros =
    somenteNumeros(telefone);

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

function formatarMunicipio(
  municipio?: string | null,
  uf?: string | null
) {
  if (!municipio) {
    return "Não informado";
  }

  return uf
    ? `${municipio} - ${uf}`
    : municipio;
}

export default async function ClientesPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const {
    busca = "",
    status = "",
  } = await searchParams;

  const filtroStatus =
    normalizarStatus(status);

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.CLIENTES_VISUALIZAR,
      {
        exigirEmpresaAtiva: false,
      }
    );

  const clientesRaw =
    await getClientes(
      empresaId
    );

  function possuiPrivilegio(
    privilegio:
      PrivilegioEmpresa
  ) {
    if (
      contexto.somenteLeitura
    ) {
      return false;
    }

    if (
      contexto.usuario.role ===
      "OWNER"
    ) {
      return true;
    }

    const acesso =
      contexto.acesso;

    if (
      !acesso ||
      !acesso.ativo
    ) {
      return false;
    }

    if (
      contexto.usuario.role ===
      "ADMIN"
    ) {
      return (
        acesso.permissao ===
        "ADMIN"
      );
    }

    if (
      acesso.permissao ===
      "PERSONALIZADO"
    ) {
      return acesso.privilegios.some(
        (item) =>
          item.privilegio ===
          privilegio
      );
    }

    return false;
  }

  const podeCriar =
    possuiPrivilegio(
      PrivilegioEmpresa.CLIENTES_CRIAR
    );

  const podeEditar =
    possuiPrivilegio(
      PrivilegioEmpresa.CLIENTES_EDITAR
    );

  const podeAlterarStatus =
    possuiPrivilegio(
      PrivilegioEmpresa.CLIENTES_ALTERAR_STATUS
    );

  const podeExcluir =
    possuiPrivilegio(
      PrivilegioEmpresa.CLIENTES_EXCLUIR
    );

  const clientesPorStatus =
    clientesRaw.filter(
      (cliente) => {
        if (
          filtroStatus ===
          "ATIVOS"
        ) {
          return cliente.ativo;
        }

        if (
          filtroStatus ===
          "INATIVOS"
        ) {
          return !cliente.ativo;
        }

        return true;
      }
    );

  const termoTexto =
    busca
      .trim()
      .toLowerCase();

  const termoNumerico =
    somenteNumeros(busca);

  const clientes = termoTexto
    ? clientesPorStatus.filter(
        (cliente) => {
          const encontrouTexto = [
            cliente.nome,
            cliente.email,
            cliente.municipio,
            cliente.uf,
          ].some((valor) =>
            valor
              ?.toLowerCase()
              .includes(termoTexto)
          );

          const encontrouNumero =
            Boolean(
              termoNumerico
            ) &&
            [
              cliente.cpfCnpj,
              cliente.telefone,
            ].some((valor) =>
              somenteNumeros(
                valor
              ).includes(
                termoNumerico
              )
            );

          return (
            encontrouTexto ||
            encontrouNumero
          );
        }
      )
    : clientesPorStatus;

  const totalAtivos =
    clientesRaw.filter(
      (cliente) =>
        cliente.ativo
    ).length;

  const totalInativos =
    clientesRaw.length -
    totalAtivos;

  const totalPessoaFisica =
    clientesRaw.filter(
      (cliente) =>
        cliente.tipoPessoa ===
        "FISICA"
    ).length;

  const totalPessoaJuridica =
    clientesRaw.filter(
      (cliente) =>
        cliente.tipoPessoa ===
        "JURIDICA"
    ).length;

  const rotaBase =
    `/empresa/${empresaId}/clientes`;

  function criarHref({
    novoStatus =
      filtroStatus,
    incluirBusca = true,
  }: {
    novoStatus?: FiltroStatus;
    incluirBusca?: boolean;
  }) {
    const parametros =
      new URLSearchParams();

    if (
      incluirBusca &&
      busca.trim()
    ) {
      parametros.set(
        "busca",
        busca.trim()
      );
    }

    if (
      novoStatus !== "TODOS"
    ) {
      parametros.set(
        "status",
        novoStatus.toLowerCase()
      );
    }

    const query =
      parametros.toString();

    return query
      ? `${rotaBase}?${query}`
      : rotaBase;
  }

  function renderizarAcoes(
    cliente: (typeof clientesRaw)[number]
  ) {
    const possuiAlgumaAcao =
      podeEditar ||
      podeAlterarStatus ||
      podeExcluir;

    if (!possuiAlgumaAcao) {
      return (
        <span className="text-sm text-muted-foreground">
          Sem ações disponíveis
        </span>
      );
    }

    return (
      <div className="flex flex-wrap justify-end gap-2">
        {podeEditar && (
          <ClienteEditButton
            empresaId={empresaId}
            cliente={{
              id:
                cliente.id,

              tipoPessoa:
                cliente.tipoPessoa,

              nome:
                cliente.nome,

              cpfCnpj:
                cliente.cpfCnpj,

              inscricaoEstadual:
                cliente
                  .inscricaoEstadual,

              inscricaoMunicipal:
                cliente
                  .inscricaoMunicipal,

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
        )}

        {podeAlterarStatus && (
          <ClienteStatusButton
            empresaId={empresaId}
            clienteId={cliente.id}
            clienteNome={cliente.nome}
            ativo={cliente.ativo}
          />
        )}

        {podeExcluir && (
          <ClienteDeleteButton
            empresaId={empresaId}
            clienteId={cliente.id}
            clienteNome={cliente.nome}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Clientes
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie as pessoas físicas
              e jurídicas utilizadas nas
              operações desta empresa.
            </p>
          </div>
        </div>

        {podeCriar && (
          <NovoClienteDialog
            empresaId={empresaId}
          />
        )}
      </div>

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa. Os
          cadastros estão disponíveis
          somente para consulta.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {clientesRaw.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Ativos
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalAtivos}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Power size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Inativos
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalInativos}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <PowerOff size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Pessoas físicas
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalPessoaFisica}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserRound size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Pessoas jurídicas
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight">
                {totalPessoaJuridica}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={21} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "TODOS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "TODOS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            Todos
          </Button>

          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "ATIVOS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "ATIVOS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            <Power size={15} />

            Ativos
          </Button>

          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus:
                    "INATIVOS",
                })}
              />
            }
            variant={
              filtroStatus ===
              "INATIVOS"
                ? "default"
                : "outline"
            }
            size="sm"
          >
            <PowerOff size={15} />

            Inativos
          </Button>
        </div>

        <form
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          {filtroStatus !==
            "TODOS" && (
            <input
              type="hidden"
              name="status"
              value={filtroStatus.toLowerCase()}
            />
          )}

          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              name="busca"
              defaultValue={busca}
              className="h-11 pl-10"
              placeholder="Buscar por nome, CPF, CNPJ, telefone, e-mail ou município..."
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="h-11"
          >
            <Search size={17} />

            Buscar
          </Button>

          {busca && (
            <Button
              nativeButton={false}
              render={
                <Link
                  href={criarHref({
                    incluirBusca:
                      false,
                  })}
                />
              }
              variant="ghost"
              className="h-11"
            >
              Limpar
            </Button>
          )}
        </form>

        {(busca ||
          filtroStatus !==
            "TODOS") && (
          <p className="mt-3 text-xs text-muted-foreground">
            {clientes.length === 1
              ? "1 cliente encontrado."
              : `${clientes.length} clientes encontrados.`}
          </p>
        )}
      </section>

      {clientes.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              Nenhum cliente encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Não encontramos clientes
              correspondentes aos filtros
              informados.
            </p>

            <Button
              nativeButton={false}
              render={
                <Link
                  href={rotaBase}
                />
              }
              variant="outline"
              className="mt-6 h-11"
            >
              Limpar filtros
            </Button>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {clientes.map(
              (cliente) => (
                <article
                  key={cliente.id}
                  className={`rounded-2xl border bg-card p-5 shadow-sm ${
                    !cliente.ativo
                      ? "opacity-80"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {cliente.tipoPessoa ===
                      "FISICA" ? (
                        <UserRound
                          size={21}
                        />
                      ) : (
                        <Building2
                          size={21}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-semibold">
                          {cliente.nome}
                        </h2>

                        <span
                          className={
                            cliente.ativo
                              ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                              : "rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                          }
                        >
                          {cliente.ativo
                            ? "Ativo"
                            : "Inativo"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {cliente.tipoPessoa ===
                        "FISICA"
                          ? "Pessoa física"
                          : "Pessoa jurídica"}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        CPF/CNPJ
                      </dt>

                      <dd className="text-right font-medium">
                        {formatarDocumento(
                          cliente.cpfCnpj
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Município
                      </dt>

                      <dd className="text-right font-medium">
                        {formatarMunicipio(
                          cliente.municipio,
                          cliente.uf
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        Telefone
                      </dt>

                      <dd className="text-right font-medium">
                        {formatarTelefone(
                          cliente.telefone
                        )}
                      </dd>
                    </div>

                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">
                        E-mail
                      </dt>

                      <dd className="max-w-48 truncate text-right font-medium">
                        {cliente.email ||
                          "Não informado"}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-5 border-t pt-4">
                    {renderizarAcoes(
                      cliente
                    )}
                  </div>
                </article>
              )
            )}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Cliente
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Tipo
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CPF/CNPJ
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Município
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Telefone
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clientes.map(
                    (cliente) => (
                      <tr
                        key={cliente.id}
                        className={`border-t transition-colors hover:bg-muted/20 ${
                          !cliente.ativo
                            ? "bg-muted/10 opacity-80"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {cliente.tipoPessoa ===
                              "FISICA" ? (
                                <UserRound
                                  size={19}
                                />
                              ) : (
                                <Building2
                                  size={19}
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-72 truncate font-medium">
                                {cliente.nome}
                              </p>

                              <p className="max-w-72 truncate text-sm text-muted-foreground">
                                {cliente.email ||
                                  "Sem e-mail"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {cliente.tipoPessoa ===
                          "FISICA"
                            ? "Pessoa física"
                            : "Pessoa jurídica"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarDocumento(
                            cliente.cpfCnpj
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarMunicipio(
                            cliente.municipio,
                            cliente.uf
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarTelefone(
                            cliente.telefone
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={
                              cliente.ativo
                                ? "inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                                : "inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                            }
                          >
                            {cliente.ativo
                              ? "Ativo"
                              : "Inativo"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {renderizarAcoes(
                            cliente
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import Link from "next/link";

import { PrivilegioEmpresa } from "@prisma/client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { getClientes } from "@/actions/clientes/get-clientes";

import { ClienteDeleteButton } from "@/components/clientes/cliente-delete-button";
import { ClienteEditButton } from "@/components/clientes/cliente-edit-button";
import { ClienteStatusButton } from "@/components/clientes/cliente-status-button";
import { NovoClienteDialog } from "@/components/clientes/novo-cliente-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { validarPrivilegioEmpresa } from "@/lib/usuarios/validar-privilegio-empresa";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
    status?: string;
    pagina?: string;
  }>;
};

type FiltroStatus =
  | "TODOS"
  | "ATIVOS"
  | "INATIVOS";

const CLIENTES_POR_PAGINA = 10;

function normalizarPagina(
  valor?: string
) {
  const pagina = Number(valor);

  if (
    !Number.isInteger(pagina) ||
    pagina < 1
  ) {
    return 1;
  }

  return pagina;
}

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
    pagina = "1",
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

  /*
   * Filtro por status
   */

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

  /*
   * Busca
   */

  const termoTexto =
    busca
      .trim()
      .toLowerCase();

  const termoNumerico =
    somenteNumeros(busca);

  const clientesFiltrados =
    termoTexto
      ? clientesPorStatus.filter(
          (cliente) => {
            const encontrouTexto = [
              cliente.nome,
              cliente.email,
              cliente.municipio,
              cliente.uf,
              cliente.tipoPessoa,
              cliente.ativo
                ? "ativo"
                : "inativo",
            ].some((valor) =>
              String(valor ?? "")
                .toLowerCase()
                .includes(
                  termoTexto
                )
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

  /*
   * Paginação
   */

  const totalFiltrado =
    clientesFiltrados.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalFiltrado /
          CLIENTES_POR_PAGINA
      )
    );

  const paginaSolicitada =
    normalizarPagina(
      pagina
    );

  const paginaAtual =
    Math.min(
      paginaSolicitada,
      totalPaginas
    );

  const indiceInicial =
    (paginaAtual - 1) *
    CLIENTES_POR_PAGINA;

  const indiceFinal =
    Math.min(
      indiceInicial +
        CLIENTES_POR_PAGINA,
      totalFiltrado
    );

  const clientes =
    clientesFiltrados.slice(
      indiceInicial,
      indiceFinal
    );

  const primeiroRegistro =
    totalFiltrado === 0
      ? 0
      : indiceInicial + 1;

  const ultimoRegistro =
    indiceFinal;

  /*
   * Páginas numéricas
   *
   * Exibe no máximo cinco páginas.
   */

  const primeiraPaginaVisivel =
    Math.max(
      1,
      Math.min(
        paginaAtual - 2,
        totalPaginas - 4
      )
    );

  const ultimaPaginaVisivel =
    Math.min(
      totalPaginas,
      primeiraPaginaVisivel + 4
    );

  const paginasVisiveis =
    Array.from(
      {
        length:
          ultimaPaginaVisivel -
          primeiraPaginaVisivel +
          1,
      },
      (_, indice) =>
        primeiraPaginaVisivel +
        indice
    );

  /*
   * Indicadores
   */

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

    novaPagina = 1,
  }: {
    novoStatus?: FiltroStatus;
    incluirBusca?: boolean;
    novaPagina?: number;
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

    if (novaPagina > 1) {
      parametros.set(
        "pagina",
        String(novaPagina)
      );
    }

    const query =
      parametros.toString();

    return query
      ? `${rotaBase}?${query}`
      : rotaBase;
  }

  function renderizarAcoes(
    cliente:
      (typeof clientesRaw)[number]
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
      {/* Cabeçalho */}

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

      {/* Somente leitura */}

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa. Os
          cadastros estão disponíveis
          somente para consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Indicador
          titulo="Total"
          valor={clientesRaw.length}
          icone={Users}
        />

        <Indicador
          titulo="Ativos"
          valor={totalAtivos}
          icone={Power}
          variante="sucesso"
        />

        <Indicador
          titulo="Inativos"
          valor={totalInativos}
          icone={PowerOff}
          variante="aviso"
        />

        <Indicador
          titulo="Pessoas físicas"
          valor={totalPessoaFisica}
          icone={UserRound}
        />

        <Indicador
          titulo="Pessoas jurídicas"
          valor={totalPessoaJuridica}
          icone={Building2}
        />
      </section>

      {/* Filtros */}

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
            {totalFiltrado === 1
              ? "1 cliente encontrado."
              : `${totalFiltrado} clientes encontrados.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {totalFiltrado === 0 ? (
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
          {/* Cards no celular */}

          <div className="grid gap-4 md:hidden">
            {clientes.map(
              (cliente) => (
                <article
                  key={cliente.id}
                  className={[
                    "rounded-2xl border bg-card p-5 shadow-sm",

                    !cliente.ativo
                      ? "opacity-80"
                      : "",
                  ].join(" ")}
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

                        <StatusBadge
                          ativo={
                            cliente.ativo
                          }
                        />
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
                    <LinhaInformacao
                      titulo="CPF/CNPJ"
                      valor={formatarDocumento(
                        cliente.cpfCnpj
                      )}
                    />

                    <LinhaInformacao
                      titulo="Município"
                      valor={formatarMunicipio(
                        cliente.municipio,
                        cliente.uf
                      )}
                    />

                    <LinhaInformacao
                      titulo="Telefone"
                      valor={formatarTelefone(
                        cliente.telefone
                      )}
                    />

                    <LinhaInformacao
                      titulo="E-mail"
                      valor={
                        cliente.email ||
                        "Não informado"
                      }
                    />
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

          {/* Tabela no computador */}

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
                        className={[
                          "border-t transition-colors hover:bg-muted/20",

                          !cliente.ativo
                            ? "bg-muted/10 opacity-80"
                            : "",
                        ].join(" ")}
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
                          <StatusBadge
                            ativo={
                              cliente.ativo
                            }
                          />
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

          {/* Paginação */}

          {totalPaginas > 1 && (
            <nav
              aria-label="Paginação de clientes"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row"
            >
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                {primeiroRegistro} a{" "}
                {ultimoRegistro} de{" "}
                {totalFiltrado}{" "}
                {totalFiltrado === 1
                  ? "cliente"
                  : "clientes"}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {paginaAtual > 1 ? (
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={criarHref({
                          novaPagina:
                            paginaAtual - 1,
                        })}
                        aria-label="Página anterior"
                      />
                    }
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Anterior
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Anterior
                  </Button>
                )}

                {paginasVisiveis.map(
                  (numeroPagina) => (
                    <Button
                      key={
                        numeroPagina
                      }
                      nativeButton={false}
                      render={
                        <Link
                          href={criarHref({
                            novaPagina:
                              numeroPagina,
                          })}
                          aria-label={`Ir para a página ${numeroPagina}`}
                          aria-current={
                            numeroPagina ===
                            paginaAtual
                              ? "page"
                              : undefined
                          }
                        />
                      }
                      variant={
                        numeroPagina ===
                        paginaAtual
                          ? "default"
                          : "outline"
                      }
                      size="icon-sm"
                    >
                      {numeroPagina}
                    </Button>
                  )
                )}

                {paginaAtual <
                totalPaginas ? (
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={criarHref({
                          novaPagina:
                            paginaAtual + 1,
                        })}
                        aria-label="Próxima página"
                      />
                    }
                    variant="outline"
                    size="sm"
                  >
                    Próxima

                    <ChevronRight
                      size={16}
                    />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    Próxima

                    <ChevronRight
                      size={16}
                    />
                  </Button>
                )}
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

type IndicadorProps = {
  titulo: string;
  valor: number;

  icone:
    typeof Users;

  variante?:
    | "padrao"
    | "sucesso"
    | "aviso";
};

function Indicador({
  titulo,
  valor,
  icone: Icone,
  variante = "padrao",
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-600"
      : variante === "aviso"
        ? "bg-amber-500/10 text-amber-600"
        : "bg-primary/10 text-primary";

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {titulo}
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight">
            {valor}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",
            classeIcone,
          ].join(" ")}
        >
          <Icone size={21} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  ativo,
}: {
  ativo: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",

        ativo
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      ].join(" ")}
    >
      {ativo
        ? "Ativo"
        : "Inativo"}
    </span>
  );
}

function LinhaInformacao({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">
        {titulo}
      </dt>

      <dd
        className="max-w-52 truncate text-right font-medium"
        title={valor}
      >
        {valor}
      </dd>
    </div>
  );
}
import Link from "next/link";

import { PrivilegioEmpresa } from "@prisma/client";

import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Power,
  PowerOff,
  Search,
  Truck,
  UserRound,
} from "lucide-react";

import { getTransportadores } from "@/actions/transportadores/get-transportadores";

import { TransportadorDialog } from "@/components/transportadores/transportador-dialog";
import { TransportadorDeleteButton } from "@/components/transportadores/transportador-delete-button";
import { TransportadorStatusButton } from "@/components/transportadores/transportador-status-button";

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

type FiltroStatus = "TODOS" | "ATIVOS" | "INATIVOS";

const ITENS_POR_PAGINA = 10;

function somenteNumeros(valor?: string | null) {
  return valor?.replace(/\D/g, "") ?? "";
}

function formatarDocumento(documento: string) {
  const numeros = somenteNumeros(documento);

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

function formatarTelefone(telefone?: string | null) {
  if (!telefone) {
    return "Não informado";
  }

  const numeros = somenteNumeros(telefone);

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

function normalizarStatus(valor?: string): FiltroStatus {
  const status = valor?.toUpperCase();

  if (status === "ATIVOS") {
    return "ATIVOS";
  }

  if (status === "INATIVOS") {
    return "INATIVOS";
  }

  return "TODOS";
}

export default async function TransportadoresPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } = await params;

  const {
    busca = "",
    status = "",
    pagina = "1",
  } = await searchParams;

  const filtroStatus = normalizarStatus(status);

  const contexto = await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.TRANSPORTADORES_VISUALIZAR,
    {
      exigirEmpresaAtiva: false,
    }
  );

  const transportadoresRaw = await getTransportadores(
    empresaId
  );

  function possuiPrivilegio(
    privilegio: PrivilegioEmpresa
  ) {
    if (contexto.somenteLeitura) {
      return false;
    }

    if (contexto.usuario.role === "OWNER") {
      return true;
    }

    const acesso = contexto.acesso;

    if (!acesso || !acesso.ativo) {
      return false;
    }

    if (contexto.usuario.role === "ADMIN") {
      return acesso.permissao === "ADMIN";
    }

    if (acesso.permissao === "PERSONALIZADO") {
      return acesso.privilegios.some(
        (item) => item.privilegio === privilegio
      );
    }

    return false;
  }

  const podeCriar = possuiPrivilegio(
    PrivilegioEmpresa.TRANSPORTADORES_CRIAR
  );

  const podeEditar = possuiPrivilegio(
    PrivilegioEmpresa.TRANSPORTADORES_EDITAR
  );

  const podeAlterarStatus = possuiPrivilegio(
    PrivilegioEmpresa.TRANSPORTADORES_ALTERAR_STATUS
  );

  const podeExcluir = possuiPrivilegio(
    PrivilegioEmpresa.TRANSPORTADORES_EXCLUIR
  );

  const transportadoresPorStatus =
    transportadoresRaw.filter((transportador) => {
      if (filtroStatus === "ATIVOS") {
        return transportador.ativo;
      }

      if (filtroStatus === "INATIVOS") {
        return !transportador.ativo;
      }

      return true;
    });

  const termoTexto = busca.trim().toLowerCase();
  const termoNumerico = somenteNumeros(busca);

  const transportadoresFiltrados = termoTexto
    ? transportadoresPorStatus.filter(
        (transportador) => {
          const encontrouTexto = [
            transportador.nome,
            transportador.nomeFantasia,
            transportador.email,
            transportador.municipio,
            transportador.uf,
            transportador.rntrc,
            transportador.tipoPessoa,
            transportador.ativo
              ? "ativo"
              : "inativo",
          ].some((valor) =>
            String(valor ?? "")
              .toLowerCase()
              .includes(termoTexto)
          );

          const encontrouNumero =
            Boolean(termoNumerico) &&
            [
              transportador.cpfCnpj,
              transportador.telefone,
              transportador.rntrc,
            ].some((valor) =>
              somenteNumeros(valor).includes(
                termoNumerico
              )
            );

          return encontrouTexto || encontrouNumero;
        }
      )
    : transportadoresPorStatus;

  /*
   * Paginação
   */

  const paginaInformada = Number.parseInt(
    pagina,
    10
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      transportadoresFiltrados.length /
        ITENS_POR_PAGINA
    )
  );

  const paginaAtual =
    Number.isFinite(paginaInformada) &&
    paginaInformada > 0
      ? Math.min(paginaInformada, totalPaginas)
      : 1;

  const indiceInicial =
    (paginaAtual - 1) * ITENS_POR_PAGINA;

  const indiceFinal = Math.min(
    indiceInicial + ITENS_POR_PAGINA,
    transportadoresFiltrados.length
  );

  const transportadores =
    transportadoresFiltrados.slice(
      indiceInicial,
      indiceFinal
    );

  /*
   * Mostra no máximo 5 números de páginas.
   */

  const primeiraPaginaVisivel = Math.max(
    1,
    Math.min(
      paginaAtual - 2,
      totalPaginas - 4
    )
  );

  const ultimaPaginaVisivel = Math.min(
    totalPaginas,
    primeiraPaginaVisivel + 4
  );

  const paginasVisiveis = Array.from(
    {
      length:
        ultimaPaginaVisivel -
        primeiraPaginaVisivel +
        1,
    },
    (_, indice) =>
      primeiraPaginaVisivel + indice
  );

  const totalAtivos = transportadoresRaw.filter(
    (transportador) => transportador.ativo
  ).length;

  const totalInativos =
    transportadoresRaw.length - totalAtivos;

  const rotaBase =
    `/empresa/${empresaId}/transportadores`;

  function criarHref({
    novoStatus = filtroStatus,
    incluirBusca = true,
    novaPagina = 1,
  }: {
    novoStatus?: FiltroStatus;
    incluirBusca?: boolean;
    novaPagina?: number;
  }) {
    const parametros = new URLSearchParams();

    if (incluirBusca && busca.trim()) {
      parametros.set("busca", busca.trim());
    }

    if (novoStatus !== "TODOS") {
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

    const query = parametros.toString();

    return query
      ? `${rotaBase}?${query}`
      : rotaBase;
  }

  function renderizarAcoes(
    transportador: (typeof transportadoresRaw)[number]
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
          <TransportadorDialog
            empresaId={empresaId}
            transportador={{
              id: transportador.id,
              tipoPessoa:
                transportador.tipoPessoa,
              nome: transportador.nome,
              nomeFantasia:
                transportador.nomeFantasia,
              cpfCnpj:
                transportador.cpfCnpj,
              inscricaoEstadual:
                transportador.inscricaoEstadual,
              inscricaoMunicipal:
                transportador.inscricaoMunicipal,
              rntrc: transportador.rntrc,
              email: transportador.email,
              telefone:
                transportador.telefone,
              cep: transportador.cep,
              logradouro:
                transportador.logradouro,
              numero: transportador.numero,
              complemento:
                transportador.complemento,
              bairro: transportador.bairro,
              municipio:
                transportador.municipio,
              codigoMunicipio:
                transportador.codigoMunicipio,
              uf: transportador.uf,
              ativo: transportador.ativo,
            }}
          />
        )}

        {podeAlterarStatus && (
          <TransportadorStatusButton
            empresaId={empresaId}
            transportadorId={
              transportador.id
            }
            transportadorNome={
              transportador.nome
            }
            ativo={transportador.ativo}
          />
        )}

        {podeExcluir && (
          <TransportadorDeleteButton
            empresaId={empresaId}
            transportadorId={
              transportador.id
            }
            transportadorNome={
              transportador.nome
            }
            quantidadeVeiculos={
              transportador._count.veiculos
            }
            quantidadeMotoristas={
              transportador._count.motoristas
            }
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
            <Truck size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Transportadores
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie transportadoras,
              autônomos e seus vínculos com
              veículos e motoristas.
            </p>
          </div>
        </div>

        {podeCriar && (
          <TransportadorDialog
            empresaId={empresaId}
          />
        )}
      </div>

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está inativa. Os
          transportadores estão disponíveis
          somente para consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador
          titulo="Total de transportadores"
          valor={transportadoresRaw.length}
          icone={Truck}
        />

        <Indicador
          titulo="Transportadores ativos"
          valor={totalAtivos}
          icone={CircleCheck}
          variante="sucesso"
        />

        <Indicador
          titulo="Transportadores inativos"
          valor={totalInativos}
          icone={CircleX}
          variante="alerta"
          className="sm:col-span-2 xl:col-span-1"
        />
      </section>

      {/* Filtros e busca */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            nativeButton={false}
            render={
              <Link
                href={criarHref({
                  novoStatus: "TODOS",
                })}
              />
            }
            variant={
              filtroStatus === "TODOS"
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
                  novoStatus: "ATIVOS",
                })}
              />
            }
            variant={
              filtroStatus === "ATIVOS"
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
                  novoStatus: "INATIVOS",
                })}
              />
            }
            variant={
              filtroStatus === "INATIVOS"
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
          {filtroStatus !== "TODOS" && (
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
              placeholder="Buscar por nome, CPF, CNPJ, RNTRC, telefone ou município..."
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
                    incluirBusca: false,
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
          filtroStatus !== "TODOS") && (
          <p className="mt-3 text-xs text-muted-foreground">
            {transportadoresFiltrados.length ===
            1
              ? "1 transportador encontrado."
              : `${transportadoresFiltrados.length} transportadores encontrados.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {transportadores.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Truck size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Nenhum transportador
              encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Não encontramos
              transportadores
              correspondentes aos filtros
              informados.
            </p>

            <Button
              nativeButton={false}
              render={
                <Link href={rotaBase} />
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
          {/* Celular */}

          <div className="grid gap-4 md:hidden">
            {transportadores.map(
              (transportador) => (
                <article
                  key={transportador.id}
                  className={`rounded-2xl border bg-card p-5 shadow-sm ${
                    !transportador.ativo
                      ? "opacity-80"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {transportador.tipoPessoa ===
                        "FISICA" ? (
                          <UserRound
                            size={21}
                          />
                        ) : (
                          <Truck size={21} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {transportador.nome}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatarDocumento(
                            transportador.cpfCnpj
                          )}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      ativo={
                        transportador.ativo
                      }
                    />
                  </div>

                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                    <LinhaInformacao
                      titulo="Tipo"
                      valor={
                        transportador.tipoPessoa ===
                        "FISICA"
                          ? "Pessoa Física"
                          : "Pessoa Jurídica"
                      }
                    />

                    <LinhaInformacao
                      titulo="RNTRC"
                      valor={
                        transportador.rntrc ||
                        "Não informado"
                      }
                    />

                    <LinhaInformacao
                      titulo="Telefone"
                      valor={formatarTelefone(
                        transportador.telefone
                      )}
                    />

                    <LinhaInformacao
                      titulo="Município"
                      valor={
                        transportador.municipio
                          ? `${transportador.municipio}${
                              transportador.uf
                                ? ` - ${transportador.uf}`
                                : ""
                            }`
                          : "Não informado"
                      }
                    />

                    <LinhaInformacao
                      titulo="Veículos"
                      valor={String(
                        transportador._count
                          .veiculos
                      )}
                    />

                    <LinhaInformacao
                      titulo="Motoristas"
                      valor={String(
                        transportador._count
                          .motoristas
                      )}
                    />
                  </dl>

                  <div className="mt-5 border-t pt-4">
                    {renderizarAcoes(
                      transportador
                    )}
                  </div>
                </article>
              )
            )}
          </div>

          {/* Computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Transportador
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CPF/CNPJ
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      RNTRC
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Município
                    </th>

                    <th className="px-5 py-4 text-center text-sm font-medium">
                      Veículos
                    </th>

                    <th className="px-5 py-4 text-center text-sm font-medium">
                      Motoristas
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
                  {transportadores.map(
                    (transportador) => (
                      <tr
                        key={transportador.id}
                        className={`border-t transition-colors hover:bg-muted/20 ${
                          !transportador.ativo
                            ? "bg-muted/10 opacity-80"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              {transportador.tipoPessoa ===
                              "FISICA" ? (
                                <UserRound
                                  size={19}
                                />
                              ) : (
                                <Truck
                                  size={19}
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-72 truncate font-medium">
                                {
                                  transportador.nome
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {transportador.tipoPessoa ===
                                "FISICA"
                                  ? "Pessoa Física"
                                  : transportador.nomeFantasia ||
                                    "Pessoa Jurídica"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarDocumento(
                            transportador.cpfCnpj
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {transportador.rntrc ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {transportador.municipio
                            ? `${transportador.municipio}${
                                transportador.uf
                                  ? ` - ${transportador.uf}`
                                  : ""
                              }`
                            : "-"}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {
                              transportador._count
                                .veiculos
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex min-w-8 justify-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                            {
                              transportador._count
                                .motoristas
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            ativo={
                              transportador.ativo
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          {renderizarAcoes(
                            transportador
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
              aria-label="Paginação de transportadores"
              className="flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-4 shadow-sm sm:flex-row"
            >
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                {indiceInicial + 1} a{" "}
                {indiceFinal} de{" "}
                {
                  transportadoresFiltrados.length
                }{" "}
                transportadores
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
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                )}

                {paginasVisiveis.map(
                  (numeroPagina) => (
                    <Button
                      key={numeroPagina}
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
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    Próxima
                    <ChevronRight size={16} />
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
  icone: typeof Truck;
  variante?:
    | "padrao"
    | "sucesso"
    | "alerta";
  className?: string;
};

function Indicador({
  titulo,
  valor,
  icone: Icone,
  variante = "padrao",
  className,
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : variante === "alerta"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "bg-primary/10 text-primary";

  return (
    <div
      className={[
        "rounded-2xl border bg-card p-5 shadow-sm",
        className ?? "",
      ].join(" ")}
    >
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
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${classeIcone}`}
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
      {ativo ? "Ativo" : "Inativo"}
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

      <dd className="text-right font-medium">
        {valor}
      </dd>
    </div>
  );
}
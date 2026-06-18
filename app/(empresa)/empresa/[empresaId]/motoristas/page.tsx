import Link from "next/link";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import type {
  LucideIcon,
} from "lucide-react";

import {
  AlertTriangle,
  BadgeCheck,
  CircleCheck,
  CircleX,
  IdCard,
  Power,
  PowerOff,
  Search,
  UserRound,
} from "lucide-react";

import { getMotoristas } from "@/actions/motoristas/get-motoristas";
import { getDadosMotorista } from "@/actions/motoristas/get-dados-motorista";

import { MotoristaDialog } from "@/components/motoristas/motorista-dialog";
import { MotoristaDeleteButton } from "@/components/motoristas/motorista-delete-button";
import { MotoristaStatusButton } from "@/components/motoristas/motorista-status-button";

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

function formatarCpf(
  valor: string
) {
  const numeros =
    somenteNumeros(valor);

  if (numeros.length !== 11) {
    return valor;
  }

  return numeros.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    "$1.$2.$3-$4"
  );
}

function formatarTelefone(
  valor?: string | null
) {
  if (!valor) {
    return "Não informado";
  }

  const numeros =
    somenteNumeros(valor);

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

  return valor;
}

function formatarData(
  valor?: Date | null
) {
  if (!valor) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(valor);
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

function obterSituacaoCnh(
  validade?: Date | null
) {
  if (!validade) {
    return {
      status: "NAO_INFORMADA",
      texto: "Não informada",
      descricao:
        "Validade não cadastrada",
    };
  }

  const hoje =
    new Date();

  hoje.setHours(
    0,
    0,
    0,
    0
  );

  const dataValidade =
    new Date(validade);

  dataValidade.setHours(
    0,
    0,
    0,
    0
  );

  const diferenca =
    dataValidade.getTime() -
    hoje.getTime();

  const dias =
    Math.ceil(
      diferenca /
        (1000 * 60 * 60 * 24)
    );

  if (dias < 0) {
    return {
      status: "VENCIDA",
      texto: "Vencida",
      descricao:
        `Venceu há ${Math.abs(
          dias
        )} dia(s)`,
    };
  }

  if (dias <= 30) {
    return {
      status:
        "PROXIMA_VENCIMENTO",
      texto:
        "Próxima do vencimento",
      descricao:
        dias === 0
          ? "Vence hoje"
          : `Vence em ${dias} dia(s)`,
    };
  }

  return {
    status: "VALIDA",
    texto: "Válida",
    descricao:
      `${dias} dias restantes`,
  };
}

export default async function MotoristasPage({
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
    normalizarStatus(
      status
    );

  const contexto =
    await validarPrivilegioEmpresa(
      empresaId,
      PrivilegioEmpresa.MOTORISTAS_VISUALIZAR,
      {
        exigirEmpresaAtiva:
          false,
      }
    );

  const [
    motoristasRaw,
    dadosFormulario,
  ] = await Promise.all([
    getMotoristas(
      empresaId
    ),

    getDadosMotorista(
      empresaId
    ),
  ]);

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
      PrivilegioEmpresa.MOTORISTAS_CRIAR
    );

  const podeEditar =
    possuiPrivilegio(
      PrivilegioEmpresa.MOTORISTAS_EDITAR
    );

  const podeAlterarStatus =
    possuiPrivilegio(
      PrivilegioEmpresa.MOTORISTAS_ALTERAR_STATUS
    );

  const podeExcluir =
    possuiPrivilegio(
      PrivilegioEmpresa.MOTORISTAS_EXCLUIR
    );

  const motoristasPorStatus =
    motoristasRaw.filter(
      (motorista) => {
        if (
          filtroStatus ===
          "ATIVOS"
        ) {
          return motorista.ativo;
        }

        if (
          filtroStatus ===
          "INATIVOS"
        ) {
          return !motorista.ativo;
        }

        return true;
      }
    );

  const termo =
    busca
      .trim()
      .toLowerCase();

  const termoNumerico =
    somenteNumeros(
      busca
    );

  const motoristas = termo
    ? motoristasPorStatus.filter(
        (motorista) => {
          const situacao =
            obterSituacaoCnh(
              motorista.validadeCnh
            );

          const encontrouTexto = [
            motorista.nome,
            motorista.categoriaCnh,
            motorista.transportador
              ?.nome,
            motorista.ativo
              ? "ativo"
              : "inativo",
            situacao.texto,
            situacao.descricao,
          ].some((valor) =>
            String(valor ?? "")
              .toLowerCase()
              .includes(termo)
          );

          const encontrouNumero =
            Boolean(
              termoNumerico
            ) &&
            [
              motorista.cpf,
              motorista.numeroCnh,
              motorista.telefone,
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
    : motoristasPorStatus;

  const totalAtivos =
    motoristasRaw.filter(
      (motorista) =>
        motorista.ativo
    ).length;

  const totalInativos =
    motoristasRaw.length -
    totalAtivos;

  const totalVencidas =
    motoristasRaw.filter(
      (motorista) =>
        obterSituacaoCnh(
          motorista.validadeCnh
        ).status === "VENCIDA"
    ).length;

  const totalProximas =
    motoristasRaw.filter(
      (motorista) =>
        obterSituacaoCnh(
          motorista.validadeCnh
        ).status ===
        "PROXIMA_VENCIMENTO"
    ).length;

  const rotaBase =
    `/empresa/${empresaId}/motoristas`;

  function criarHref({
    novoStatus =
      filtroStatus,

    incluirBusca = true,
  }: {
    novoStatus?:
      FiltroStatus;

    incluirBusca?:
      boolean;
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
      novoStatus !==
      "TODOS"
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
    motorista:
      (typeof motoristasRaw)[number]
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
          <MotoristaDialog
            empresaId={
              empresaId
            }
            transportadores={
              dadosFormulario
                .transportadores
            }
            motorista={{
              id:
                motorista.id,

              transportadorId:
                motorista
                  .transportadorId,

              nome:
                motorista.nome,

              cpf:
                motorista.cpf,

              numeroCnh:
                motorista.numeroCnh,

              categoriaCnh:
                motorista
                  .categoriaCnh,

              validadeCnh:
                motorista
                  .validadeCnh
                  ?.toISOString() ??
                null,

              telefone:
                motorista.telefone,

              ativo:
                motorista.ativo,
            }}
          />
        )}

        {podeAlterarStatus && (
          <MotoristaStatusButton
            empresaId={
              empresaId
            }
            motoristaId={
              motorista.id
            }
            motoristaNome={
              motorista.nome
            }
            ativo={
              motorista.ativo
            }
          />
        )}

        {podeExcluir && (
          <MotoristaDeleteButton
            empresaId={
              empresaId
            }
            motoristaId={
              motorista.id
            }
            motoristaNome={
              motorista.nome
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
            <UserRound
              size={24}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Motoristas
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie motoristas,
              habilitações, vencimentos
              e vínculos com
              transportadores.
            </p>
          </div>
        </div>

        {podeCriar && (
          <MotoristaDialog
            empresaId={
              empresaId
            }
            transportadores={
              dadosFormulario
                .transportadores
            }
          />
        )}
      </div>

      {contexto.somenteLeitura && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400">
          Esta empresa está
          inativa. Os motoristas
          estão disponíveis somente
          para consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Indicador
          titulo="Total"
          valor={
            motoristasRaw.length
          }
          icone={
            UserRound
          }
        />

        <Indicador
          titulo="Ativos"
          valor={
            totalAtivos
          }
          icone={
            CircleCheck
          }
          variante="sucesso"
        />

        <Indicador
          titulo="Inativos"
          valor={
            totalInativos
          }
          icone={
            PowerOff
          }
          variante="aviso"
        />

        <Indicador
          titulo="CNHs próximas"
          valor={
            totalProximas
          }
          icone={
            AlertTriangle
          }
          variante="aviso"
        />

        <Indicador
          titulo="CNHs vencidas"
          valor={
            totalVencidas
          }
          icone={
            CircleX
          }
          variante="erro"
        />
      </section>

      {/* Filtros e busca */}

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            nativeButton={
              false
            }
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
            nativeButton={
              false
            }
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
            <Power
              size={15}
            />

            Ativos
          </Button>

          <Button
            nativeButton={
              false
            }
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
            <PowerOff
              size={15}
            />

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
              defaultValue={
                busca
              }
              className="h-11 pl-10"
              placeholder="Buscar por nome, CPF, CNH, categoria ou transportador..."
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="h-11"
          >
            <Search
              size={17}
            />

            Buscar
          </Button>

          {busca && (
            <Button
              nativeButton={
                false
              }
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
            {motoristas.length ===
            1
              ? "1 motorista encontrado."
              : `${motoristas.length} motoristas encontrados.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {motoristas.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserRound
                size={30}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Nenhum motorista
              encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Não encontramos
              motoristas correspondentes
              aos filtros informados.
            </p>

            <Button
              nativeButton={
                false
              }
              render={
                <Link
                  href={
                    rotaBase
                  }
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
          {/* Cards para celular */}

          <div className="grid gap-4 md:hidden">
            {motoristas.map(
              (motorista) => {
                const situacao =
                  obterSituacaoCnh(
                    motorista.validadeCnh
                  );

                return (
                  <article
                    key={
                      motorista.id
                    }
                    className={`rounded-2xl border bg-card p-5 shadow-sm ${
                      !motorista.ativo
                        ? "opacity-80"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <UserRound
                            size={21}
                          />
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">
                            {
                              motorista.nome
                            }
                          </h2>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatarCpf(
                              motorista.cpf
                            )}
                          </p>
                        </div>
                      </div>

                      <StatusAtivo
                        ativo={
                          motorista.ativo
                        }
                      />
                    </div>

                    <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                      <LinhaInformacao
                        titulo="CNH"
                        valor={
                          motorista.numeroCnh ||
                          "Não informada"
                        }
                      />

                      <LinhaInformacao
                        titulo="Categoria"
                        valor={
                          motorista.categoriaCnh ||
                          "Não informada"
                        }
                      />

                      <LinhaInformacao
                        titulo="Validade"
                        valor={formatarData(
                          motorista.validadeCnh
                        )}
                      />

                      <LinhaInformacao
                        titulo="Situação"
                        valor={
                          situacao.texto
                        }
                      />

                      <LinhaInformacao
                        titulo="Telefone"
                        valor={formatarTelefone(
                          motorista.telefone
                        )}
                      />

                      <LinhaInformacao
                        titulo="Transportador"
                        valor={
                          motorista.transportador
                            ?.nome ??
                          "Não vinculado"
                        }
                      />
                    </dl>

                    <div className="mt-5 border-t pt-4">
                      {renderizarAcoes(
                        motorista
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* Tabela para computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Motorista
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      CNH
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Categoria
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Validade
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Situação da CNH
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Transportador
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
                  {motoristas.map(
                    (motorista) => {
                      const situacao =
                        obterSituacaoCnh(
                          motorista.validadeCnh
                        );

                      return (
                        <tr
                          key={
                            motorista.id
                          }
                          className={`border-t transition-colors hover:bg-muted/20 ${
                            !motorista.ativo
                              ? "bg-muted/10 opacity-80"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UserRound
                                  size={19}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-64 truncate font-medium">
                                  {
                                    motorista.nome
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {formatarCpf(
                                    motorista.cpf
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {motorista.numeroCnh ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {motorista.categoriaCnh ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatarData(
                              motorista.validadeCnh
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <StatusCnh
                              status={
                                situacao.status
                              }
                              texto={
                                situacao.texto
                              }
                              descricao={
                                situacao.descricao
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {motorista.transportador
                              ?.nome ??
                              "Não vinculado"}
                          </td>

                          <td className="px-5 py-4">
                            <StatusAtivo
                              ativo={
                                motorista.ativo
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            {renderizarAcoes(
                              motorista
                            )}
                          </td>
                        </tr>
                      );
                    }
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

type IndicadorProps = {
  titulo: string;
  valor: number;
  icone: LucideIcon;

  variante?:
    | "padrao"
    | "sucesso"
    | "aviso"
    | "erro";
};

function Indicador({
  titulo,
  valor,
  icone: Icone,
  variante = "padrao",
}: IndicadorProps) {
  const classeIcone =
    variante === "sucesso"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : variante === "aviso"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : variante === "erro"
          ? "bg-destructive/10 text-destructive"
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
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${classeIcone}`}
        >
          <Icone
            size={21}
          />
        </div>
      </div>
    </div>
  );
}

function StatusAtivo({
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

function StatusCnh({
  status,
  texto,
  descricao,
}: {
  status: string;
  texto: string;
  descricao: string;
}) {
  const classe =
    status === "VALIDA"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status ===
          "PROXIMA_VENCIMENTO"
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : status === "VENCIDA"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";

  const Icone =
    status === "VALIDA"
      ? BadgeCheck
      : status ===
            "PROXIMA_VENCIMENTO" ||
          status === "VENCIDA"
        ? AlertTriangle
        : IdCard;

  return (
    <div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classe}`}
      >
        <Icone
          size={13}
        />

        {texto}
      </span>

      <p className="mt-1 text-xs text-muted-foreground">
        {descricao}
      </p>
    </div>
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

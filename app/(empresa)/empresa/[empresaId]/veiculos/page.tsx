import Link from "next/link";

import {
  PrivilegioEmpresa,
} from "@prisma/client";

import {
  CarFront,
  CircleCheck,
  CircleX,
  Power,
  PowerOff,
  Search,
  Truck,
} from "lucide-react";

import { getVeiculos } from "@/actions/veiculos/get-veiculos";
import { getDadosVeiculo } from "@/actions/veiculos/get-dados-veiculo";

import { VeiculoDialog } from "@/components/veiculos/veiculo-dialog";
import { VeiculoDeleteButton } from "@/components/veiculos/veiculo-delete-button";
import { VeiculoStatusButton } from "@/components/veiculos/veiculo-status-button";

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

const tiposVeiculo: Record<
  string,
  string
> = {
  CAVALO_MECANICO:
    "Cavalo mecânico",

  TOCO:
    "Caminhão toco",

  TRUCK:
    "Caminhão truck",

  CARRETA:
    "Carreta",

  REBOQUE:
    "Reboque",

  SEMIRREBOQUE:
    "Semirreboque",

  UTILITARIO:
    "Utilitário",

  OUTRO:
    "Outro",
};

function formatarPlaca(
  valor: string
) {
  const placa = valor
    .replace(
      /[^a-zA-Z0-9]/g,
      ""
    )
    .toUpperCase();

  if (placa.length <= 3) {
    return placa;
  }

  return `${placa.slice(
    0,
    3
  )}-${placa.slice(3)}`;
}

function formatarPeso(
  valor?: unknown
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "-";
  }

  const numero =
    Number(valor);

  if (
    !Number.isFinite(numero)
  ) {
    return "-";
  }

  return `${new Intl.NumberFormat(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    }
  ).format(numero)} kg`;
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

export default async function VeiculosPage({
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
      PrivilegioEmpresa.VEICULOS_VISUALIZAR,
      {
        exigirEmpresaAtiva:
          false,
      }
    );

  const [
    veiculosRaw,
    dadosFormulario,
  ] = await Promise.all([
    getVeiculos(
      empresaId
    ),

    getDadosVeiculo(
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
      PrivilegioEmpresa.VEICULOS_CRIAR
    );

  const podeEditar =
    possuiPrivilegio(
      PrivilegioEmpresa.VEICULOS_EDITAR
    );

  const podeAlterarStatus =
    possuiPrivilegio(
      PrivilegioEmpresa.VEICULOS_ALTERAR_STATUS
    );

  const podeExcluir =
    possuiPrivilegio(
      PrivilegioEmpresa.VEICULOS_EXCLUIR
    );

  const veiculosPorStatus =
    veiculosRaw.filter(
      (veiculo) => {
        if (
          filtroStatus ===
          "ATIVOS"
        ) {
          return veiculo.ativo;
        }

        if (
          filtroStatus ===
          "INATIVOS"
        ) {
          return !veiculo.ativo;
        }

        return true;
      }
    );

  const termo =
    busca
      .trim()
      .toLowerCase();

  const termoNormalizado =
    busca
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      )
      .toLowerCase();

  const veiculos = termo
    ? veiculosPorStatus.filter(
        (veiculo) => {
          const encontrouTexto = [
            veiculo.placa,
            veiculo.renavam,
            veiculo.ufLicenciamento,
            veiculo.marcaModelo,
            veiculo.tipo,

            tiposVeiculo[
              veiculo.tipo
            ],

            veiculo.transportador
              ?.nome,

            veiculo.ativo
              ? "ativo"
              : "inativo",
          ].some((valor) =>
            String(
              valor ?? ""
            )
              .toLowerCase()
              .includes(termo)
          );

          const encontrouNormalizado =
            [
              veiculo.placa,
              veiculo.renavam,
            ].some((valor) =>
              String(
                valor ?? ""
              )
                .replace(
                  /[^a-zA-Z0-9]/g,
                  ""
                )
                .toLowerCase()
                .includes(
                  termoNormalizado
                )
            );

          return (
            encontrouTexto ||
            encontrouNormalizado
          );
        }
      )
    : veiculosPorStatus;

  const totalAtivos =
    veiculosRaw.filter(
      (veiculo) =>
        veiculo.ativo
    ).length;

  const totalInativos =
    veiculosRaw.length -
    totalAtivos;

  const rotaBase =
    `/empresa/${empresaId}/veiculos`;

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
    veiculo:
      (typeof veiculosRaw)[number]
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
          <VeiculoDialog
            empresaId={
              empresaId
            }
            transportadores={
              dadosFormulario
                .transportadores
            }
            veiculo={{
              id:
                veiculo.id,

              transportadorId:
                veiculo
                  .transportadorId,

              placa:
                veiculo.placa,

              renavam:
                veiculo.renavam,

              ufLicenciamento:
                veiculo
                  .ufLicenciamento,

              tipo:
                veiculo.tipo,

              marcaModelo:
                veiculo
                  .marcaModelo,

              anoFabricacao:
                veiculo
                  .anoFabricacao,

              anoModelo:
                veiculo
                  .anoModelo,

              taraKg:
                veiculo.taraKg ===
                null
                  ? null
                  : Number(
                      veiculo
                        .taraKg
                    ),

              capacidadeKg:
                veiculo
                  .capacidadeKg ===
                null
                  ? null
                  : Number(
                      veiculo
                        .capacidadeKg
                    ),

              capacidadeM3:
                veiculo
                  .capacidadeM3 ===
                null
                  ? null
                  : Number(
                      veiculo
                        .capacidadeM3
                    ),

              ativo:
                veiculo.ativo,
            }}
          />
        )}

        {podeAlterarStatus && (
          <VeiculoStatusButton
            empresaId={
              empresaId
            }
            veiculoId={
              veiculo.id
            }
            placa={formatarPlaca(
              veiculo.placa
            )}
            ativo={
              veiculo.ativo
            }
          />
        )}

        {podeExcluir && (
          <VeiculoDeleteButton
            empresaId={
              empresaId
            }
            veiculoId={
              veiculo.id
            }
            placa={formatarPlaca(
              veiculo.placa
            )}
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
            <CarFront
              size={24}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Veículos
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie veículos de
              tração, carretas,
              reboques e utilitários
              utilizados nas operações
              de transporte.
            </p>
          </div>
        </div>

        {podeCriar && (
          <VeiculoDialog
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
          inativa. Os veículos
          estão disponíveis somente
          para consulta.
        </div>
      )}

      {/* Indicadores */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador
          titulo="Total de veículos"
          valor={
            veiculosRaw.length
          }
          icone={
            CarFront
          }
        />

        <Indicador
          titulo="Veículos ativos"
          valor={
            totalAtivos
          }
          icone={
            CircleCheck
          }
          variante="sucesso"
        />

        <Indicador
          titulo="Veículos inativos"
          valor={
            totalInativos
          }
          icone={
            CircleX
          }
          variante="alerta"
          className="sm:col-span-2 xl:col-span-1"
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
            <Power size={15} />

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
              placeholder="Buscar por placa, RENAVAM, tipo, modelo ou transportador..."
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
            {veiculos.length ===
            1
              ? "1 veículo encontrado."
              : `${veiculos.length} veículos encontrados.`}
          </p>
        )}
      </section>

      {/* Estado vazio */}

      {veiculos.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CarFront
                size={30}
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Nenhum veículo
              encontrado
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Não encontramos veículos
              correspondentes aos
              filtros informados.
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
            {veiculos.map(
              (veiculo) => (
                <article
                  key={
                    veiculo.id
                  }
                  className={`rounded-2xl border bg-card p-5 shadow-sm ${
                    !veiculo.ativo
                      ? "opacity-80"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <CarFront
                          size={21}
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="font-semibold">
                          {formatarPlaca(
                            veiculo.placa
                          )}
                        </h2>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {veiculo
                            .marcaModelo ||
                            tiposVeiculo[
                              veiculo
                                .tipo
                            ]}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      ativo={
                        veiculo.ativo
                      }
                    />
                  </div>

                  <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                    <LinhaInformacao
                      titulo="Tipo"
                      valor={
                        tiposVeiculo[
                          veiculo.tipo
                        ] ??
                        veiculo.tipo
                      }
                    />

                    <LinhaInformacao
                      titulo="RENAVAM"
                      valor={
                        veiculo.renavam ||
                        "Não informado"
                      }
                    />

                    <LinhaInformacao
                      titulo="Transportador"
                      valor={
                        veiculo
                          .transportador
                          ?.nome ??
                        "Não vinculado"
                      }
                    />

                    <LinhaInformacao
                      titulo="Tara"
                      valor={formatarPeso(
                        veiculo.taraKg
                      )}
                    />

                    <LinhaInformacao
                      titulo="Capacidade"
                      valor={formatarPeso(
                        veiculo
                          .capacidadeKg
                      )}
                    />
                  </dl>

                  <div className="mt-5 border-t pt-4">
                    {renderizarAcoes(
                      veiculo
                    )}
                  </div>
                </article>
              )
            )}
          </div>

          {/* Tabela para computador */}

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Veículo
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Tipo
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      RENAVAM
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Transportador
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Tara
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-medium">
                      Capacidade
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
                  {veiculos.map(
                    (veiculo) => (
                      <tr
                        key={
                          veiculo.id
                        }
                        className={`border-t transition-colors hover:bg-muted/20 ${
                          !veiculo.ativo
                            ? "bg-muted/10 opacity-80"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <CarFront
                                size={19}
                              />
                            </div>

                            <div>
                              <p className="font-semibold">
                                {formatarPlaca(
                                  veiculo
                                    .placa
                                )}
                              </p>

                              <p className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground">
                                {veiculo
                                  .marcaModelo ||
                                  "Sem marca/modelo"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {tiposVeiculo[
                            veiculo.tipo
                          ] ??
                            veiculo.tipo}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {veiculo.renavam ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          {veiculo.transportador ? (
                            <div className="flex items-center gap-2">
                              <Truck
                                size={16}
                                className="shrink-0 text-muted-foreground"
                              />

                              <span className="max-w-52 truncate text-sm">
                                {
                                  veiculo
                                    .transportador
                                    .nome
                                }
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Não vinculado
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarPeso(
                            veiculo.taraKg
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {formatarPeso(
                            veiculo
                              .capacidadeKg
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            ativo={
                              veiculo.ativo
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          {renderizarAcoes(
                            veiculo
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

type IndicadorProps = {
  titulo: string;
  valor: number;

  icone:
    typeof CarFront;

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

      <dd className="text-right font-medium">
        {valor}
      </dd>
    </div>
  );
}

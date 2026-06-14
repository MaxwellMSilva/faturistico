import Link from "next/link";

import {
  CarFront,
  CircleCheck,
  CircleX,
  Search,
  Truck,
} from "lucide-react";

import { getVeiculos } from "@/actions/veiculos/get-veiculos";
import { getDadosVeiculo } from "@/actions/veiculos/get-dados-veiculo";

import { VeiculoDialog } from "@/components/veiculos/veiculo-dialog";
import { VeiculoDeleteButton } from "@/components/veiculos/veiculo-delete-button";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const dynamic =
  "force-dynamic";

type Props = {
  params: Promise<{
    empresaId: string;
  }>;

  searchParams: Promise<{
    busca?: string;
  }>;
};

const tiposVeiculo: Record<
  string,
  string
> = {
  CAVALO_MECANICO:
    "Cavalo mecânico",
  TOCO: "Caminhão toco",
  TRUCK: "Caminhão truck",
  CARRETA: "Carreta",
  REBOQUE: "Reboque",
  SEMIRREBOQUE: "Semirreboque",
  UTILITARIO: "Utilitário",
  OUTRO: "Outro",
};

function formatarPlaca(
  valor: string
) {
  const placa = valor
    .replace(/[^a-zA-Z0-9]/g, "")
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

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "-";
  }

  return `${new Intl.NumberFormat(
    "pt-BR",
    {
      maximumFractionDigits: 2,
    }
  ).format(numero)} kg`;
}

export default async function VeiculosPage({
  params,
  searchParams,
}: Props) {
  const { empresaId } =
    await params;

  const { busca = "" } =
    await searchParams;

  const [
    veiculosRaw,
    dadosFormulario,
  ] = await Promise.all([
    getVeiculos(empresaId),
    getDadosVeiculo(empresaId),
  ]);

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
    ? veiculosRaw.filter(
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
            String(valor ?? "")
              .toLowerCase()
              .includes(termo)
          );

          const encontrouNormalizado =
            [
              veiculo.placa,
              veiculo.renavam,
            ].some((valor) =>
              String(valor ?? "")
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
    : veiculosRaw;

  const totalAtivos =
    veiculosRaw.filter(
      (veiculo) =>
        veiculo.ativo
    ).length;

  const totalInativos =
    veiculosRaw.length -
    totalAtivos;

  function renderizarAcoes(
    veiculo: (typeof veiculosRaw)[number]
  ) {
    return (
      <div className="flex justify-end gap-2">
        <VeiculoDialog
          empresaId={empresaId}
          transportadores={
            dadosFormulario.transportadores
          }
          veiculo={{
            id: veiculo.id,

            transportadorId:
              veiculo.transportadorId,

            placa: veiculo.placa,

            renavam:
              veiculo.renavam,

            ufLicenciamento:
              veiculo.ufLicenciamento,

            tipo: veiculo.tipo,

            marcaModelo:
              veiculo.marcaModelo,

            anoFabricacao:
              veiculo.anoFabricacao,

            anoModelo:
              veiculo.anoModelo,

            taraKg:
              veiculo.taraKg ===
              null
                ? null
                : Number(
                    veiculo.taraKg
                  ),

            capacidadeKg:
              veiculo.capacidadeKg ===
              null
                ? null
                : Number(
                    veiculo.capacidadeKg
                  ),

            capacidadeM3:
              veiculo.capacidadeM3 ===
              null
                ? null
                : Number(
                    veiculo.capacidadeM3
                  ),

            ativo: veiculo.ativo,
          }}
        />

        <VeiculoDeleteButton
          empresaId={empresaId}
          veiculoId={veiculo.id}
          placa={formatarPlaca(
            veiculo.placa
          )}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CarFront size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Veículos
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gerencie veículos de tração,
              carretas, reboques e
              utilitários utilizados nas
              operações de transporte.
            </p>
          </div>
        </div>

        <VeiculoDialog
          empresaId={empresaId}
          transportadores={
            dadosFormulario.transportadores
          }
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Indicador
          titulo="Total de veículos"
          valor={veiculosRaw.length}
          icone={CarFront}
        />

        <Indicador
          titulo="Veículos ativos"
          valor={totalAtivos}
          icone={CircleCheck}
          variante="sucesso"
        />

        <Indicador
          titulo="Veículos inativos"
          valor={totalInativos}
          icone={CircleX}
          variante="erro"
          className="sm:col-span-2 xl:col-span-1"
        />
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <form
          method="GET"
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              name="busca"
              defaultValue={busca}
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
              nativeButton={false}
              render={
                <Link
                  href={`/empresa/${empresaId}/veiculos`}
                />
              }
              variant="ghost"
              className="h-11"
            >
              Limpar
            </Button>
          )}
        </form>

        {busca && (
          <p className="mt-3 text-xs text-muted-foreground">
            {veiculos.length === 1
              ? "1 veículo encontrado."
              : `${veiculos.length} veículos encontrados.`}
          </p>
        )}
      </section>

      {veiculos.length === 0 ? (
        <section className="rounded-2xl border bg-card shadow-sm">
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CarFront size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              {busca
                ? "Nenhum veículo encontrado"
                : "Nenhum veículo cadastrado"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {busca
                ? "Não encontramos veículos correspondentes aos termos informados."
                : "Cadastre os veículos utilizados pela empresa e pelos transportadores."}
            </p>

            {busca && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/empresa/${empresaId}/veiculos`}
                  />
                }
                variant="outline"
                className="mt-6 h-11"
              >
                Limpar busca
              </Button>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {veiculos.map(
              (veiculo) => (
                <article
                  key={veiculo.id}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
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
                          {veiculo.marcaModelo ||
                            tiposVeiculo[
                              veiculo.tipo
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
                        ] ?? veiculo.tipo
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
                        veiculo.transportador
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
                        veiculo.capacidadeKg
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

          <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
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
                        key={veiculo.id}
                        className="border-t transition-colors hover:bg-muted/20"
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
                                  veiculo.placa
                                )}
                              </p>

                              <p className="mt-0.5 max-w-56 truncate text-xs text-muted-foreground">
                                {veiculo.marcaModelo ||
                                  "Sem marca/modelo"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {tiposVeiculo[
                            veiculo.tipo
                          ] ?? veiculo.tipo}
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
                            veiculo.capacidadeKg
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

  icone: typeof CarFront;

  variante?:
    | "padrao"
    | "sucesso"
    | "erro";

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
      : variante === "erro"
        ? "bg-destructive/10 text-destructive"
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
          : "bg-destructive/10 text-destructive",
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
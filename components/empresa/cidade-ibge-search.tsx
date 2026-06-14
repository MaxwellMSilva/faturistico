"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  LoaderCircle,
  MapPin,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";

type CidadeIbge = {
  municipio: string;
  uf: string;
  codigoMunicipio: string;
};

type Props = {
  municipio: string;
  uf: string;
  codigoMunicipio: string;

  onChange: (
    cidade: CidadeIbge
  ) => void;

  disabled?: boolean;
};

export function CidadeIbgeSearch({
  municipio,
  uf,
  codigoMunicipio,
  onChange,
  disabled = false,
}: Props) {
  const [busca, setBusca] =
    useState(
      municipio
        ? `${municipio}${
            uf
              ? ` - ${uf}`
              : ""
          }`
        : ""
    );

  const [
    resultados,
    setResultados,
  ] = useState<CidadeIbge[]>([]);

  const [carregando, setCarregando] =
    useState(false);

  const [aberto, setAberto] =
    useState(false);

  const [erro, setErro] =
    useState("");

  /*
   * Sincroniza quando os dados são
   * preenchidos pela consulta de CNPJ.
   */

  useEffect(() => {
    if (
      municipio &&
      codigoMunicipio
    ) {
      setBusca(
        `${municipio}${
          uf
            ? ` - ${uf}`
            : ""
        }`
      );

      setResultados([]);
      setAberto(false);

      return;
    }

    if (!municipio) {
      setBusca("");
    }
  }, [
    municipio,
    uf,
    codigoMunicipio,
  ]);

  /*
   * Pesquisa com atraso para evitar
   * uma requisição a cada tecla.
   */

  useEffect(() => {
    const termo =
      busca.trim();

    if (
      codigoMunicipio ||
      termo.length < 2
    ) {
      setResultados([]);
      setCarregando(false);

      return;
    }

    const controller =
      new AbortController();

    const temporizador =
      window.setTimeout(
        async () => {
          try {
            setCarregando(true);
            setErro("");

            const response =
              await fetch(
                `/api/ibge/municipios?q=${encodeURIComponent(
                  termo
                )}`,
                {
                  signal:
                    controller.signal,
                }
              );

            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data?.message ??
                  "Erro ao pesquisar cidades."
              );
            }

            const cidades =
              Array.isArray(data)
                ? data
                : [];

            setResultados(
              cidades
            );

            setAberto(true);
          } catch (error) {
            if (
              error instanceof
                DOMException &&
              error.name ===
                "AbortError"
            ) {
              return;
            }

            console.error(
              "Erro ao pesquisar cidade:",
              error
            );

            setResultados([]);

            setErro(
              error instanceof Error
                ? error.message
                : "Não foi possível pesquisar as cidades."
            );
          } finally {
            setCarregando(false);
          }
        },
        350
      );

    return () => {
      window.clearTimeout(
        temporizador
      );

      controller.abort();
    };
  }, [
    busca,
    codigoMunicipio,
  ]);

  function handleBusca(
    valor: string
  ) {
    setBusca(valor);
    setErro("");

    /*
     * Ao alterar o texto, a seleção
     * anterior é invalidada.
     */

    onChange({
      municipio: valor,
      uf: "",
      codigoMunicipio: "",
    });
  }

  function selecionarCidade(
    cidade: CidadeIbge
  ) {
    setBusca(
      `${cidade.municipio} - ${cidade.uf}`
    );

    setResultados([]);
    setAberto(false);
    setErro("");

    onChange(cidade);
  }

  return (
    <div className="space-y-4 md:col-span-6">
      <div className="space-y-2">
        <label
          htmlFor="pesquisaCidade"
          className="text-sm font-medium"
        >
          Município
        </label>

        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <Input
            id="pesquisaCidade"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={
              aberto
            }
            aria-controls="lista-cidades"
            className="h-11 pl-10 pr-10"
            placeholder="Digite o nome da cidade..."
            value={busca}
            onChange={(event) =>
              handleBusca(
                event.target.value
              )
            }
            onFocus={() => {
              if (
                resultados.length > 0
              ) {
                setAberto(true);
              }
            }}
            onBlur={() => {
              window.setTimeout(
                () =>
                  setAberto(false),
                150
              );
            }}
            autoComplete="off"
            disabled={disabled}
            required
          />

          {carregando && (
            <LoaderCircle
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
            />
          )}

          {aberto &&
            !carregando && (
              <div
                id="lista-cidades"
                role="listbox"
                className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
              >
                {resultados.length >
                0 ? (
                  resultados.map(
                    (cidade) => {
                      const selecionada =
                        cidade.codigoMunicipio ===
                        codigoMunicipio;

                      return (
                        <button
                          key={
                            cidade.codigoMunicipio
                          }
                          type="button"
                          role="option"
                          aria-selected={
                            selecionada
                          }
                          onMouseDown={(
                            event
                          ) =>
                            event.preventDefault()
                          }
                          onClick={() =>
                            selecionarCidade(
                              cidade
                            )
                          }
                          className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <MapPin
                              size={17}
                              className="shrink-0 text-primary"
                            />

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {
                                  cidade.municipio
                                }{" "}
                                -{" "}
                                {
                                  cidade.uf
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Código
                                IBGE:{" "}
                                {
                                  cidade.codigoMunicipio
                                }
                              </p>
                            </div>
                          </div>

                          {selecionada && (
                            <Check
                              size={17}
                              className="shrink-0 text-primary"
                            />
                          )}
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Nenhuma cidade
                    encontrada.
                  </div>
                )}
              </div>
            )}
        </div>

        <p className="text-xs text-muted-foreground">
          Digite pelo menos duas letras
          e selecione uma cidade da lista.
        </p>

        {erro && (
          <p className="text-sm text-destructive">
            {erro}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="ufCidade"
            className="text-sm font-medium"
          >
            UF
          </label>

          <Input
            id="ufCidade"
            className="h-11 bg-muted/30"
            value={uf}
            placeholder="UF"
            readOnly
            tabIndex={-1}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="codigoIbgeCidade"
            className="text-sm font-medium"
          >
            Código IBGE
          </label>

          <Input
            id="codigoIbgeCidade"
            className="h-11 bg-muted/30"
            value={
              codigoMunicipio
            }
            placeholder="0000000"
            readOnly
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}
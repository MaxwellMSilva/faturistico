"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  LoaderCircle,
  Mail,
  MapPin,
  Save,
  Search,
} from "lucide-react";

import { createEmpresa } from "@/actions/empresa/create-empresa";

import { CidadeIbgeSearch } from "@/components/empresa/cidade-ibge-search";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const estadoInicial = {
  razaoSocial: "",
  nomeFantasia: "",

  cnpj: "",

  inscricaoEstadual: "",
  inscricaoMunicipal: "",

  email: "",
  telefone: "",

  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",

  bairro: "",

  municipio: "",
  codigoMunicipio: "",
  uf: "",
};

type FormEmpresa =
  typeof estadoInicial;

type CidadeSelecionada = {
  municipio: string;
  uf: string;
  codigoMunicipio: string;
};

function somenteNumeros(
  valor: string
) {
  return valor.replace(
    /\D/g,
    ""
  );
}

function formatarCnpj(
  valor: string
) {
  const numeros =
    somenteNumeros(valor).slice(
      0,
      14
    );

  return numeros
    .replace(
      /^(\d{2})(\d)/,
      "$1.$2"
    )
    .replace(
      /^(\d{2})\.(\d{3})(\d)/,
      "$1.$2.$3"
    )
    .replace(
      /\.(\d{3})(\d)/,
      ".$1/$2"
    )
    .replace(
      /(\d{4})(\d)/,
      "$1-$2"
    );
}

function formatarCep(
  valor: string
) {
  const numeros =
    somenteNumeros(valor).slice(
      0,
      8
    );

  return numeros.replace(
    /^(\d{5})(\d)/,
    "$1-$2"
  );
}

function formatarTelefone(
  valor: string
) {
  const numeros =
    somenteNumeros(valor).slice(
      0,
      11
    );

  if (
    numeros.length <= 10
  ) {
    return numeros
      .replace(
        /^(\d{2})(\d)/,
        "($1) $2"
      )
      .replace(
        /(\d{4})(\d)/,
        "$1-$2"
      );
  }

  return numeros
    .replace(
      /^(\d{2})(\d)/,
      "($1) $2"
    )
    .replace(
      /(\d{5})(\d)/,
      "$1-$2"
    );
}

export function NovaEmpresaForm() {
  const router = useRouter();

  const [form, setForm] =
    useState<FormEmpresa>({
      ...estadoInicial,
    });

  const [
    buscandoCnpj,
    setBuscandoCnpj,
  ] = useState(false);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  function limparMensagens() {
    if (erro) {
      setErro("");
    }

    if (mensagem) {
      setMensagem("");
    }
  }

  function atualizarCampo(
    campo: keyof FormEmpresa,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    limparMensagens();
  }

  function atualizarCidade({
    municipio,
    uf,
    codigoMunicipio,
  }: CidadeSelecionada) {
    setForm((anterior) => ({
      ...anterior,

      municipio,
      uf,
      codigoMunicipio,
    }));

    limparMensagens();
  }

  async function buscarCnpj() {
    setErro("");
    setMensagem("");

    const cnpjLimpo =
      somenteNumeros(
        form.cnpj
      );

    if (
      cnpjLimpo.length !== 14
    ) {
      setErro(
        "Informe um CNPJ válido com 14 números."
      );

      return;
    }

    try {
      setBuscandoCnpj(true);

      const response =
        await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ??
            "CNPJ não encontrado."
        );
      }

      setForm(
        (anterior) => ({
          ...anterior,

          cnpj:
            formatarCnpj(
              data.cnpj ??
                cnpjLimpo
            ),

          razaoSocial:
            data.razao_social ??
            "",

          nomeFantasia:
            data.nome_fantasia ??
            "",

          email:
            data.email ?? "",

          telefone:
            formatarTelefone(
              data.ddd_telefone_1 ??
                ""
            ),

          cep:
            formatarCep(
              data.cep ?? ""
            ),

          logradouro:
            data.logradouro ??
            "",

          numero:
            data.numero ?? "",

          complemento:
            data.complemento ??
            "",

          bairro:
            data.bairro ?? "",

          municipio:
            data.municipio ??
            "",

          codigoMunicipio:
            String(
              data
                .codigo_municipio_ibge ??
                ""
            ),

          uf:
            String(
              data.uf ?? ""
            ).toUpperCase(),
        })
      );

      setMensagem(
        "Dados da empresa encontrados e preenchidos."
      );
    } catch (error) {
      console.error(
        "Erro ao consultar CNPJ:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar o CNPJ."
      );
    } finally {
      setBuscandoCnpj(
        false
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const cnpjLimpo =
      somenteNumeros(
        form.cnpj
      );

    const cepLimpo =
      somenteNumeros(
        form.cep
      );

    const codigoMunicipioLimpo =
      somenteNumeros(
        form.codigoMunicipio
      );

    if (
      !form.razaoSocial.trim()
    ) {
      setErro(
        "Informe a razão social da empresa."
      );

      return;
    }

    if (
      cnpjLimpo.length !== 14
    ) {
      setErro(
        "Informe um CNPJ válido com 14 números."
      );

      return;
    }

    if (
      cepLimpo &&
      cepLimpo.length !== 8
    ) {
      setErro(
        "Informe um CEP válido com 8 números."
      );

      return;
    }

    if (
      !form.municipio.trim() ||
      !form.uf.trim() ||
      codigoMunicipioLimpo
        .length !== 7
    ) {
      setErro(
        "Pesquise e selecione uma cidade válida na lista do IBGE."
      );

      return;
    }

    try {
      setSalvando(true);

      const resultado =
        await createEmpresa({
          razaoSocial:
            form.razaoSocial
              .trim(),

          nomeFantasia:
            form.nomeFantasia
              .trim(),

          cnpj:
            cnpjLimpo,

          inscricaoEstadual:
            form
              .inscricaoEstadual
              .trim(),

          inscricaoMunicipal:
            form
              .inscricaoMunicipal
              .trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          telefone:
            somenteNumeros(
              form.telefone
            ),

          cep:
            cepLimpo,

          logradouro:
            form.logradouro
              .trim(),

          numero:
            form.numero.trim(),

          complemento:
            form.complemento
              .trim(),

          bairro:
            form.bairro.trim(),

          municipio:
            form.municipio
              .trim(),

          codigoMunicipio:
            codigoMunicipioLimpo,

          uf:
            form.uf
              .trim()
              .toUpperCase(),
        });

      if (
        !resultado.success
      ) {
        setErro(
          resultado.message
        );

        return;
      }

      router.replace(
        "/empresas"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao cadastrar empresa:",
        error
      );

      setErro(
        "Não foi possível cadastrar a empresa. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  }

  const bloqueado =
    salvando ||
    buscandoCnpj;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Cabeçalho */}

      <div>
        <Link
          href="/empresas"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            size={16}
          />

          Voltar para empresas
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2
              size={24}
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Nova empresa
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Cadastre os dados da
              empresa que utilizará o
              sistema para emissão e
              gestão fiscal.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        {/* Identificação */}

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Identificação da
                empresa
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Dados cadastrais e
                registros fiscais da
                empresa.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="cnpj"
                className="text-sm font-medium"
              >
                CNPJ
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="cnpj"
                  name="cnpj"
                  className="h-11 flex-1"
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  value={
                    form.cnpj
                  }
                  onChange={(
                    event
                  ) =>
                    atualizarCampo(
                      "cnpj",
                      formatarCnpj(
                        event.target
                          .value
                      )
                    )
                  }
                  disabled={
                    bloqueado
                  }
                  required
                />

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:min-w-36"
                  onClick={
                    buscarCnpj
                  }
                  disabled={
                    bloqueado
                  }
                >
                  {buscandoCnpj ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />

                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search
                        size={17}
                      />

                      Buscar CNPJ
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                A consulta preencherá
                automaticamente os dados
                disponíveis.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="razaoSocial"
                className="text-sm font-medium"
              >
                Razão social
              </label>

              <Input
                id="razaoSocial"
                className="h-11"
                placeholder="Razão social da empresa"
                value={
                  form.razaoSocial
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "razaoSocial",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="nomeFantasia"
                className="text-sm font-medium"
              >
                Nome fantasia
              </label>

              <Input
                id="nomeFantasia"
                className="h-11"
                placeholder="Nome fantasia"
                value={
                  form.nomeFantasia
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "nomeFantasia",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="inscricaoEstadual"
                className="text-sm font-medium"
              >
                Inscrição estadual
              </label>

              <Input
                id="inscricaoEstadual"
                className="h-11"
                placeholder="Inscrição estadual"
                value={
                  form
                    .inscricaoEstadual
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "inscricaoEstadual",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="inscricaoMunicipal"
                className="text-sm font-medium"
              >
                Inscrição municipal
              </label>

              <Input
                id="inscricaoMunicipal"
                className="h-11"
                placeholder="Inscrição municipal"
                value={
                  form
                    .inscricaoMunicipal
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "inscricaoMunicipal",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>
          </div>
        </section>

        {/* Contato */}

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Contato
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Informações utilizadas
                para contato com a
                empresa.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                E-mail
              </label>

              <Input
                id="email"
                type="email"
                className="h-11"
                placeholder="empresa@exemplo.com"
                value={
                  form.email
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "email",
                    event.target
                      .value
                  )
                }
                autoComplete="email"
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="telefone"
                className="text-sm font-medium"
              >
                Telefone
              </label>

              <Input
                id="telefone"
                className="h-11"
                placeholder="(00) 00000-0000"
                inputMode="tel"
                value={
                  form.telefone
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "telefone",
                    formatarTelefone(
                      event.target
                        .value
                    )
                  )
                }
                autoComplete="tel"
                disabled={
                  bloqueado
                }
              />
            </div>
          </div>
        </section>

        {/* Endereço */}

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin
                size={20}
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Endereço
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Endereço fiscal do
                estabelecimento emissor.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-6">
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="cep"
                className="text-sm font-medium"
              >
                CEP
              </label>

              <Input
                id="cep"
                className="h-11"
                placeholder="00000-000"
                inputMode="numeric"
                value={
                  form.cep
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "cep",
                    formatarCep(
                      event.target
                        .value
                    )
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2 md:col-span-4">
              <label
                htmlFor="logradouro"
                className="text-sm font-medium"
              >
                Logradouro
              </label>

              <Input
                id="logradouro"
                className="h-11"
                placeholder="Rua, avenida, rodovia..."
                value={
                  form.logradouro
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "logradouro",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="numero"
                className="text-sm font-medium"
              >
                Número
              </label>

              <Input
                id="numero"
                className="h-11"
                placeholder="Número ou S/N"
                value={
                  form.numero
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "numero",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2 md:col-span-4">
              <label
                htmlFor="complemento"
                className="text-sm font-medium"
              >
                Complemento
              </label>

              <Input
                id="complemento"
                className="h-11"
                placeholder="Sala, bloco, km..."
                value={
                  form.complemento
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "complemento",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <div className="space-y-2 md:col-span-6">
              <label
                htmlFor="bairro"
                className="text-sm font-medium"
              >
                Bairro
              </label>

              <Input
                id="bairro"
                className="h-11"
                placeholder="Bairro"
                value={
                  form.bairro
                }
                onChange={(
                  event
                ) =>
                  atualizarCampo(
                    "bairro",
                    event.target
                      .value
                  )
                }
                disabled={
                  bloqueado
                }
              />
            </div>

            <CidadeIbgeSearch
              municipio={
                form.municipio
              }
              uf={
                form.uf
              }
              codigoMunicipio={
                form
                  .codigoMunicipio
              }
              onChange={
                atualizarCidade
              }
              disabled={
                bloqueado
              }
            />
          </div>
        </section>

        {/* Mensagens */}

        <div
          aria-live="polite"
          className="space-y-3"
        >
          {mensagem && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              <BadgeCheck
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>
                {mensagem}
              </p>
            </div>
          )}

          {erro && (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {erro}
            </div>
          )}
        </div>

        {/* Ações */}

        <div className="flex flex-col-reverse gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:justify-end">
          <Button
            nativeButton={false}
            render={
              <Link href="/empresas" />
            }
            variant="outline"
            className="h-11 sm:min-w-28"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="h-11 sm:min-w-44"
            disabled={
              bloqueado
            }
          >
            {salvando ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />

                Salvando...
              </>
            ) : (
              <>
                <Save
                  size={17}
                />

                Salvar empresa
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
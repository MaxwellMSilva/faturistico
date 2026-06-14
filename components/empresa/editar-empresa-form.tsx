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

import { updateEmpresa } from "@/actions/empresa/update-empresa";

import { CidadeIbgeSearch } from "@/components/empresa/cidade-ibge-search";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Empresa = {
  id: string;

  razaoSocial: string;
  nomeFantasia: string;

  cnpj: string;

  inscricaoEstadual: string;
  inscricaoMunicipal: string;

  email: string;
  telefone: string;

  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;

  bairro: string;

  municipio: string;
  codigoMunicipio: string;

  uf: string;
};

type Props = {
  empresa: Empresa;
};

type FormEmpresa =
  Omit<Empresa, "id">;

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

  if (numeros.length <= 10) {
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

export function EditarEmpresaForm({
  empresa,
}: Props) {
  const router = useRouter();

  const [form, setForm] =
    useState<FormEmpresa>({
      razaoSocial:
        empresa.razaoSocial,

      nomeFantasia:
        empresa.nomeFantasia,

      cnpj:
        formatarCnpj(
          empresa.cnpj
        ),

      inscricaoEstadual:
        empresa.inscricaoEstadual,

      inscricaoMunicipal:
        empresa.inscricaoMunicipal,

      email:
        empresa.email,

      telefone:
        formatarTelefone(
          empresa.telefone
        ),

      cep:
        formatarCep(
          empresa.cep
        ),

      logradouro:
        empresa.logradouro,

      numero:
        empresa.numero,

      complemento:
        empresa.complemento,

      bairro:
        empresa.bairro,

      municipio:
        empresa.municipio,

      codigoMunicipio:
        empresa.codigoMunicipio,

      uf:
        empresa.uf,
    });

  const [
    buscandoCnpj,
    setBuscandoCnpj,
  ] = useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  function limparMensagens() {
    setErro("");
    setMensagem("");
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
    limparMensagens();

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

      setForm((anterior) => ({
        ...anterior,

        cnpj:
          formatarCnpj(
            data.cnpj ??
              cnpjLimpo
          ),

        razaoSocial:
          data.razao_social ??
          anterior.razaoSocial,

        nomeFantasia:
          data.nome_fantasia ??
          anterior.nomeFantasia,

        email:
          data.email ??
          anterior.email,

        telefone:
          formatarTelefone(
            data.ddd_telefone_1 ??
              anterior.telefone
          ),

        cep:
          formatarCep(
            data.cep ??
              anterior.cep
          ),

        logradouro:
          data.logradouro ??
          anterior.logradouro,

        numero:
          data.numero ??
          anterior.numero,

        complemento:
          data.complemento ??
          anterior.complemento,

        bairro:
          data.bairro ??
          anterior.bairro,

        municipio:
          data.municipio ??
          anterior.municipio,

        codigoMunicipio:
          String(
            data
              .codigo_municipio_ibge ??
              anterior
                .codigoMunicipio
          ),

        uf:
          String(
            data.uf ??
              anterior.uf
          ).toUpperCase(),
      }));

      setMensagem(
        "Dados cadastrais atualizados pela consulta do CNPJ. Revise antes de salvar."
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
      setBuscandoCnpj(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

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
        "Informe a razão social."
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
      codigoMunicipioLimpo.length !==
        7
    ) {
      setErro(
        "Pesquise e selecione uma cidade válida na lista do IBGE."
      );

      return;
    }

    try {
      setSalvando(true);

      const resultado =
        await updateEmpresa({
          id:
            empresa.id,

          razaoSocial:
            form.razaoSocial.trim(),

          nomeFantasia:
            form.nomeFantasia.trim(),

          cnpj:
            cnpjLimpo,

          inscricaoEstadual:
            form.inscricaoEstadual.trim(),

          inscricaoMunicipal:
            form.inscricaoMunicipal.trim(),

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
            form.logradouro.trim(),

          numero:
            form.numero.trim(),

          complemento:
            form.complemento.trim(),

          bairro:
            form.bairro.trim(),

          municipio:
            form.municipio.trim(),

          codigoMunicipio:
            codigoMunicipioLimpo,

          uf:
            form.uf
              .trim()
              .toUpperCase(),
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setMensagem(
        "Dados da empresa atualizados com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar empresa:",
        error
      );

      setErro(
        "Não foi possível atualizar os dados da empresa."
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
      <div>
        <Link
          href="/empresas"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />

          Voltar para empresas
        </Link>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 size={24} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Editar empresa
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Atualize os dados cadastrais,
              fiscais e o endereço da empresa.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Identificação da empresa
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Dados cadastrais e registros
                fiscais.
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
                  className="h-11 flex-1"
                  inputMode="numeric"
                  value={form.cnpj}
                  onChange={(event) =>
                    atualizarCampo(
                      "cnpj",
                      formatarCnpj(
                        event.target.value
                      )
                    )
                  }
                  disabled={bloqueado}
                  required
                />

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 sm:min-w-36"
                  onClick={buscarCnpj}
                  disabled={bloqueado}
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
                      <Search size={17} />

                      Consultar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Campo
              id="razaoSocial"
              label="Razão social"
              value={form.razaoSocial}
              onChange={(valor) =>
                atualizarCampo(
                  "razaoSocial",
                  valor
                )
              }
              disabled={bloqueado}
              required
            />

            <Campo
              id="nomeFantasia"
              label="Nome fantasia"
              value={form.nomeFantasia}
              onChange={(valor) =>
                atualizarCampo(
                  "nomeFantasia",
                  valor
                )
              }
              disabled={bloqueado}
            />

            <Campo
              id="inscricaoEstadual"
              label="Inscrição estadual"
              value={
                form.inscricaoEstadual
              }
              onChange={(valor) =>
                atualizarCampo(
                  "inscricaoEstadual",
                  valor
                )
              }
              disabled={bloqueado}
            />

            <Campo
              id="inscricaoMunicipal"
              label="Inscrição municipal"
              value={
                form.inscricaoMunicipal
              }
              onChange={(valor) =>
                atualizarCampo(
                  "inscricaoMunicipal",
                  valor
                )
              }
              disabled={bloqueado}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Contato
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Informações de contato da
                empresa.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Campo
              id="email"
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(valor) =>
                atualizarCampo(
                  "email",
                  valor
                )
              }
              disabled={bloqueado}
            />

            <Campo
              id="telefone"
              label="Telefone"
              value={form.telefone}
              onChange={(valor) =>
                atualizarCampo(
                  "telefone",
                  formatarTelefone(
                    valor
                  )
                )
              }
              disabled={bloqueado}
            />
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Endereço
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Endereço fiscal do
                estabelecimento.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-6">
            <div className="md:col-span-2">
              <Campo
                id="cep"
                label="CEP"
                value={form.cep}
                onChange={(valor) =>
                  atualizarCampo(
                    "cep",
                    formatarCep(
                      valor
                    )
                  )
                }
                disabled={bloqueado}
              />
            </div>

            <div className="md:col-span-4">
              <Campo
                id="logradouro"
                label="Logradouro"
                value={form.logradouro}
                onChange={(valor) =>
                  atualizarCampo(
                    "logradouro",
                    valor
                  )
                }
                disabled={bloqueado}
              />
            </div>

            <div className="md:col-span-2">
              <Campo
                id="numero"
                label="Número"
                value={form.numero}
                onChange={(valor) =>
                  atualizarCampo(
                    "numero",
                    valor
                  )
                }
                disabled={bloqueado}
              />
            </div>

            <div className="md:col-span-4">
              <Campo
                id="complemento"
                label="Complemento"
                value={form.complemento}
                onChange={(valor) =>
                  atualizarCampo(
                    "complemento",
                    valor
                  )
                }
                disabled={bloqueado}
              />
            </div>

            <div className="md:col-span-6">
              <Campo
                id="bairro"
                label="Bairro"
                value={form.bairro}
                onChange={(valor) =>
                  atualizarCampo(
                    "bairro",
                    valor
                  )
                }
                disabled={bloqueado}
              />
            </div>

            <CidadeIbgeSearch
              municipio={
                form.municipio
              }
              uf={form.uf}
              codigoMunicipio={
                form.codigoMunicipio
              }
              onChange={
                atualizarCidade
              }
              disabled={bloqueado}
            />
          </div>
        </section>

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

              <p>{mensagem}</p>
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

        <div className="flex flex-col-reverse gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:justify-end">
          <Button
            nativeButton={false}
            render={
              <Link href="/empresas" />
            }
            variant="outline"
            className="h-11"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            className="h-11 sm:min-w-44"
            disabled={bloqueado}
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
                <Save size={17} />

                Salvar alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

type CampoProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  required?: boolean;

  type?: string;
};

function Campo({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  type = "text",
}: CampoProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <Input
        id={id}
        type={type}
        className="h-11"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
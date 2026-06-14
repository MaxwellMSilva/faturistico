"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  Contact,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Save,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { createTransportador } from "@/actions/transportadores/create-transportador";
import { updateTransportador } from "@/actions/transportadores/update-transportador";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CidadeIbgeSearch } from "../empresa/cidade-ibge-search";

type TipoPessoa =
  | "FISICA"
  | "JURIDICA";

type Transportador = {
  id: string;

  tipoPessoa: TipoPessoa;

  nome: string;
  nomeFantasia: string | null;

  cpfCnpj: string;

  inscricaoEstadual:
    | string
    | null;

  inscricaoMunicipal:
    | string
    | null;

  rntrc: string | null;

  email: string | null;
  telefone: string | null;

  cep: string | null;

  logradouro: string | null;
  numero: string | null;
  complemento: string | null;

  bairro: string | null;

  municipio: string | null;

  codigoMunicipio:
    | string
    | null;

  uf: string | null;

  ativo: boolean;
};

type Props = {
  empresaId: string;
  transportador?: Transportador;
};

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

function formatarCpf(
  valor: string
) {
  const numeros =
    somenteNumeros(valor).slice(
      0,
      11
    );

  return numeros
    .replace(
      /^(\d{3})(\d)/,
      "$1.$2"
    )
    .replace(
      /^(\d{3})\.(\d{3})(\d)/,
      "$1.$2.$3"
    )
    .replace(
      /\.(\d{3})(\d)/,
      ".$1-$2"
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

function formatarCep(
  valor: string
) {
  return somenteNumeros(valor)
    .slice(0, 8)
    .replace(
      /^(\d{5})(\d)/,
      "$1-$2"
    );
}

function validarCpf(
  valor: string
) {
  const cpf =
    somenteNumeros(valor);

  if (
    cpf.length !== 11 ||
    /^(\d)\1{10}$/.test(cpf)
  ) {
    return false;
  }

  let soma = 0;

  for (let indice = 0; indice < 9; indice++) {
    soma +=
      Number(cpf[indice]) *
      (10 - indice);
  }

  let digito =
    11 - (soma % 11);

  if (digito >= 10) {
    digito = 0;
  }

  if (
    digito !== Number(cpf[9])
  ) {
    return false;
  }

  soma = 0;

  for (
    let indice = 0;
    indice < 10;
    indice++
  ) {
    soma +=
      Number(cpf[indice]) *
      (11 - indice);
  }

  digito =
    11 - (soma % 11);

  if (digito >= 10) {
    digito = 0;
  }

  return (
    digito === Number(cpf[10])
  );
}

function validarCnpj(
  valor: string
) {
  const cnpj =
    somenteNumeros(valor);

  if (
    cnpj.length !== 14 ||
    /^(\d)\1{13}$/.test(cnpj)
  ) {
    return false;
  }

  const calcularDigito = (
    base: string,
    pesos: number[]
  ) => {
    const soma = base
      .split("")
      .reduce(
        (total, numero, indice) =>
          total +
          Number(numero) *
            pesos[indice],
        0
      );

    const resto = soma % 11;

    return resto < 2
      ? 0
      : 11 - resto;
  };

  const primeiroDigito =
    calcularDigito(
      cnpj.slice(0, 12),
      [
        5, 4, 3, 2, 9, 8,
        7, 6, 5, 4, 3, 2,
      ]
    );

  const segundoDigito =
    calcularDigito(
      cnpj.slice(0, 12) +
        primeiroDigito,
      [
        6, 5, 4, 3, 2, 9,
        8, 7, 6, 5, 4, 3, 2,
      ]
    );

  return (
    primeiroDigito ===
      Number(cnpj[12]) &&
    segundoDigito ===
      Number(cnpj[13])
  );
}

export function TransportadorDialog({
  empresaId,
  transportador,
}: Props) {
  const router = useRouter();

  const editando =
    Boolean(transportador);

  function criarEstadoInicial() {
    return {
      tipoPessoa:
        transportador?.tipoPessoa ??
        ("JURIDICA" as TipoPessoa),

      nome:
        transportador?.nome ?? "",

      nomeFantasia:
        transportador
          ?.nomeFantasia ?? "",

      cpfCnpj:
        transportador
          ? transportador.tipoPessoa ===
            "FISICA"
            ? formatarCpf(
                transportador.cpfCnpj
              )
            : formatarCnpj(
                transportador.cpfCnpj
              )
          : "",

      inscricaoEstadual:
        transportador
          ?.inscricaoEstadual ?? "",

      inscricaoMunicipal:
        transportador
          ?.inscricaoMunicipal ?? "",

      rntrc:
        transportador?.rntrc ??
        "",

      email:
        transportador?.email ?? "",

      telefone:
        formatarTelefone(
          transportador?.telefone ??
            ""
        ),

      cep:
        formatarCep(
          transportador?.cep ?? ""
        ),

      logradouro:
        transportador
          ?.logradouro ?? "",

      numero:
        transportador?.numero ??
        "",

      complemento:
        transportador
          ?.complemento ?? "",

      bairro:
        transportador?.bairro ??
        "",

      municipio:
        transportador
          ?.municipio ?? "",

      codigoMunicipio:
        transportador
          ?.codigoMunicipio ?? "",

      uf:
        transportador?.uf ?? "",

      ativo:
        transportador?.ativo ??
        true,
    };
  }

  type FormTransportador =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [form, setForm] =
    useState<FormTransportador>(
      criarEstadoInicial
    );

  function atualizarCampo<
    Campo extends keyof FormTransportador,
  >(
    campo: Campo,
    valor: FormTransportador[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }
  }

  function atualizarCidade({
    municipio,
    uf,
    codigoMunicipio,
  }: {
    municipio: string;
    uf: string;
    codigoMunicipio: string;
  }) {
    setForm((anterior) => ({
      ...anterior,
      municipio,
      uf,
      codigoMunicipio,
    }));

    if (erro) {
      setErro("");
    }
  }

  function alterarTipoPessoa(
    tipoPessoa: TipoPessoa
  ) {
    setForm((anterior) => ({
      ...anterior,

      tipoPessoa,

      cpfCnpj: "",

      nomeFantasia:
        tipoPessoa === "FISICA"
          ? ""
          : anterior.nomeFantasia,
    }));

    setErro("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const nome =
      form.nome.trim();

    const cpfCnpj =
      somenteNumeros(
        form.cpfCnpj
      );

    const cep =
      somenteNumeros(form.cep);

    const telefone =
      somenteNumeros(
        form.telefone
      );

    const rntrc =
      somenteNumeros(
        form.rntrc
      );

    const codigoMunicipio =
      somenteNumeros(
        form.codigoMunicipio
      );

    const uf =
      form.uf
        .trim()
        .toUpperCase();

    const email =
      form.email
        .trim()
        .toLowerCase();

    if (!nome) {
      setErro(
        form.tipoPessoa ===
        "FISICA"
          ? "Informe o nome completo do transportador."
          : "Informe a razão social do transportador."
      );

      return;
    }

    if (
      form.tipoPessoa ===
        "FISICA" &&
      !validarCpf(cpfCnpj)
    ) {
      setErro(
        "Informe um CPF válido."
      );

      return;
    }

    if (
      form.tipoPessoa ===
        "JURIDICA" &&
      !validarCnpj(cpfCnpj)
    ) {
      setErro(
        "Informe um CNPJ válido."
      );

      return;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setErro(
        "Informe um e-mail válido."
      );

      return;
    }

    if (
      telefone &&
      telefone.length !== 10 &&
      telefone.length !== 11
    ) {
      setErro(
        "Informe um telefone válido com DDD."
      );

      return;
    }

    if (
      cep &&
      cep.length !== 8
    ) {
      setErro(
        "Informe um CEP válido com 8 números."
      );

      return;
    }

    if (
      codigoMunicipio &&
      codigoMunicipio.length !==
        7
    ) {
      setErro(
        "Informe um código IBGE válido com 7 números."
      );

      return;
    }

    if (
      uf &&
      uf.length !== 2
    ) {
      setErro(
        "Informe uma UF válida com duas letras."
      );

      return;
    }

    try {
      setCarregando(true);

      const dados = {
        empresaId,

        tipoPessoa:
          form.tipoPessoa,

        nome,

        nomeFantasia:
          form.tipoPessoa ===
          "JURIDICA"
            ? form.nomeFantasia.trim()
            : "",

        cpfCnpj,

        inscricaoEstadual:
          form.inscricaoEstadual.trim(),

        inscricaoMunicipal:
          form.inscricaoMunicipal.trim(),

        rntrc,

        email,
        telefone,
        cep,

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

        codigoMunicipio,

        uf,
      };

      const resultado =
        transportador
          ? await updateTransportador({
              id:
                transportador.id,

              ...dados,

              ativo:
                form.ativo,
            })
          : await createTransportador(
              dados
            );

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar transportador:",
        error
      );

      setErro(
        "Não foi possível salvar o transportador. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const pessoaJuridica =
    form.tipoPessoa ===
    "JURIDICA";

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );

          setErro("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={
              editando
                ? "outline"
                : "default"
            }
            size={
              editando
                ? "sm"
                : "default"
            }
            className={
              editando
                ? undefined
                : "h-11"
            }
          />
        }
      >
        {editando ? (
          <>
            <Pencil size={16} />
            Editar
          </>
        ) : (
          <>
            <Plus size={17} />
            Novo transportador
          </>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {editando
              ? "Editar transportador"
              : "Novo transportador"}
          </DialogTitle>

          <DialogDescription>
            Informe os dados cadastrais,
            fiscais e de contato do
            transportador.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Identificação */}

          <SecaoFormulario
            icone={
              pessoaJuridica
                ? Building2
                : UserRound
            }
            titulo="Identificação"
            descricao="Dados principais e registros do transportador."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <CampoSelect
                id="tipoPessoaTransportador"
                label="Tipo de pessoa"
                value={form.tipoPessoa}
                onChange={(valor) =>
                  alterarTipoPessoa(
                    valor as TipoPessoa
                  )
                }
                disabled={carregando}
              >
                <option value="JURIDICA">
                  Pessoa Jurídica
                </option>

                <option value="FISICA">
                  Pessoa Física
                </option>
              </CampoSelect>

              <CampoTexto
                id="documentoTransportador"
                label={
                  pessoaJuridica
                    ? "CNPJ"
                    : "CPF"
                }
                placeholder={
                  pessoaJuridica
                    ? "00.000.000/0000-00"
                    : "000.000.000-00"
                }
                inputMode="numeric"
                value={form.cpfCnpj}
                onChange={(valor) =>
                  atualizarCampo(
                    "cpfCnpj",
                    pessoaJuridica
                      ? formatarCnpj(
                          valor
                        )
                      : formatarCpf(
                          valor
                        )
                  )
                }
                disabled={carregando}
                required
              />

              <div className="md:col-span-2">
                <CampoTexto
                  id="nomeTransportador"
                  label={
                    pessoaJuridica
                      ? "Razão social"
                      : "Nome completo"
                  }
                  placeholder={
                    pessoaJuridica
                      ? "Razão social da transportadora"
                      : "Nome completo do motorista autônomo"
                  }
                  value={form.nome}
                  onChange={(valor) =>
                    atualizarCampo(
                      "nome",
                      valor
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              {pessoaJuridica && (
                <CampoTexto
                  id="nomeFantasiaTransportador"
                  label="Nome fantasia"
                  placeholder="Nome comercial"
                  value={
                    form.nomeFantasia
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "nomeFantasia",
                      valor
                    )
                  }
                  disabled={carregando}
                />
              )}

              <CampoTexto
                id="rntrcTransportador"
                label="RNTRC"
                placeholder="Registro Nacional de Transportadores"
                inputMode="numeric"
                value={form.rntrc}
                onChange={(valor) =>
                  atualizarCampo(
                    "rntrc",
                    somenteNumeros(
                      valor
                    ).slice(0, 14)
                  )
                }
                disabled={carregando}
                ajuda="Informe somente os números do registro."
              />

              <CampoTexto
                id="ieTransportador"
                label="Inscrição estadual"
                placeholder="Inscrição estadual"
                value={
                  form.inscricaoEstadual
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "inscricaoEstadual",
                    valor
                  )
                }
                disabled={carregando}
              />

              <CampoTexto
                id="imTransportador"
                label="Inscrição municipal"
                placeholder="Inscrição municipal"
                value={
                  form.inscricaoMunicipal
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "inscricaoMunicipal",
                    valor
                  )
                }
                disabled={carregando}
              />
            </div>
          </SecaoFormulario>

          {/* Contato */}

          <SecaoFormulario
            icone={Contact}
            titulo="Contato"
            descricao="Dados para comunicação com o transportador."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <CampoTexto
                id="emailTransportador"
                type="email"
                label="E-mail"
                placeholder="contato@transportadora.com.br"
                value={form.email}
                onChange={(valor) =>
                  atualizarCampo(
                    "email",
                    valor
                  )
                }
                disabled={carregando}
                autoComplete="email"
              />

              <CampoTexto
                id="telefoneTransportador"
                label="Telefone"
                placeholder="(00) 00000-0000"
                inputMode="tel"
                value={
                  form.telefone
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "telefone",
                    formatarTelefone(
                      valor
                    )
                  )
                }
                disabled={carregando}
                autoComplete="tel"
              />
            </div>
          </SecaoFormulario>

          {/* Endereço */}

          <SecaoFormulario
            icone={MapPin}
            titulo="Endereço"
            descricao="Endereço fiscal utilizado nos documentos de transporte."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <CampoTexto
                id="cepTransportador"
                label="CEP"
                placeholder="00000-000"
                inputMode="numeric"
                value={form.cep}
                onChange={(valor) =>
                  atualizarCampo(
                    "cep",
                    formatarCep(valor)
                  )
                }
                disabled={carregando}
                autoComplete="postal-code"
              />

              <CampoTexto
                id="logradouroTransportador"
                label="Logradouro"
                placeholder="Rua, avenida ou rodovia"
                value={form.logradouro}
                onChange={(valor) =>
                  atualizarCampo(
                    "logradouro",
                    valor
                  )
                }
                disabled={carregando}
                autoComplete="street-address"
              />

              <CampoTexto
                id="numeroTransportador"
                label="Número"
                placeholder="Número ou S/N"
                value={form.numero}
                onChange={(valor) =>
                  atualizarCampo(
                    "numero",
                    valor
                  )
                }
                disabled={carregando}
              />

              <CampoTexto
                id="complementoTransportador"
                label="Complemento"
                placeholder="Sala, bloco, galpão..."
                value={form.complemento}
                onChange={(valor) =>
                  atualizarCampo(
                    "complemento",
                    valor
                  )
                }
                disabled={carregando}
              />

              <CampoTexto
                id="bairroTransportador"
                label="Bairro"
                placeholder="Bairro"
                value={form.bairro}
                onChange={(valor) =>
                  atualizarCampo(
                    "bairro",
                    valor
                  )
                }
                disabled={carregando}
              />

              <div className="md:col-span-2">
                <CidadeIbgeSearch
                  municipio={form.municipio}
                  uf={form.uf}
                  codigoMunicipio={
                    form.codigoMunicipio
                  }
                  onChange={atualizarCidade}
                  disabled={carregando}
                />
              </div>
            </div>
          </SecaoFormulario>

          {/* Situação */}

          {editando && (
            <section className="rounded-xl border bg-muted/10 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Truck size={20} />
                </div>

                <label className="flex flex-1 cursor-pointer items-start justify-between gap-4">
                  <span>
                    <span className="block font-semibold">
                      Transportador ativo
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      Transportadores inativos
                      permanecem no histórico,
                      mas não devem ser usados
                      em novas operações.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(event) =>
                      atualizarCampo(
                        "ativo",
                        event.target
                          .checked
                      )
                    }
                    disabled={carregando}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />
                </label>
              </div>
            </section>
          )}

          {/* Erro */}

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{erro}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-11 sm:min-w-52"
              disabled={carregando}
            >
              {carregando ? (
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

                  {editando
                    ? "Salvar alterações"
                    : "Cadastrar transportador"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type SecaoFormularioProps = {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  children: React.ReactNode;
};

function SecaoFormulario({
  icone: Icone,
  titulo,
  descricao,
  children,
}: SecaoFormularioProps) {
  return (
    <section className="rounded-xl border bg-muted/10 p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icone size={20} />
        </div>

        <div>
          <h3 className="font-semibold">
            {titulo}
          </h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {descricao}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

type CampoTextoProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  type?: string;
  inputMode?:
    | "text"
    | "numeric"
    | "decimal"
    | "email"
    | "tel";

  disabled?: boolean;
  required?: boolean;
  ajuda?: string;
  autoComplete?: string;
};

function CampoTexto({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode = "text",
  disabled = false,
  required = false,
  ajuda,
  autoComplete,
}: CampoTextoProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}

        {required && (
          <span className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>

      <Input
        id={id}
        type={type}
        className="h-11"
        placeholder={placeholder}
        inputMode={inputMode}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
      />

      {ajuda && (
        <p className="text-xs leading-5 text-muted-foreground">
          {ajuda}
        </p>
      )}
    </div>
  );
}

type CampoSelectProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  children: React.ReactNode;
};

function CampoSelect({
  id,
  label,
  value,
  onChange,
  disabled = false,
  children,
}: CampoSelectProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  );
}
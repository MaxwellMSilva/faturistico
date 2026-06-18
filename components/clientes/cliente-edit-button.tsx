"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BadgeCheck,
  LoaderCircle,
  Pencil,
  Save,
  Search,
} from "lucide-react";

import { updateCliente } from "@/actions/clientes/update-cliente";

import { CidadeIbgeSearch } from "@/components/empresa/cidade-ibge-search";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormStepperBody,
  FormStepperDialogContent,
  FormStepperFooter,
  FormStepperNav,
} from "@/components/ui/form-stepper";

type TipoPessoa =
  | "FISICA"
  | "JURIDICA";

type Cliente = {
  id: string;

  tipoPessoa: TipoPessoa;

  nome: string;
  cpfCnpj: string;

  inscricaoEstadual:
    | string
    | null;

  inscricaoMunicipal:
    | string
    | null;

  suframa: string | null;

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
};

type Props = {
  empresaId: string;
  cliente: Cliente;
};

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
      /(\d{3})(\d{1,2})$/,
      "$1-$2"
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

function formatarDocumento(
  valor: string,
  tipoPessoa: TipoPessoa
) {
  return tipoPessoa === "FISICA"
    ? formatarCpf(valor)
    : formatarCnpj(valor);
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

const PASSOS_CLIENTE = [
  {
    id: "identificacao",
    titulo: "Identificação",
  },
  {
    id: "contato",
    titulo: "Contato",
  },
  {
    id: "endereco",
    titulo: "Endereço",
  },
] as const;

export function ClienteEditButton({
  empresaId,
  cliente,
}: Props) {
  const router = useRouter();

  function criarEstadoInicial() {
    return {
      tipoPessoa:
        cliente.tipoPessoa,

      nome:
        cliente.nome,

      cpfCnpj:
        formatarDocumento(
          cliente.cpfCnpj,
          cliente.tipoPessoa
        ),

      inscricaoEstadual:
        cliente.inscricaoEstadual ??
        "",

      inscricaoMunicipal:
        cliente.inscricaoMunicipal ??
        "",

      suframa:
        cliente.suframa ?? "",

      email:
        cliente.email ?? "",

      telefone:
        formatarTelefone(
          cliente.telefone ?? ""
        ),

      cep:
        formatarCep(
          cliente.cep ?? ""
        ),

      logradouro:
        cliente.logradouro ?? "",

      numero:
        cliente.numero ?? "",

      complemento:
        cliente.complemento ?? "",

      bairro:
        cliente.bairro ?? "",

      municipio:
        cliente.municipio ?? "",

      codigoMunicipio:
        cliente.codigoMunicipio ??
        "",

      uf:
        cliente.uf ?? "",
    };
  }

  type FormCliente =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    buscandoCnpj,
    setBuscandoCnpj,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [form, setForm] =
    useState<FormCliente>(
      criarEstadoInicial
    );

  const [
    passoAtual,
    setPassoAtual,
  ] = useState(0);

  const ultimoPasso =
    PASSOS_CLIENTE.length - 1;

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function atualizarCampo(
    campo: keyof FormCliente,
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

  function alterarTipoPessoa(
    tipoPessoa: TipoPessoa
  ) {
    setForm((anterior) => ({
      ...anterior,

      tipoPessoa,

      cpfCnpj: "",
    }));

    limparMensagens();
  }

  function validarPassoAtual() {
    const documento =
      somenteNumeros(
        form.cpfCnpj
      );

    const tamanhoEsperado =
      form.tipoPessoa === "FISICA"
        ? 11
        : 14;

    const cep =
      somenteNumeros(form.cep);

    const codigoMunicipio =
      somenteNumeros(
        form.codigoMunicipio
      );

    if (passoAtual === 0) {
      if (!form.nome.trim()) {
        setErro(
          form.tipoPessoa === "FISICA"
            ? "Informe o nome completo do cliente."
            : "Informe a razão social do cliente."
        );

        return false;
      }

      if (
        documento.length !==
        tamanhoEsperado
      ) {
        setErro(
          form.tipoPessoa === "FISICA"
            ? "Informe um CPF válido com 11 números."
            : "Informe um CNPJ válido com 14 números."
        );

        return false;
      }

      return true;
    }

    if (passoAtual === 2) {
      if (
        cep &&
        cep.length !== 8
      ) {
        setErro(
          "Informe um CEP válido com 8 números."
        );

        return false;
      }

      if (
        form.municipio.trim() ||
        form.uf.trim() ||
        codigoMunicipio
      ) {
        if (
          !form.municipio.trim() ||
          form.uf.trim().length !== 2 ||
          codigoMunicipio.length !== 7
        ) {
          setErro(
            "Pesquise e selecione uma cidade válida na lista do IBGE."
          );

          return false;
        }
      }

      return true;
    }

    return true;
  }

  function handleProximoPasso() {
    if (!validarPassoAtual()) {
      return;
    }

    setPassoAtual((anterior) =>
      Math.min(
        anterior + 1,
        ultimoPasso
      )
    );
  }

  function handlePassoAnterior() {
    limparMensagens();
    setPassoAtual((anterior) =>
      Math.max(anterior - 1, 0)
    );
  }

  async function buscarCnpj() {
    limparMensagens();

    const cnpj =
      somenteNumeros(
        form.cpfCnpj
      );

    if (cnpj.length !== 14) {
      setErro(
        "Informe um CNPJ válido com 14 números."
      );

      return;
    }

    try {
      setBuscandoCnpj(true);

      const response =
        await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`
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

        cpfCnpj:
          formatarCnpj(
            data.cnpj ?? cnpj
          ),

        nome:
          data.razao_social ??
          anterior.nome,

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
        "Dados do CNPJ encontrados. Revise as informações antes de salvar."
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

    const documento =
      somenteNumeros(
        form.cpfCnpj
      );

    const tamanhoEsperado =
      form.tipoPessoa === "FISICA"
        ? 11
        : 14;

    const cep =
      somenteNumeros(
        form.cep
      );

    const telefone =
      somenteNumeros(
        form.telefone
      );

    const codigoMunicipio =
      somenteNumeros(
        form.codigoMunicipio
      );

    if (!form.nome.trim()) {
      setErro(
        form.tipoPessoa === "FISICA"
          ? "Informe o nome completo do cliente."
          : "Informe a razão social do cliente."
      );

      return;
    }

    if (
      documento.length !==
      tamanhoEsperado
    ) {
      setErro(
        form.tipoPessoa === "FISICA"
          ? "Informe um CPF válido com 11 números."
          : "Informe um CNPJ válido com 14 números."
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

    const informouCidade =
      Boolean(
        form.municipio.trim() ||
          form.uf.trim() ||
          codigoMunicipio
      );

    if (informouCidade) {
      if (
        !form.municipio.trim() ||
        form.uf.trim().length !== 2 ||
        codigoMunicipio.length !== 7
      ) {
        setErro(
          "Pesquise e selecione uma cidade válida na lista do IBGE."
        );

        return;
      }
    }

    try {
      setCarregando(true);

      const resultado =
        await updateCliente({
          id:
            cliente.id,

          empresaId,

          tipoPessoa:
            form.tipoPessoa,

          nome:
            form.nome.trim(),

          cpfCnpj:
            documento,

          inscricaoEstadual:
            form.inscricaoEstadual
              .trim(),

          inscricaoMunicipal:
            form.inscricaoMunicipal
              .trim(),

          suframa:
            form.suframa.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

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
        "Cliente atualizado com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar cliente:",
        error
      );

      setErro(
        "Não foi possível atualizar o cliente. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const bloqueado =
    carregando ||
    buscandoCnpj;

  const pessoaJuridica =
    form.tipoPessoa ===
    "JURIDICA";

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (bloqueado) {
          return;
        }

        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );

          limparMensagens();
          setPassoAtual(0);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
          />
        }
      >
        <Pencil size={16} />

        Editar
      </DialogTrigger>

      <FormStepperDialogContent>
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>
            Editar cliente
          </DialogTitle>

          <DialogDescription>
            Atualize os dados cadastrais,
            fiscais e o endereço do cliente.
          </DialogDescription>
        </DialogHeader>

        <FormStepperNav
          passos={[...PASSOS_CLIENTE]}
          passoAtual={passoAtual}
        />

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FormStepperBody>
            {passoAtual === 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`tipoPessoa-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Tipo de pessoa
                </label>

                <select
                  id={`tipoPessoa-${cliente.id}`}
                  value={
                    form.tipoPessoa
                  }
                  onChange={(event) =>
                    alterarTipoPessoa(
                      event.target
                        .value as TipoPessoa
                    )
                  }
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={bloqueado}
                >
                  <option value="JURIDICA">
                    Pessoa jurídica
                  </option>

                  <option value="FISICA">
                    Pessoa física
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`nome-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  {pessoaJuridica
                    ? "Razão social"
                    : "Nome completo"}
                </label>

                <Input
                  id={`nome-${cliente.id}`}
                  className="h-11"
                  placeholder={
                    pessoaJuridica
                      ? "Razão social do cliente"
                      : "Nome completo do cliente"
                  }
                  value={form.nome}
                  onChange={(event) =>
                    atualizarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`documento-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  {pessoaJuridica
                    ? "CNPJ"
                    : "CPF"}
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id={`documento-${cliente.id}`}
                    className="h-11 flex-1"
                    placeholder={
                      pessoaJuridica
                        ? "00.000.000/0000-00"
                        : "000.000.000-00"
                    }
                    inputMode="numeric"
                    value={
                      form.cpfCnpj
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "cpfCnpj",
                        formatarDocumento(
                          event.target
                            .value,
                          form.tipoPessoa
                        )
                      )
                    }
                    disabled={bloqueado}
                    required
                  />

                  {pessoaJuridica && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 sm:min-w-36"
                      onClick={
                        buscarCnpj
                      }
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
                          <Search
                            size={17}
                          />

                          Buscar CNPJ
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`ie-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Inscrição estadual
                </label>

                <Input
                  id={`ie-${cliente.id}`}
                  className="h-11"
                  placeholder="Inscrição estadual"
                  value={
                    form.inscricaoEstadual
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "inscricaoEstadual",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`im-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Inscrição municipal
                </label>

                <Input
                  id={`im-${cliente.id}`}
                  className="h-11"
                  placeholder="Inscrição municipal"
                  value={
                    form.inscricaoMunicipal
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "inscricaoMunicipal",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`suframa-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  SUFRAMA
                </label>

                <Input
                  id={`suframa-${cliente.id}`}
                  className="h-11"
                  placeholder="Inscrição SUFRAMA, quando aplicável"
                  value={form.suframa}
                  onChange={(event) =>
                    atualizarCampo(
                      "suframa",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>
            </div>
            )}

            {passoAtual === 1 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`email-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  E-mail
                </label>

                <Input
                  id={`email-${cliente.id}`}
                  type="email"
                  className="h-11"
                  placeholder="cliente@exemplo.com"
                  value={form.email}
                  onChange={(event) =>
                    atualizarCampo(
                      "email",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`telefone-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Telefone
                </label>

                <Input
                  id={`telefone-${cliente.id}`}
                  className="h-11"
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  value={
                    form.telefone
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "telefone",
                      formatarTelefone(
                        event.target.value
                      )
                    )
                  }
                  disabled={bloqueado}
                />
              </div>
            </div>
            )}

            {passoAtual === 2 && (
            <div className="grid gap-5 md:grid-cols-6">
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`cep-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  CEP
                </label>

                <Input
                  id={`cep-${cliente.id}`}
                  className="h-11"
                  placeholder="00000-000"
                  inputMode="numeric"
                  value={form.cep}
                  onChange={(event) =>
                    atualizarCampo(
                      "cep",
                      formatarCep(
                        event.target.value
                      )
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2 md:col-span-4">
                <label
                  htmlFor={`logradouro-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Logradouro
                </label>

                <Input
                  id={`logradouro-${cliente.id}`}
                  className="h-11"
                  placeholder="Rua, avenida, rodovia..."
                  value={
                    form.logradouro
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "logradouro",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`numero-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Número
                </label>

                <Input
                  id={`numero-${cliente.id}`}
                  className="h-11"
                  placeholder="Número ou S/N"
                  value={form.numero}
                  onChange={(event) =>
                    atualizarCampo(
                      "numero",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2 md:col-span-4">
                <label
                  htmlFor={`complemento-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Complemento
                </label>

                <Input
                  id={`complemento-${cliente.id}`}
                  className="h-11"
                  placeholder="Sala, bloco, apartamento..."
                  value={
                    form.complemento
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "complemento",
                      event.target.value
                    )
                  }
                  disabled={bloqueado}
                />
              </div>

              <div className="space-y-2 md:col-span-6">
                <label
                  htmlFor={`bairro-${cliente.id}`}
                  className="text-sm font-medium"
                >
                  Bairro
                </label>

                <Input
                  id={`bairro-${cliente.id}`}
                  className="h-11"
                  placeholder="Bairro"
                  value={form.bairro}
                  onChange={(event) =>
                    atualizarCampo(
                      "bairro",
                      event.target.value
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
            )}

          <div
            aria-live="polite"
            className="mt-5 space-y-3"
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
          </FormStepperBody>

          <FormStepperFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                setAberto(false)
              }
              disabled={bloqueado}
            >
              Cancelar
            </Button>

            {passoAtual > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={
                  handlePassoAnterior
                }
                disabled={bloqueado}
              >
                Voltar
              </Button>
            )}

            {passoAtual < ultimoPasso ? (
              <Button
                type="button"
                className="h-11 sm:min-w-40"
                onClick={
                  handleProximoPasso
                }
                disabled={bloqueado}
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-11 sm:min-w-44"
                disabled={bloqueado}
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

                    Salvar alterações
                  </>
                )}
              </Button>
            )}
          </FormStepperFooter>
        </form>
      </FormStepperDialogContent>
    </Dialog>
  );
}
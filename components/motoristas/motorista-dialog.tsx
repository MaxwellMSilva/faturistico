"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Contact,
  IdCard,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Truck,
  X,
} from "lucide-react";

import { createMotorista } from "@/actions/motoristas/create-motorista";
import { updateMotorista } from "@/actions/motoristas/update-motorista";

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

type TransportadorOpcao = {
  id: string;
  nome: string;
  nomeFantasia: string | null;
  cpfCnpj: string;

  tipoPessoa:
    | "FISICA"
    | "JURIDICA";
};

type Motorista = {
  id: string;

  transportadorId:
    | string
    | null;

  nome: string;
  cpf: string;

  numeroCnh: string | null;
  categoriaCnh: string | null;
  validadeCnh: string | null;

  telefone: string | null;

  ativo: boolean;
};

type Props = {
  empresaId: string;

  transportadores:
    TransportadorOpcao[];

  motorista?: Motorista;
};

const categoriasCnh = [
  "ACC",
  "A",
  "B",
  "AB",
  "C",
  "AC",
  "D",
  "AD",
  "E",
  "AE",
];

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

  for (
    let indice = 0;
    indice < 9;
    indice++
  ) {
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

function dataParaCampo(
  valor?: string | null
) {
  if (!valor) {
    return "";
  }

  return valor.slice(0, 10);
}

function obterSituacaoCnh(
  validade: string
) {
  if (!validade) {
    return null;
  }

  const dataValidade =
    new Date(
      `${validade}T12:00:00`
    );

  if (
    Number.isNaN(
      dataValidade.getTime()
    )
  ) {
    return null;
  }

  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

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
      texto: "CNH vencida",
      classe:
        "border-destructive/30 bg-destructive/10 text-destructive",
      icone: AlertTriangle,
    };
  }

  if (dias <= 30) {
    return {
      texto:
        dias === 0
          ? "A CNH vence hoje"
          : `A CNH vence em ${dias} dia(s)`,
      classe:
        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      icone: AlertTriangle,
    };
  }

  return {
    texto: "CNH dentro da validade",
    classe:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icone: BadgeCheck,
  };
}

const PASSOS_MOTORISTA = [
  {
    id: "identificacao",
    titulo: "Identificação",
  },
  {
    id: "cnh",
    titulo: "CNH",
  },
  {
    id: "vinculo",
    titulo: "Vínculo",
  },
] as const;

export function MotoristaDialog({
  empresaId,
  transportadores,
  motorista,
}: Props) {
  const router = useRouter();

  const editando =
    Boolean(motorista);

  function criarEstadoInicial() {
    return {
      transportadorId:
        motorista
          ?.transportadorId ?? "",

      nome:
        motorista?.nome ?? "",

      cpf: formatarCpf(
        motorista?.cpf ?? ""
      ),

      numeroCnh:
        motorista?.numeroCnh ??
        "",

      categoriaCnh:
        motorista
          ?.categoriaCnh ?? "",

      validadeCnh:
        dataParaCampo(
          motorista?.validadeCnh
        ),

      telefone:
        formatarTelefone(
          motorista?.telefone ?? ""
        ),

      ativo:
        motorista?.ativo ?? true,
    };
  }

  type FormMotorista =
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
    useState<FormMotorista>(
      criarEstadoInicial
    );

  const [
    passoAtual,
    setPassoAtual,
  ] = useState(0);

  const ultimoPasso =
    PASSOS_MOTORISTA.length - 1;

  function reiniciarDialogo() {
    setForm(criarEstadoInicial());
    setErro("");
    setPassoAtual(0);
  }

  function validarPassoAtual() {
    const nome =
      form.nome.trim();

    const cpf =
      somenteNumeros(form.cpf);

    const telefone =
      somenteNumeros(
        form.telefone
      );

    const numeroCnh =
      somenteNumeros(
        form.numeroCnh
      );

    const categoriaCnh =
      form.categoriaCnh
        .trim()
        .toUpperCase();

    if (passoAtual === 0) {
      if (!nome) {
        setErro(
          "Informe o nome completo do motorista."
        );

        return false;
      }

      if (!validarCpf(cpf)) {
        setErro(
          "Informe um CPF válido."
        );

        return false;
      }

      if (
        telefone &&
        telefone.length !== 10 &&
        telefone.length !== 11
      ) {
        setErro(
          "Informe um telefone válido com DDD."
        );

        return false;
      }

      return true;
    }

    if (passoAtual === 1) {
      const informouCnh =
        Boolean(
          numeroCnh ||
            categoriaCnh ||
            form.validadeCnh
        );

      if (informouCnh) {
        if (
          numeroCnh.length !== 11
        ) {
          setErro(
            "Informe o número da CNH com 11 números."
          );

          return false;
        }

        if (!categoriaCnh) {
          setErro(
            "Selecione a categoria da CNH."
          );

          return false;
        }

        if (!form.validadeCnh) {
          setErro(
            "Informe a validade da CNH."
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
    setErro("");
    setPassoAtual((anterior) =>
      Math.max(anterior - 1, 0)
    );
  }

  function atualizarCampo<
    Campo extends keyof FormMotorista,
  >(
    campo: Campo,
    valor: FormMotorista[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    /*
     * Impede o salvamento antecipado caso
     * o formulário seja enviado antes
     * do último passo.
     */
    if (passoAtual < ultimoPasso) {
      handleProximoPasso();
      return;
    }

    setErro("");

    const nome =
      form.nome.trim();

    const cpf =
      somenteNumeros(form.cpf);

    const telefone =
      somenteNumeros(
        form.telefone
      );

    const numeroCnh =
      somenteNumeros(
        form.numeroCnh
      );

    const categoriaCnh =
      form.categoriaCnh
        .trim()
        .toUpperCase();

    if (!nome) {
      setErro(
        "Informe o nome completo do motorista."
      );

      return;
    }

    if (!validarCpf(cpf)) {
      setErro(
        "Informe um CPF válido."
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

    const informouCnh =
      Boolean(
        numeroCnh ||
        categoriaCnh ||
        form.validadeCnh
      );

    if (informouCnh) {
      if (
        numeroCnh.length !== 11
      ) {
        setErro(
          "Informe o número da CNH com 11 números."
        );

        return;
      }

      if (!categoriaCnh) {
        setErro(
          "Selecione a categoria da CNH."
        );

        return;
      }

      if (!form.validadeCnh) {
        setErro(
          "Informe a validade da CNH."
        );

        return;
      }
    }

    try {
      setCarregando(true);

      const dados = {
        empresaId,

        transportadorId:
          form.transportadorId ||
          undefined,

        nome,
        cpf,

        numeroCnh,

        categoriaCnh,

        validadeCnh:
          form.validadeCnh ||
          null,

        telefone,
      };

      const resultado =
        motorista
          ? await updateMotorista({
              id: motorista.id,

              ...dados,

              ativo:
                form.ativo,
            })
          : await createMotorista(
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
        "Erro ao salvar motorista:",
        error
      );

      setErro(
        "Não foi possível salvar o motorista. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  const situacaoCnh =
    obterSituacaoCnh(
      form.validadeCnh
    );

  const SituacaoIcone =
    situacaoCnh?.icone;

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (valor) {
          reiniciarDialogo();
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

            Novo motorista
          </>
        )}
      </DialogTrigger>

      <FormStepperDialogContent className="sm:max-w-3xl">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>
            {editando
              ? "Editar motorista"
              : "Novo motorista"}
          </DialogTitle>

          <DialogDescription>
            Informe os dados pessoais,
            a habilitação e o vínculo do
            motorista.
          </DialogDescription>
        </DialogHeader>

        <FormStepperNav
          passos={[...PASSOS_MOTORISTA]}
          passoAtual={passoAtual}
        />

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FormStepperBody>
            {passoAtual === 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <CampoTexto
                  id="nomeMotorista"
                  label="Nome completo"
                  placeholder="Nome completo do motorista"
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

              <CampoTexto
                id="cpfMotorista"
                label="CPF"
                placeholder="000.000.000-00"
                inputMode="numeric"
                value={form.cpf}
                onChange={(valor) =>
                  atualizarCampo(
                    "cpf",
                    formatarCpf(valor)
                  )
                }
                disabled={carregando}
                required
              />

              <CampoTexto
                id="telefoneMotorista"
                label="Telefone"
                placeholder="(00) 00000-0000"
                inputMode="tel"
                value={form.telefone}
                onChange={(valor) =>
                  atualizarCampo(
                    "telefone",
                    formatarTelefone(
                      valor
                    )
                  )
                }
                disabled={carregando}
              />
            </div>
            )}

            {passoAtual === 1 && (
            <>
            <div className="grid gap-5 md:grid-cols-3">
              <CampoTexto
                id="numeroCnhMotorista"
                label="Número da CNH"
                placeholder="00000000000"
                inputMode="numeric"
                value={form.numeroCnh}
                onChange={(valor) =>
                  atualizarCampo(
                    "numeroCnh",
                    somenteNumeros(
                      valor
                    ).slice(0, 11)
                  )
                }
                disabled={carregando}
                ajuda="A CNH deve possuir 11 números."
              />

              <CampoSelect
                id="categoriaCnhMotorista"
                label="Categoria"
                value={
                  form.categoriaCnh
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "categoriaCnh",
                    valor
                  )
                }
                disabled={carregando}
              >
                <option value="">
                  Selecione
                </option>

                {categoriasCnh.map(
                  (categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  )
                )}
              </CampoSelect>

              <div className="space-y-2">
                <label
                  htmlFor="validadeCnhMotorista"
                  className="text-sm font-medium"
                >
                  Validade da CNH
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />

                  <Input
                    id="validadeCnhMotorista"
                    type="date"
                    className="h-11 pl-10"
                    value={
                      form.validadeCnh
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "validadeCnh",
                        event.target.value
                      )
                    }
                    disabled={carregando}
                  />
                </div>
              </div>
            </div>

            {situacaoCnh &&
              SituacaoIcone && (
                <div
                  className={[
                    "mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                    situacaoCnh.classe,
                  ].join(" ")}
                >
                  <SituacaoIcone
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {situacaoCnh.texto}
                  </p>
                </div>
              )}
            </>
            )}

            {passoAtual === 2 && (
            <>
            <CampoSelect
              id="transportadorMotorista"
              label="Transportador responsável"
              value={
                form.transportadorId
              }
              onChange={(valor) =>
                atualizarCampo(
                  "transportadorId",
                  valor
                )
              }
              disabled={carregando}
            >
              <option value="">
                Sem transportador vinculado
              </option>

              {transportadores.map(
                (transportador) => (
                  <option
                    key={
                      transportador.id
                    }
                    value={
                      transportador.id
                    }
                  >
                    {transportador.nome}
                    {transportador
                      .nomeFantasia
                      ? ` — ${transportador.nomeFantasia}`
                      : ""}
                  </option>
                )
              )}
            </CampoSelect>

            {transportadores.length ===
              0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                Nenhum transportador ativo
                está disponível. O motorista
                poderá ser cadastrado sem
                vínculo.
              </p>
            )}

          {editando && (
            <section className="mt-5 rounded-xl border bg-muted/10 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Contact size={20} />
                </div>

                <label className="flex flex-1 cursor-pointer items-start justify-between gap-4">
                  <span>
                    <span className="block font-semibold">
                      Motorista ativo
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      Motoristas inativos
                      permanecem no histórico,
                      mas não ficam disponíveis
                      em novas operações.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(event) =>
                      atualizarCampo(
                        "ativo",
                        event.target.checked
                      )
                    }
                    disabled={carregando}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />
                </label>
              </div>
            </section>
          )}
            </>
            )}

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{erro}</p>
            </div>
          )}
          </FormStepperBody>

          <FormStepperFooter>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                  {passoAtual + 1}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {
                      PASSOS_MOTORISTA[
                        passoAtual
                      ].titulo
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Etapa {passoAtual + 1} de{" "}
                    {
                      PASSOS_MOTORISTA.length
                    }
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-xl px-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    setAberto(false)
                  }
                  disabled={carregando}
                >
                  <X size={17} />

                  Cancelar
                </Button>

                {passoAtual > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl px-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    onClick={
                      handlePassoAnterior
                    }
                    disabled={carregando}
                  >
                    <ArrowLeft size={17} />

                    Voltar
                  </Button>
                )}

                {passoAtual < ultimoPasso ? (
                  <Button
                    type="button"
                    className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-40"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      handleProximoPasso();
                    }}
                    disabled={carregando}
                  >
                    Continuar

                    <ArrowRight size={17} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-48"
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
                          : "Cadastrar motorista"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </FormStepperFooter>
        </form>
      </FormStepperDialogContent>
    </Dialog>
  );
}

type CampoTextoProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  placeholder?: string;

  inputMode?:
    | "text"
    | "numeric"
    | "tel";

  disabled?: boolean;
  required?: boolean;

  ajuda?: string;
};

function CampoTexto({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = "text",
  disabled = false,
  required = false,
  ajuda,
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
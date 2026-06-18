"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Gauge,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
} from "lucide-react";

import { createVeiculo } from "@/actions/veiculos/create-veiculo";
import { updateVeiculo } from "@/actions/veiculos/update-veiculo";

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

type TipoVeiculo =
  | "CAVALO_MECANICO"
  | "TOCO"
  | "TRUCK"
  | "CARRETA"
  | "REBOQUE"
  | "SEMIRREBOQUE"
  | "UTILITARIO"
  | "OUTRO";

type TransportadorOpcao = {
  id: string;
  nome: string;
  nomeFantasia: string | null;
  cpfCnpj: string;

  tipoPessoa:
    | "FISICA"
    | "JURIDICA";
};

type Veiculo = {
  id: string;

  transportadorId:
    | string
    | null;

  placa: string;
  renavam: string | null;

  ufLicenciamento:
    | string
    | null;

  tipo: TipoVeiculo;

  marcaModelo: string | null;

  anoFabricacao:
    | number
    | null;

  anoModelo:
    | number
    | null;

  taraKg: number | null;

  capacidadeKg:
    | number
    | null;

  capacidadeM3:
    | number
    | null;

  ativo: boolean;
};

type Props = {
  empresaId: string;

  transportadores:
    TransportadorOpcao[];

  veiculo?: Veiculo;
};

const tiposVeiculo: Array<{
  value: TipoVeiculo;
  label: string;
}> = [
  {
    value: "CAVALO_MECANICO",
    label: "Cavalo mecânico",
  },
  {
    value: "TOCO",
    label: "Caminhão toco",
  },
  {
    value: "TRUCK",
    label: "Caminhão truck",
  },
  {
    value: "CARRETA",
    label: "Carreta",
  },
  {
    value: "REBOQUE",
    label: "Reboque",
  },
  {
    value: "SEMIRREBOQUE",
    label: "Semirreboque",
  },
  {
    value: "UTILITARIO",
    label: "Utilitário",
  },
  {
    value: "OUTRO",
    label: "Outro",
  },
];

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

function normalizarPlaca(
  valor: string
) {
  return valor
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 7)
    .toUpperCase();
}

function formatarPlaca(
  valor: string
) {
  const placa =
    normalizarPlaca(valor);

  if (placa.length <= 3) {
    return placa;
  }

  return `${placa.slice(
    0,
    3
  )}-${placa.slice(3)}`;
}

function placaValida(
  valor: string
) {
  const placa =
    normalizarPlaca(valor);

  return (
    /^[A-Z]{3}\d{4}$/.test(
      placa
    ) ||
    /^[A-Z]{3}\d[A-Z]\d{2}$/.test(
      placa
    )
  );
}

function converterDecimal(
  valor: string
) {
  const texto = valor.trim();

  if (!texto) {
    return null;
  }

  const convertido = Number(
    texto.includes(",")
      ? texto
          .replace(/\./g, "")
          .replace(",", ".")
      : texto
  );

  return Number.isFinite(
    convertido
  )
    ? convertido
    : Number.NaN;
}

function converterInteiro(
  valor: string
) {
  const texto = valor.trim();

  if (!texto) {
    return null;
  }

  const convertido =
    Number(texto);

  return Number.isInteger(
    convertido
  )
    ? convertido
    : Number.NaN;
}

function valorParaCampo(
  valor?: number | null
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor).replace(
    ".",
    ","
  );
}

const PASSOS_VEICULO = [
  {
    id: "identificacao",
    titulo: "Identificação",
  },
  {
    id: "capacidades",
    titulo: "Capacidades",
  },
  {
    id: "vinculo",
    titulo: "Vínculo",
  },
] as const;

export function VeiculoDialog({
  empresaId,
  transportadores,
  veiculo,
}: Props) {
  const router = useRouter();

  const editando =
    Boolean(veiculo);

  function criarEstadoInicial() {
    return {
      transportadorId:
        veiculo
          ?.transportadorId ?? "",

      placa: formatarPlaca(
        veiculo?.placa ?? ""
      ),

      renavam:
        veiculo?.renavam ?? "",

      ufLicenciamento:
        veiculo
          ?.ufLicenciamento ?? "",

      tipo:
        veiculo?.tipo ??
        ("OUTRO" as TipoVeiculo),

      marcaModelo:
        veiculo
          ?.marcaModelo ?? "",

      anoFabricacao:
        veiculo
          ?.anoFabricacao
          ? String(
              veiculo.anoFabricacao
            )
          : "",

      anoModelo:
        veiculo?.anoModelo
          ? String(
              veiculo.anoModelo
            )
          : "",

      taraKg:
        valorParaCampo(
          veiculo?.taraKg
        ),

      capacidadeKg:
        valorParaCampo(
          veiculo?.capacidadeKg
        ),

      capacidadeM3:
        valorParaCampo(
          veiculo?.capacidadeM3
        ),

      ativo:
        veiculo?.ativo ?? true,
    };
  }

  type FormVeiculo =
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
    useState<FormVeiculo>(
      criarEstadoInicial
    );

  const [
    passoAtual,
    setPassoAtual,
  ] = useState(0);

  const ultimoPasso =
    PASSOS_VEICULO.length - 1;

  function reiniciarDialogo() {
    setForm(criarEstadoInicial());
    setErro("");
    setPassoAtual(0);
  }

  function validarPassoAtual() {
    const placa =
      form.placa
        .trim()
        .toUpperCase();

    const renavam =
      somenteNumeros(
        form.renavam
      );

    const ufLicenciamento =
      form.ufLicenciamento
        .trim()
        .toUpperCase();

    const anoFabricacao =
      form.anoFabricacao.trim()
        ? Number(
            form.anoFabricacao
          )
        : null;

    const anoModelo =
      form.anoModelo.trim()
        ? Number(form.anoModelo)
        : null;

    const taraKg = converterDecimal(
      form.taraKg
    );

    const capacidadeKg =
      converterDecimal(
        form.capacidadeKg
      );

    const capacidadeM3 =
      converterDecimal(
        form.capacidadeM3
      );

    if (passoAtual === 0) {
      if (!placaValida(placa)) {
        setErro(
          "Informe uma placa brasileira válida."
        );

        return false;
      }

      if (
        renavam &&
        renavam.length !== 11
      ) {
        setErro(
          "Informe um RENAVAM válido com 11 números."
        );

        return false;
      }

      if (
        ufLicenciamento &&
        ufLicenciamento.length !== 2
      ) {
        setErro(
          "Informe uma UF de licenciamento válida."
        );

        return false;
      }

      const anoAtual =
        new Date().getFullYear();

      if (
        anoFabricacao !== null &&
        (!Number.isInteger(
          anoFabricacao
        ) ||
          anoFabricacao < 1900 ||
          anoFabricacao >
            anoAtual + 1)
      ) {
        setErro(
          "Informe um ano de fabricação válido."
        );

        return false;
      }

      if (
        anoModelo !== null &&
        (!Number.isInteger(
          anoModelo
        ) ||
          anoModelo < 1900 ||
          anoModelo >
            anoAtual + 1)
      ) {
        setErro(
          "Informe um ano do modelo válido."
        );

        return false;
      }

      if (
        anoFabricacao &&
        anoModelo &&
        anoModelo < anoFabricacao
      ) {
        setErro(
          "O ano do modelo não pode ser menor que o ano de fabricação."
        );

        return false;
      }

      return true;
    }

    if (passoAtual === 1) {
      const valoresCapacidade = [
        {
          valor: taraKg,
          mensagem:
            "Informe uma tara válida.",
        },
        {
          valor: capacidadeKg,
          mensagem:
            "Informe uma capacidade em quilogramas válida.",
        },
        {
          valor: capacidadeM3,
          mensagem:
            "Informe uma capacidade em metros cúbicos válida.",
        },
      ];

      for (
        const campo of
        valoresCapacidade
      ) {
        if (
          campo.valor !== null &&
          (!Number.isFinite(
            campo.valor
          ) ||
            campo.valor < 0)
        ) {
          setErro(
            campo.mensagem
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
    Campo extends keyof FormVeiculo,
  >(
    campo: Campo,
    valor: FormVeiculo[Campo]
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

    setErro("");

    const placa =
      normalizarPlaca(
        form.placa
      );

    const renavam =
      somenteNumeros(
        form.renavam
      );

    const ufLicenciamento =
      form.ufLicenciamento
        .trim()
        .toUpperCase();

    const anoFabricacao =
      converterInteiro(
        form.anoFabricacao
      );

    const anoModelo =
      converterInteiro(
        form.anoModelo
      );

    const taraKg =
      converterDecimal(
        form.taraKg
      );

    const capacidadeKg =
      converterDecimal(
        form.capacidadeKg
      );

    const capacidadeM3 =
      converterDecimal(
        form.capacidadeM3
      );

    if (!placaValida(placa)) {
      setErro(
        "Informe uma placa brasileira válida."
      );

      return;
    }

    if (
      renavam &&
      renavam.length !== 11
    ) {
      setErro(
        "Informe um RENAVAM válido com 11 números."
      );

      return;
    }

    if (
      ufLicenciamento &&
      ufLicenciamento.length !==
        2
    ) {
      setErro(
        "Informe uma UF de licenciamento válida."
      );

      return;
    }

    const anoAtual =
      new Date().getFullYear();

    if (
      anoFabricacao !== null &&
      (!Number.isInteger(
        anoFabricacao
      ) ||
        anoFabricacao < 1900 ||
        anoFabricacao >
          anoAtual + 1)
    ) {
      setErro(
        "Informe um ano de fabricação válido."
      );

      return;
    }

    if (
      anoModelo !== null &&
      (!Number.isInteger(
        anoModelo
      ) ||
        anoModelo < 1900 ||
        anoModelo >
          anoAtual + 1)
    ) {
      setErro(
        "Informe um ano do modelo válido."
      );

      return;
    }

    if (
      anoFabricacao &&
      anoModelo &&
      anoModelo < anoFabricacao
    ) {
      setErro(
        "O ano do modelo não pode ser menor que o ano de fabricação."
      );

      return;
    }

    const valoresCapacidade = [
      {
        valor: taraKg,
        mensagem:
          "Informe uma tara válida.",
      },
      {
        valor: capacidadeKg,
        mensagem:
          "Informe uma capacidade em quilogramas válida.",
      },
      {
        valor: capacidadeM3,
        mensagem:
          "Informe uma capacidade em metros cúbicos válida.",
      },
    ];

    for (
      const campo of
      valoresCapacidade
    ) {
      if (
        campo.valor !== null &&
        (!Number.isFinite(
          campo.valor
        ) ||
          campo.valor < 0)
      ) {
        setErro(
          campo.mensagem
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

        placa,

        renavam,

        ufLicenciamento,

        tipo: form.tipo,

        marcaModelo:
          form.marcaModelo.trim(),

        anoFabricacao,

        anoModelo,

        taraKg,

        capacidadeKg,

        capacidadeM3,
      };

      const resultado =
        veiculo
          ? await updateVeiculo({
              id: veiculo.id,

              ...dados,

              ativo:
                form.ativo,
            })
          : await createVeiculo(
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
        "Erro ao salvar veículo:",
        error
      );

      setErro(
        "Não foi possível salvar o veículo. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

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

            Novo veículo
          </>
        )}
      </DialogTrigger>

      <FormStepperDialogContent>
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>
            {editando
              ? "Editar veículo"
              : "Novo veículo"}
          </DialogTitle>

          <DialogDescription>
            Informe os dados de
            identificação, capacidade e
            vínculo do veículo.
          </DialogDescription>
        </DialogHeader>

        <FormStepperNav
          passos={[...PASSOS_VEICULO]}
          passoAtual={passoAtual}
        />

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <FormStepperBody>
            {passoAtual === 0 && (
            <div className="grid gap-5 md:grid-cols-2">
              <CampoTexto
                id="placaVeiculo"
                label="Placa"
                placeholder="ABC-1D23"
                value={form.placa}
                onChange={(valor) =>
                  atualizarCampo(
                    "placa",
                    formatarPlaca(
                      valor
                    )
                  )
                }
                disabled={carregando}
                required
                ajuda="Aceita placa Mercosul ou modelo antigo."
              />

              <CampoTexto
                id="renavamVeiculo"
                label="RENAVAM"
                placeholder="00000000000"
                inputMode="numeric"
                value={form.renavam}
                onChange={(valor) =>
                  atualizarCampo(
                    "renavam",
                    somenteNumeros(
                      valor
                    ).slice(0, 11)
                  )
                }
                disabled={carregando}
                ajuda="Informe os 11 números do RENAVAM."
              />

              <CampoSelect
                id="tipoVeiculo"
                label="Tipo do veículo"
                value={form.tipo}
                onChange={(valor) =>
                  atualizarCampo(
                    "tipo",
                    valor as TipoVeiculo
                  )
                }
                disabled={carregando}
              >
                {tiposVeiculo.map(
                  (tipo) => (
                    <option
                      key={tipo.value}
                      value={tipo.value}
                    >
                      {tipo.label}
                    </option>
                  )
                )}
              </CampoSelect>

              <CampoTexto
                id="ufLicenciamentoVeiculo"
                label="UF de licenciamento"
                placeholder="RO"
                value={
                  form.ufLicenciamento
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "ufLicenciamento",
                    valor
                      .replace(
                        /[^a-zA-Z]/g,
                        ""
                      )
                      .slice(0, 2)
                      .toUpperCase()
                  )
                }
                disabled={carregando}
              />

              <div className="md:col-span-2">
                <CampoTexto
                  id="marcaModeloVeiculo"
                  label="Marca e modelo"
                  placeholder="Ex.: Volvo FH 540"
                  value={
                    form.marcaModelo
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "marcaModelo",
                      valor
                    )
                  }
                  disabled={carregando}
                />
              </div>

              <CampoTexto
                id="anoFabricacaoVeiculo"
                label="Ano de fabricação"
                placeholder="2024"
                inputMode="numeric"
                value={
                  form.anoFabricacao
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "anoFabricacao",
                    somenteNumeros(
                      valor
                    ).slice(0, 4)
                  )
                }
                disabled={carregando}
              />

              <CampoTexto
                id="anoModeloVeiculo"
                label="Ano do modelo"
                placeholder="2025"
                inputMode="numeric"
                value={
                  form.anoModelo
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "anoModelo",
                    somenteNumeros(
                      valor
                    ).slice(0, 4)
                  )
                }
                disabled={carregando}
              />
            </div>
            )}

            {passoAtual === 1 && (
            <div className="grid gap-5 md:grid-cols-3">
              <CampoDecimal
                id="taraVeiculo"
                label="Tara"
                unidade="kg"
                placeholder="0,00"
                value={form.taraKg}
                onChange={(valor) =>
                  atualizarCampo(
                    "taraKg",
                    valor
                  )
                }
                disabled={carregando}
              />

              <CampoDecimal
                id="capacidadeKgVeiculo"
                label="Capacidade de carga"
                unidade="kg"
                placeholder="0,00"
                value={
                  form.capacidadeKg
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "capacidadeKg",
                    valor
                  )
                }
                disabled={carregando}
              />

              <CampoDecimal
                id="capacidadeM3Veiculo"
                label="Capacidade volumétrica"
                unidade="m³"
                placeholder="0,00"
                value={
                  form.capacidadeM3
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "capacidadeM3",
                    valor
                  )
                }
                disabled={carregando}
              />
            </div>
            )}

            {passoAtual === 2 && (
            <>
            <CampoSelect
              id="transportadorVeiculo"
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
                está disponível. O veículo
                poderá ser cadastrado sem
                vínculo.
              </p>
            )}

          {editando && (
            <section className="mt-5 rounded-xl border bg-muted/10 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Gauge size={20} />
                </div>

                <label className="flex flex-1 cursor-pointer items-start justify-between gap-4">
                  <span>
                    <span className="block font-semibold">
                      Veículo ativo
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      Veículos inativos
                      permanecem no
                      histórico, mas não
                      ficam disponíveis em
                      novas operações.
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

            {passoAtual > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={
                  handlePassoAnterior
                }
                disabled={carregando}
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
                disabled={carregando}
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-11 sm:min-w-48"
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
                      : "Cadastrar veículo"}
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
    | "decimal";

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

type CampoDecimalProps = {
  id: string;
  label: string;
  unidade: string;
  placeholder?: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
};

function CampoDecimal({
  id,
  label,
  unidade,
  placeholder,
  value,
  onChange,
  disabled = false,
}: CampoDecimalProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          className="h-11 pr-12"
          placeholder={placeholder}
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          disabled={disabled}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unidade}
        </span>
      </div>
    </div>
  );
}
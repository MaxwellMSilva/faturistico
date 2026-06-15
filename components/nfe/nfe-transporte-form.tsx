"use client";

import {
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Boxes,
  CarFront,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  Save,
  Scale,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { updateTransporteNfe } from "@/actions/nfe/update-transporte-nfe";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ModalidadeFrete =
  | "POR_CONTA_EMITENTE"
  | "POR_CONTA_DESTINATARIO"
  | "POR_CONTA_TERCEIROS"
  | "TRANSPORTE_PROPRIO_EMITENTE"
  | "TRANSPORTE_PROPRIO_DESTINATARIO"
  | "SEM_TRANSPORTE";

type Transporte = {
  id: string;

  modalidadeFrete:
    ModalidadeFrete;

  transportadorId:
    | string
    | null;

  veiculoId:
    | string
    | null;

  motoristaId:
    | string
    | null;

  quantidadeVolumes:
    | number
    | null;

  especieVolumes:
    | string
    | null;

  marcaVolumes:
    | string
    | null;

  numeracaoVolumes:
    | string
    | null;

  pesoLiquido:
    | number
    | null;

  pesoBruto:
    | number
    | null;
};

type Transportador = {
  id: string;

  nome: string;
  nomeFantasia: string | null;

  cpfCnpj: string;
  rntrc: string | null;

  ativo: boolean;
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

  tipo: string;
  marcaModelo: string | null;

  ativo: boolean;
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

  ativo: boolean;
};

type Props = {
  empresaId: string;
  notaFiscalId: string;

  podeEditar: boolean;

  transporte:
    | Transporte
    | null;

  transportadores:
    Transportador[];

  veiculos: Veiculo[];

  motoristas: Motorista[];
};

const modalidadesFrete: Array<{
  value: ModalidadeFrete;
  codigo: string;
  label: string;
}> = [
  {
    value: "POR_CONTA_EMITENTE",
    codigo: "0",
    label:
      "Contratação do frete por conta do emitente",
  },
  {
    value:
      "POR_CONTA_DESTINATARIO",
    codigo: "1",
    label:
      "Contratação do frete por conta do destinatário",
  },
  {
    value: "POR_CONTA_TERCEIROS",
    codigo: "2",
    label:
      "Contratação do frete por conta de terceiros",
  },
  {
    value:
      "TRANSPORTE_PROPRIO_EMITENTE",
    codigo: "3",
    label:
      "Transporte próprio por conta do emitente",
  },
  {
    value:
      "TRANSPORTE_PROPRIO_DESTINATARIO",
    codigo: "4",
    label:
      "Transporte próprio por conta do destinatário",
  },
  {
    value: "SEM_TRANSPORTE",
    codigo: "9",
    label: "Sem ocorrência de transporte",
  },
];

function somenteNumeros(
  valor?: string | null
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function formatarDocumento(
  documento: string
) {
  const numeros =
    somenteNumeros(documento);

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
  }

  if (numeros.length === 14) {
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  return documento;
}

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

export function NfeTransporteForm({
  empresaId,
  notaFiscalId,
  podeEditar,
  transporte,
  transportadores,
  veiculos,
  motoristas,
}: Props) {
  const router = useRouter();

  function criarEstadoInicial() {
    return {
      modalidadeFrete:
        transporte
          ?.modalidadeFrete ??
        ("SEM_TRANSPORTE" as ModalidadeFrete),

      transportadorId:
        transporte
          ?.transportadorId ?? "",

      veiculoId:
        transporte?.veiculoId ??
        "",

      motoristaId:
        transporte?.motoristaId ??
        "",

      quantidadeVolumes:
        transporte
          ?.quantidadeVolumes ===
          null ||
        transporte
          ?.quantidadeVolumes ===
          undefined
          ? ""
          : String(
              transporte
                .quantidadeVolumes
            ),

      especieVolumes:
        transporte
          ?.especieVolumes ?? "",

      marcaVolumes:
        transporte
          ?.marcaVolumes ?? "",

      numeracaoVolumes:
        transporte
          ?.numeracaoVolumes ?? "",

      pesoLiquido:
        valorParaCampo(
          transporte?.pesoLiquido
        ),

      pesoBruto:
        valorParaCampo(
          transporte?.pesoBruto
        ),
    };
  }

  type FormTransporte =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [form, setForm] =
    useState<FormTransporte>(
      criarEstadoInicial
    );

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const bloqueado =
    carregando ||
    !podeEditar;

  const semTransporte =
    form.modalidadeFrete ===
    "SEM_TRANSPORTE";

  const transportadoresDisponiveis =
    transportadores.filter(
      (transportador) =>
        transportador.ativo ||
        transportador.id ===
          form.transportadorId
    );

  const veiculosDisponiveis =
    veiculos.filter((veiculo) => {
      const disponivel =
        veiculo.ativo ||
        veiculo.id ===
          form.veiculoId;

      const compativel =
        !form.transportadorId ||
        !veiculo.transportadorId ||
        veiculo.transportadorId ===
          form.transportadorId;

      return (
        disponivel &&
        compativel
      );
    });

  const motoristasDisponiveis =
    motoristas.filter(
      (motorista) => {
        const disponivel =
          motorista.ativo ||
          motorista.id ===
            form.motoristaId;

        const compativel =
          !form.transportadorId ||
          !motorista.transportadorId ||
          motorista.transportadorId ===
            form.transportadorId;

        return (
          disponivel &&
          compativel
        );
      }
    );

  function limparMensagens() {
    setErro("");
    setMensagem("");
  }

  function atualizarCampo<
    Campo extends keyof FormTransporte,
  >(
    campo: Campo,
    valor: FormTransporte[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    limparMensagens();
  }

  function selecionarTransportador(
    transportadorId: string
  ) {
    setForm((anterior) => {
      const veiculoAtual =
        veiculos.find(
          (veiculo) =>
            veiculo.id ===
            anterior.veiculoId
        );

      const motoristaAtual =
        motoristas.find(
          (motorista) =>
            motorista.id ===
            anterior.motoristaId
        );

      const limparVeiculo =
        Boolean(
          transportadorId &&
            veiculoAtual
              ?.transportadorId &&
            veiculoAtual
              .transportadorId !==
              transportadorId
        );

      const limparMotorista =
        Boolean(
          transportadorId &&
            motoristaAtual
              ?.transportadorId &&
            motoristaAtual
              .transportadorId !==
              transportadorId
        );

      return {
        ...anterior,

        transportadorId,

        veiculoId:
          limparVeiculo
            ? ""
            : anterior.veiculoId,

        motoristaId:
          limparMotorista
            ? ""
            : anterior.motoristaId,
      };
    });

    limparMensagens();
  }

  function selecionarVeiculo(
    veiculoId: string
  ) {
    const veiculo =
      veiculos.find(
        (item) =>
          item.id === veiculoId
      );

    setForm((anterior) => {
      const novoTransportadorId =
        veiculo
          ?.transportadorId ||
        anterior.transportadorId;

      const motoristaAtual =
        motoristas.find(
          (motorista) =>
            motorista.id ===
            anterior.motoristaId
        );

      const motoristaIncompativel =
        Boolean(
          novoTransportadorId &&
            motoristaAtual
              ?.transportadorId &&
            motoristaAtual
              .transportadorId !==
              novoTransportadorId
        );

      return {
        ...anterior,

        veiculoId,

        transportadorId:
          novoTransportadorId,

        motoristaId:
          motoristaIncompativel
            ? ""
            : anterior.motoristaId,
      };
    });

    limparMensagens();
  }

  function selecionarMotorista(
    motoristaId: string
  ) {
    const motorista =
      motoristas.find(
        (item) =>
          item.id ===
          motoristaId
      );

    setForm((anterior) => {
      const novoTransportadorId =
        motorista
          ?.transportadorId ||
        anterior.transportadorId;

      const veiculoAtual =
        veiculos.find(
          (veiculo) =>
            veiculo.id ===
            anterior.veiculoId
        );

      const veiculoIncompativel =
        Boolean(
          novoTransportadorId &&
            veiculoAtual
              ?.transportadorId &&
            veiculoAtual
              .transportadorId !==
              novoTransportadorId
        );

      return {
        ...anterior,

        motoristaId,

        transportadorId:
          novoTransportadorId,

        veiculoId:
          veiculoIncompativel
            ? ""
            : anterior.veiculoId,
      };
    });

    limparMensagens();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

    if (!podeEditar) {
      setErro(
        "Esta NF-e não pode mais ter o transporte alterado."
      );

      return;
    }

    const quantidadeVolumes =
      converterInteiro(
        form.quantidadeVolumes
      );

    const pesoLiquido =
      converterDecimal(
        form.pesoLiquido
      );

    const pesoBruto =
      converterDecimal(
        form.pesoBruto
      );

    if (
      quantidadeVolumes !== null &&
      (
        !Number.isInteger(
          quantidadeVolumes
        ) ||
        quantidadeVolumes < 0
      )
    ) {
      setErro(
        "Informe uma quantidade de volumes válida."
      );

      return;
    }

    if (
      pesoLiquido !== null &&
      (
        !Number.isFinite(
          pesoLiquido
        ) ||
        pesoLiquido < 0
      )
    ) {
      setErro(
        "Informe um peso líquido válido."
      );

      return;
    }

    if (
      pesoBruto !== null &&
      (
        !Number.isFinite(
          pesoBruto
        ) ||
        pesoBruto < 0
      )
    ) {
      setErro(
        "Informe um peso bruto válido."
      );

      return;
    }

    if (
      pesoLiquido !== null &&
      pesoBruto !== null &&
      pesoLiquido > pesoBruto
    ) {
      setErro(
        "O peso líquido não pode ser maior que o peso bruto."
      );

      return;
    }

    const veiculoSelecionado =
      veiculos.find(
        (veiculo) =>
          veiculo.id ===
          form.veiculoId
      );

    const motoristaSelecionado =
      motoristas.find(
        (motorista) =>
          motorista.id ===
          form.motoristaId
      );

    if (
      form.transportadorId &&
      veiculoSelecionado
        ?.transportadorId &&
      veiculoSelecionado
        .transportadorId !==
        form.transportadorId
    ) {
      setErro(
        "O veículo selecionado pertence a outro transportador."
      );

      return;
    }

    if (
      form.transportadorId &&
      motoristaSelecionado
        ?.transportadorId &&
      motoristaSelecionado
        .transportadorId !==
        form.transportadorId
    ) {
      setErro(
        "O motorista selecionado pertence a outro transportador."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await updateTransporteNfe({
          empresaId,
          notaFiscalId,

          modalidadeFrete:
            form.modalidadeFrete,

          transportadorId:
            semTransporte
              ? null
              : form.transportadorId ||
                null,

          veiculoId:
            semTransporte
              ? null
              : form.veiculoId ||
                null,

          motoristaId:
            semTransporte
              ? null
              : form.motoristaId ||
                null,

          quantidadeVolumes:
            semTransporte
              ? null
              : quantidadeVolumes,

          especieVolumes:
            semTransporte
              ? ""
              : form.especieVolumes,

          marcaVolumes:
            semTransporte
              ? ""
              : form.marcaVolumes,

          numeracaoVolumes:
            semTransporte
              ? ""
              : form.numeracaoVolumes,

          pesoLiquido:
            semTransporte
              ? null
              : pesoLiquido,

          pesoBruto:
            semTransporte
              ? null
              : pesoBruto,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      if (semTransporte) {
        setForm((anterior) => ({
          ...anterior,

          transportadorId: "",
          veiculoId: "",
          motoristaId: "",

          quantidadeVolumes: "",
          especieVolumes: "",
          marcaVolumes: "",
          numeracaoVolumes: "",

          pesoLiquido: "",
          pesoBruto: "",
        }));
      }

      setMensagem(
        "Dados de transporte salvos com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar transporte da NF-e:",
        error
      );

      setErro(
        "Não foi possível salvar os dados de transporte. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Truck size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Transporte
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Informe a modalidade do
              frete, o transportador, o
              veículo, o motorista e os
              volumes da NF-e.
            </p>
          </div>
        </div>

        {!podeEditar && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <LockKeyhole size={13} />

            Somente leitura
          </span>
        )}
      </div>

      <div className="space-y-5">
        <SecaoFormulario
          icone={Truck}
          titulo="Modalidade do frete"
          descricao="Selecione quem será responsável pela contratação ou execução do transporte."
        >
          <CampoSelect
            id={`modalidade-frete-${notaFiscalId}`}
            label="Modalidade"
            value={
              form.modalidadeFrete
            }
            onChange={(valor) =>
              atualizarCampo(
                "modalidadeFrete",
                valor as ModalidadeFrete
              )
            }
            disabled={bloqueado}
          >
            {modalidadesFrete.map(
              (modalidade) => (
                <option
                  key={
                    modalidade.value
                  }
                  value={
                    modalidade.value
                  }
                >
                  {modalidade.codigo} —{" "}
                  {modalidade.label}
                </option>
              )
            )}
          </CampoSelect>
        </SecaoFormulario>

        {semTransporte ? (
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
            <PackageCheck
              size={20}
              className="mt-0.5 shrink-0 text-primary"
            />

            <div>
              <p className="text-sm font-medium">
                Sem ocorrência de transporte
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Ao salvar, transportador,
                veículo, motorista, volumes
                e pesos serão removidos do
                transporte desta NF-e.
              </p>
            </div>
          </div>
        ) : (
          <>
            <SecaoFormulario
              icone={CarFront}
              titulo="Responsáveis e veículo"
              descricao="Os campos são opcionais e utilizam os cadastros da empresa."
            >
              <div className="grid gap-5 lg:grid-cols-3">
                <CampoSelect
                  id={`transportador-${notaFiscalId}`}
                  label="Transportador"
                  value={
                    form.transportadorId
                  }
                  onChange={
                    selecionarTransportador
                  }
                  disabled={bloqueado}
                >
                  <option value="">
                    Sem transportador selecionado
                  </option>

                  {transportadoresDisponiveis.map(
                    (transportador) => (
                      <option
                        key={
                          transportador.id
                        }
                        value={
                          transportador.id
                        }
                      >
                        {transportador.nome} —{" "}
                        {formatarDocumento(
                          transportador.cpfCnpj
                        )}
                        {!transportador.ativo
                          ? " — Inativo"
                          : ""}
                      </option>
                    )
                  )}
                </CampoSelect>

                <CampoSelect
                  id={`veiculo-${notaFiscalId}`}
                  label="Veículo"
                  value={
                    form.veiculoId
                  }
                  onChange={
                    selecionarVeiculo
                  }
                  disabled={bloqueado}
                >
                  <option value="">
                    Sem veículo selecionado
                  </option>

                  {veiculosDisponiveis.map(
                    (veiculo) => (
                      <option
                        key={veiculo.id}
                        value={veiculo.id}
                      >
                        {formatarPlaca(
                          veiculo.placa
                        )}
                        {veiculo.marcaModelo
                          ? ` — ${veiculo.marcaModelo}`
                          : ""}
                        {!veiculo.ativo
                          ? " — Inativo"
                          : ""}
                      </option>
                    )
                  )}
                </CampoSelect>

                <CampoSelect
                  id={`motorista-${notaFiscalId}`}
                  label="Motorista"
                  value={
                    form.motoristaId
                  }
                  onChange={
                    selecionarMotorista
                  }
                  disabled={bloqueado}
                >
                  <option value="">
                    Sem motorista selecionado
                  </option>

                  {motoristasDisponiveis.map(
                    (motorista) => (
                      <option
                        key={
                          motorista.id
                        }
                        value={
                          motorista.id
                        }
                      >
                        {motorista.nome}
                        {motorista.categoriaCnh
                          ? ` — CNH ${motorista.categoriaCnh}`
                          : ""}
                        {!motorista.ativo
                          ? " — Inativo"
                          : ""}
                      </option>
                    )
                  )}
                </CampoSelect>
              </div>
            </SecaoFormulario>

            <SecaoFormulario
              icone={Boxes}
              titulo="Volumes"
              descricao="Informe a quantidade, espécie, marca e numeração dos volumes transportados."
            >
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <CampoTexto
                  id={`quantidade-volumes-${notaFiscalId}`}
                  label="Quantidade"
                  placeholder="0"
                  inputMode="numeric"
                  value={
                    form.quantidadeVolumes
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "quantidadeVolumes",
                      somenteNumeros(
                        valor
                      )
                    )
                  }
                  disabled={bloqueado}
                />

                <CampoTexto
                  id={`especie-volumes-${notaFiscalId}`}
                  label="Espécie"
                  placeholder="Ex.: caixas"
                  value={
                    form.especieVolumes
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "especieVolumes",
                      valor
                    )
                  }
                  disabled={bloqueado}
                />

                <CampoTexto
                  id={`marca-volumes-${notaFiscalId}`}
                  label="Marca"
                  placeholder="Marca dos volumes"
                  value={
                    form.marcaVolumes
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "marcaVolumes",
                      valor
                    )
                  }
                  disabled={bloqueado}
                />

                <CampoTexto
                  id={`numeracao-volumes-${notaFiscalId}`}
                  label="Numeração"
                  placeholder="Numeração dos volumes"
                  value={
                    form.numeracaoVolumes
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "numeracaoVolumes",
                      valor
                    )
                  }
                  disabled={bloqueado}
                />
              </div>
            </SecaoFormulario>

            <SecaoFormulario
              icone={Scale}
              titulo="Pesos"
              descricao="Informe os pesos totais dos volumes em quilogramas."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <CampoDecimal
                  id={`peso-liquido-${notaFiscalId}`}
                  label="Peso líquido"
                  value={
                    form.pesoLiquido
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "pesoLiquido",
                      valor
                    )
                  }
                  disabled={bloqueado}
                />

                <CampoDecimal
                  id={`peso-bruto-${notaFiscalId}`}
                  label="Peso bruto"
                  value={
                    form.pesoBruto
                  }
                  onChange={(valor) =>
                    atualizarCampo(
                      "pesoBruto",
                      valor
                    )
                  }
                  disabled={bloqueado}
                />
              </div>
            </SecaoFormulario>
          </>
        )}
      </div>

      <div
        aria-live="polite"
        className="mt-5 space-y-3"
      >
        {mensagem && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <PackageCheck
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{mensagem}</p>
          </div>
        )}

        {erro && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>{erro}</p>
          </div>
        )}
      </div>

      {podeEditar && (
        <div className="mt-6 flex justify-end border-t pt-5">
          <Button
            type="submit"
            className="h-11 min-w-48"
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

                Salvar transporte
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

type SecaoFormularioProps = {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  children: ReactNode;
};

function SecaoFormulario({
  icone: Icone,
  titulo,
  descricao,
  children,
}: SecaoFormularioProps) {
  return (
    <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icone size={19} />
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
};

function CampoTexto({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode = "text",
  disabled = false,
}: CampoTextoProps) {
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
      />
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
  children: ReactNode;
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
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
};

function CampoDecimal({
  id,
  label,
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
          placeholder="0,000"
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
          kg
        </span>
      </div>
    </div>
  );
}
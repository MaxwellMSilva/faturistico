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
  Check,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
  Save,
  Scale,
  Search,
  Truck,
  UserRound,
  X,
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
  sigla: string;
  titulo: string;
  descricao: string;
}> = [
  {
    value: "POR_CONTA_EMITENTE",
    codigo: "0",
    sigla: "CIF",
    titulo: "Por conta do emitente",
    descricao:
      "O emitente contrata e assume o frete.",
  },
  {
    value:
      "POR_CONTA_DESTINATARIO",
    codigo: "1",
    sigla: "FOB",
    titulo: "Por conta do destinatário",
    descricao:
      "O destinatário contrata e assume o frete.",
  },
  {
    value: "POR_CONTA_TERCEIROS",
    codigo: "2",
    sigla: "TERCEIROS",
    titulo: "Por conta de terceiros",
    descricao:
      "O transporte é contratado por outra pessoa ou empresa.",
  },
  {
    value:
      "TRANSPORTE_PROPRIO_EMITENTE",
    codigo: "3",
    sigla: "PRÓPRIO",
    titulo: "Transporte próprio do emitente",
    descricao:
      "O emitente realiza o transporte com veículo próprio.",
  },
  {
    value:
      "TRANSPORTE_PROPRIO_DESTINATARIO",
    codigo: "4",
    sigla: "PRÓPRIO",
    titulo:
      "Transporte próprio do destinatário",
    descricao:
      "O destinatário realiza o transporte com veículo próprio.",
  },
  {
    value: "SEM_TRANSPORTE",
    codigo: "9",
    sigla: "SEM FRETE",
    titulo: "Sem ocorrência de transporte",
    descricao:
      "A operação não possui transporte.",
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

function normalizarPesquisa(
  valor: string
) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obterRotuloTransportador(
  transportador: Transportador
) {
  return `${transportador.nome} — ${formatarDocumento(
    transportador.cpfCnpj
  )}`;
}

function obterRotuloVeiculo(
  veiculo: Veiculo
) {
  return [
    formatarPlaca(veiculo.placa),
    veiculo.marcaModelo,
  ]
    .filter(Boolean)
    .join(" — ");
}

function obterRotuloMotorista(
  motorista: Motorista
) {
  return [
    motorista.nome,
    motorista.categoriaCnh
      ? `CNH ${motorista.categoriaCnh}`
      : null,
  ]
    .filter(Boolean)
    .join(" — ");
}

function valorParaCampo(
  valor?: number | null
) {
  if (
    valor === null ||
    valor === undefined ||
    !Number.isFinite(valor)
  ) {
    return "";
  }

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }
  ).format(valor);
}

function formatarPeso(
  valor: string
) {
  const numeros =
    somenteNumeros(valor).slice(
      0,
      15
    );

  if (!numeros) {
    return "";
  }

  const valorNumerico =
    Number(numeros) / 1000;

  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }
  ).format(valorNumerico);
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
    buscaTransportador,
    setBuscaTransportador,
  ] = useState(() => {
    const selecionado =
      transportadores.find(
        (transportador) =>
          transportador.id ===
          transporte?.transportadorId
      );

    return selecionado
      ? obterRotuloTransportador(
          selecionado
        )
      : "";
  });

  const [
    buscaVeiculo,
    setBuscaVeiculo,
  ] = useState(() => {
    const selecionado =
      veiculos.find(
        (veiculo) =>
          veiculo.id ===
          transporte?.veiculoId
      );

    return selecionado
      ? obterRotuloVeiculo(
          selecionado
        )
      : "";
  });

  const [
    buscaMotorista,
    setBuscaMotorista,
  ] = useState(() => {
    const selecionado =
      motoristas.find(
        (motorista) =>
          motorista.id ===
          transporte?.motoristaId
      );

    return selecionado
      ? obterRotuloMotorista(
          selecionado
        )
      : "";
  });

  const [
    listaTransportadoresAberta,
    setListaTransportadoresAberta,
  ] = useState(false);

  const [
    listaVeiculosAberta,
    setListaVeiculosAberta,
  ] = useState(false);

  const [
    listaMotoristasAberta,
    setListaMotoristasAberta,
  ] = useState(false);

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

  const modalidadeSelecionada =
    modalidadesFrete.find(
      (modalidade) =>
        modalidade.value ===
        form.modalidadeFrete
    );

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

  const termoTransportador =
    normalizarPesquisa(
      buscaTransportador
    );

  const termoVeiculo =
    normalizarPesquisa(
      buscaVeiculo
    );

  const termoMotorista =
    normalizarPesquisa(
      buscaMotorista
    );

  const transportadoresFiltrados =
    termoTransportador.length >= 3
      ? transportadoresDisponiveis
          .filter(
            (transportador) => {
              const nome =
                normalizarPesquisa(
                  transportador.nome
                );

              const fantasia =
                normalizarPesquisa(
                  transportador
                    .nomeFantasia ?? ""
                );

              const documento =
                somenteNumeros(
                  transportador.cpfCnpj
                );

              const rntrc =
                somenteNumeros(
                  transportador.rntrc
                );

              const termoNumerico =
                somenteNumeros(
                  termoTransportador
                );

              return (
                nome.includes(
                  termoTransportador
                ) ||
                fantasia.includes(
                  termoTransportador
                ) ||
                documento.includes(
                  termoTransportador
                ) ||
                rntrc.includes(
                  termoTransportador
                ) ||
                Boolean(
                  termoNumerico &&
                    (
                      documento.includes(
                        termoNumerico
                      ) ||
                      rntrc.includes(
                        termoNumerico
                      )
                    )
                )
              );
            }
          )
          .slice(0, 8)
      : [];

  const veiculosFiltrados =
    termoVeiculo.length >= 3
      ? veiculosDisponiveis
          .filter((veiculo) => {
            const placa =
              normalizarPesquisa(
                formatarPlaca(
                  veiculo.placa
                )
              );

            const placaNumerica =
              somenteNumeros(
                veiculo.placa
              );

            const marcaModelo =
              normalizarPesquisa(
                veiculo.marcaModelo ??
                  ""
              );

            const renavam =
              somenteNumeros(
                veiculo.renavam
              );

            const uf =
              normalizarPesquisa(
                veiculo
                  .ufLicenciamento ??
                  ""
              );

            const tipo =
              normalizarPesquisa(
                veiculo.tipo
              );

            const termoNumerico =
              somenteNumeros(
                termoVeiculo
              );

            return (
              placa.includes(
                termoVeiculo
              ) ||
              marcaModelo.includes(
                termoVeiculo
              ) ||
              uf.includes(
                termoVeiculo
              ) ||
              tipo.includes(
                termoVeiculo
              ) ||
              placaNumerica.includes(
                termoVeiculo
              ) ||
              renavam.includes(
                termoVeiculo
              ) ||
              Boolean(
                termoNumerico &&
                  (
                    placaNumerica.includes(
                      termoNumerico
                    ) ||
                    renavam.includes(
                      termoNumerico
                    )
                  )
              )
            );
          })
          .slice(0, 8)
      : [];

  const motoristasFiltrados =
    termoMotorista.length >= 3
      ? motoristasDisponiveis
          .filter((motorista) => {
            const nome =
              normalizarPesquisa(
                motorista.nome
              );

            const cpf =
              somenteNumeros(
                motorista.cpf
              );

            const cnh =
              somenteNumeros(
                motorista.numeroCnh
              );

            const categoria =
              normalizarPesquisa(
                motorista
                  .categoriaCnh ?? ""
              );

            const termoNumerico =
              somenteNumeros(
                termoMotorista
              );

            return (
              nome.includes(
                termoMotorista
              ) ||
              categoria.includes(
                termoMotorista
              ) ||
              cpf.includes(
                termoMotorista
              ) ||
              cnh.includes(
                termoMotorista
              ) ||
              Boolean(
                termoNumerico &&
                  (
                    cpf.includes(
                      termoNumerico
                    ) ||
                    cnh.includes(
                      termoNumerico
                    )
                  )
              )
            );
          })
          .slice(0, 8)
      : [];

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
    const transportador =
      transportadores.find(
        (item) =>
          item.id ===
          transportadorId
      );

    const veiculoAtual =
      veiculos.find(
        (veiculo) =>
          veiculo.id ===
          form.veiculoId
      );

    const motoristaAtual =
      motoristas.find(
        (motorista) =>
          motorista.id ===
          form.motoristaId
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

    setForm((anterior) => ({
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
    }));

    setBuscaTransportador(
      transportador
        ? obterRotuloTransportador(
            transportador
          )
        : ""
    );

    if (limparVeiculo) {
      setBuscaVeiculo("");
    }

    if (limparMotorista) {
      setBuscaMotorista("");
    }

    setListaTransportadoresAberta(
      false
    );

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

    const novoTransportadorId =
      veiculo
        ?.transportadorId ||
      form.transportadorId;

    const transportador =
      transportadores.find(
        (item) =>
          item.id ===
          novoTransportadorId
      );

    const motoristaAtual =
      motoristas.find(
        (motorista) =>
          motorista.id ===
          form.motoristaId
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

    setForm((anterior) => ({
      ...anterior,

      veiculoId,

      transportadorId:
        novoTransportadorId,

      motoristaId:
        motoristaIncompativel
          ? ""
          : anterior.motoristaId,
    }));

    setBuscaVeiculo(
      veiculo
        ? obterRotuloVeiculo(
            veiculo
          )
        : ""
    );

    if (transportador) {
      setBuscaTransportador(
        obterRotuloTransportador(
          transportador
        )
      );
    }

    if (motoristaIncompativel) {
      setBuscaMotorista("");
    }

    setListaVeiculosAberta(
      false
    );

    limparMensagens();
  }

  function selecionarMotorista(
    motoristaId: string
  ) {
    const motorista =
      motoristas.find(
        (item) =>
          item.id === motoristaId
      );

    const novoTransportadorId =
      motorista
        ?.transportadorId ||
      form.transportadorId;

    const transportador =
      transportadores.find(
        (item) =>
          item.id ===
          novoTransportadorId
      );

    const veiculoAtual =
      veiculos.find(
        (veiculo) =>
          veiculo.id ===
          form.veiculoId
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

    setForm((anterior) => ({
      ...anterior,

      motoristaId,

      transportadorId:
        novoTransportadorId,

      veiculoId:
        veiculoIncompativel
          ? ""
          : anterior.veiculoId,
    }));

    setBuscaMotorista(
      motorista
        ? obterRotuloMotorista(
            motorista
          )
        : ""
    );

    if (transportador) {
      setBuscaTransportador(
        obterRotuloTransportador(
          transportador
        )
      );
    }

    if (veiculoIncompativel) {
      setBuscaVeiculo("");
    }

    setListaMotoristasAberta(
      false
    );

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

        setBuscaTransportador("");
        setBuscaVeiculo("");
        setBuscaMotorista("");

        setListaTransportadoresAberta(
          false
        );

        setListaVeiculosAberta(
          false
        );

        setListaMotoristasAberta(
          false
        );
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
                  {modalidade.sigla} —{" "}
                  {modalidade.codigo} ·{" "}
                  {modalidade.titulo}
                </option>
              )
            )}
          </CampoSelect>

          {modalidadeSelecionada && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
              <span className="shrink-0 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] font-bold tracking-wide text-primary">
                {
                  modalidadeSelecionada.sigla
                }
              </span>

              <div>
                <p className="text-sm font-medium">
                  {
                    modalidadeSelecionada.titulo
                  }
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {
                    modalidadeSelecionada.descricao
                  }
                </p>
              </div>
            </div>
          )}
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
                <CampoPesquisa
                  id={`transportador-${notaFiscalId}`}
                  label="Transportador"
                  placeholder="Nome, CPF/CNPJ ou RNTRC..."
                  value={
                    buscaTransportador
                  }
                  selecionadoId={
                    form.transportadorId
                  }
                  aberto={
                    listaTransportadoresAberta
                  }
                  setAberto={
                    setListaTransportadoresAberta
                  }
                  resultados={transportadoresFiltrados.map(
                    (transportador) => ({
                      id:
                        transportador.id,

                      titulo:
                        transportador.nome,

                      detalhes: [
                        formatarDocumento(
                          transportador.cpfCnpj
                        ),

                        transportador.rntrc
                          ? `RNTRC ${transportador.rntrc}`
                          : "",

                        !transportador.ativo
                          ? "Inativo"
                          : "",
                      ].filter(Boolean),
                    })
                  )}
                  onChange={(valor) => {
                    setBuscaTransportador(
                      valor
                    );

                    setForm(
                      (anterior) => ({
                        ...anterior,
                        transportadorId:
                          "",
                      })
                    );

                    setListaTransportadoresAberta(
                      normalizarPesquisa(
                        valor
                      ).length >= 3
                    );

                    limparMensagens();
                  }}
                  onSelect={
                    selecionarTransportador
                  }
                  onClear={() =>
                    selecionarTransportador(
                      ""
                    )
                  }
                  disabled={bloqueado}
                  ajuda="Digite pelo menos 3 caracteres. Pesquise por nome, CPF/CNPJ ou RNTRC."
                  mensagemVazia="Nenhum transportador encontrado."
                />

                <CampoPesquisa
                  id={`veiculo-${notaFiscalId}`}
                  label="Veículo"
                  placeholder="Placa, modelo ou RENAVAM..."
                  value={buscaVeiculo}
                  selecionadoId={
                    form.veiculoId
                  }
                  aberto={
                    listaVeiculosAberta
                  }
                  setAberto={
                    setListaVeiculosAberta
                  }
                  resultados={veiculosFiltrados.map(
                    (veiculo) => ({
                      id: veiculo.id,

                      titulo:
                        formatarPlaca(
                          veiculo.placa
                        ),

                      detalhes: [
                        veiculo.marcaModelo ??
                          "",

                        veiculo.renavam
                          ? `RENAVAM ${veiculo.renavam}`
                          : "",

                        veiculo.ufLicenciamento
                          ? `UF ${veiculo.ufLicenciamento}`
                          : "",

                        !veiculo.ativo
                          ? "Inativo"
                          : "",
                      ].filter(Boolean),
                    })
                  )}
                  onChange={(valor) => {
                    setBuscaVeiculo(
                      valor
                    );

                    setForm(
                      (anterior) => ({
                        ...anterior,
                        veiculoId: "",
                      })
                    );

                    setListaVeiculosAberta(
                      normalizarPesquisa(
                        valor
                      ).length >= 3
                    );

                    limparMensagens();
                  }}
                  onSelect={
                    selecionarVeiculo
                  }
                  onClear={() =>
                    selecionarVeiculo("")
                  }
                  disabled={bloqueado}
                  ajuda="Digite pelo menos 3 caracteres. Pesquise por placa, modelo ou RENAVAM."
                  mensagemVazia="Nenhum veículo encontrado."
                />

                <CampoPesquisa
                  id={`motorista-${notaFiscalId}`}
                  label="Motorista"
                  placeholder="Nome, CPF ou CNH..."
                  value={buscaMotorista}
                  selecionadoId={
                    form.motoristaId
                  }
                  aberto={
                    listaMotoristasAberta
                  }
                  setAberto={
                    setListaMotoristasAberta
                  }
                  resultados={motoristasFiltrados.map(
                    (motorista) => ({
                      id:
                        motorista.id,

                      titulo:
                        motorista.nome,

                      detalhes: [
                        formatarDocumento(
                          motorista.cpf
                        ),

                        motorista.numeroCnh
                          ? `CNH ${motorista.numeroCnh}`
                          : "",

                        motorista.categoriaCnh
                          ? `Categoria ${motorista.categoriaCnh}`
                          : "",

                        !motorista.ativo
                          ? "Inativo"
                          : "",
                      ].filter(Boolean),
                    })
                  )}
                  onChange={(valor) => {
                    setBuscaMotorista(
                      valor
                    );

                    setForm(
                      (anterior) => ({
                        ...anterior,
                        motoristaId:
                          "",
                      })
                    );

                    setListaMotoristasAberta(
                      normalizarPesquisa(
                        valor
                      ).length >= 3
                    );

                    limparMensagens();
                  }}
                  onSelect={
                    selecionarMotorista
                  }
                  onClear={() =>
                    selecionarMotorista(
                      ""
                    )
                  }
                  disabled={bloqueado}
                  ajuda="Digite pelo menos 3 caracteres. Pesquise por nome, CPF ou CNH."
                  mensagemVazia="Nenhum motorista encontrado."
                />
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
                      ).slice(0, 9)
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
        <div className="mt-6 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Revise a modalidade, os
            responsáveis, os volumes e os
            pesos antes de salvar.
          </p>

          <Button
            type="submit"
            className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-52"
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

type ResultadoPesquisa = {
  id: string;
  titulo: string;
  detalhes: string[];
};

type CampoPesquisaProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  selecionadoId: string;
  aberto: boolean;

  setAberto: (
    aberto: boolean
  ) => void;

  resultados:
    ResultadoPesquisa[];

  onChange: (
    valor: string
  ) => void;

  onSelect: (
    id: string
  ) => void;

  onClear: () => void;

  ajuda: string;
  mensagemVazia: string;

  disabled?: boolean;
};

function CampoPesquisa({
  id,
  label,
  placeholder,
  value,
  selecionadoId,
  aberto,
  setAberto,
  resultados,
  onChange,
  onSelect,
  onClear,
  ajuda,
  mensagemVazia,
  disabled = false,
}: CampoPesquisaProps) {
  const termoValido =
    normalizarPesquisa(
      value
    ).length >= 3;

  const exibirLista =
    aberto &&
    termoValido &&
    !disabled;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={
            exibirLista
          }
          aria-controls={`${id}-lista`}
          autoComplete="off"
          className="h-11 pl-10 pr-10"
          placeholder={placeholder}
          value={value}
          onFocus={() => {
            if (termoValido) {
              setAberto(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(
              () =>
                setAberto(false),
              120
            );
          }}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          disabled={disabled}
        />

        {value && !disabled && (
          <button
            type="button"
            aria-label={`Limpar ${label.toLowerCase()}`}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onMouseDown={(event) =>
              event.preventDefault()
            }
            onClick={onClear}
          >
            <X size={15} />
          </button>
        )}

        {exibirLista && (
          <div
            id={`${id}-lista`}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            {resultados.length > 0 ? (
              resultados.map(
                (resultado) => {
                  const selecionado =
                    resultado.id ===
                    selecionadoId;

                  return (
                    <button
                      key={
                        resultado.id
                      }
                      type="button"
                      role="option"
                      aria-selected={
                        selecionado
                      }
                      className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted focus:bg-muted focus:outline-none"
                      onMouseDown={(
                        event
                      ) =>
                        event.preventDefault()
                      }
                      onClick={() =>
                        onSelect(
                          resultado.id
                        )
                      }
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {
                            resultado.titulo
                          }
                        </span>

                        {resultado
                          .detalhes.length >
                          0 && (
                          <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {resultado.detalhes.map(
                              (
                                detalhe,
                                indice
                              ) => (
                                <span
                                  key={`${resultado.id}-${indice}`}
                                >
                                  {
                                    detalhe
                                  }
                                </span>
                              )
                            )}
                          </span>
                        )}
                      </span>

                      {selecionado && (
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-primary"
                        />
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                {mensagemVazia}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        {ajuda}
      </p>
    </div>
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
          inputMode="numeric"
          value={value}
          onFocus={(event) =>
            event.currentTarget.select()
          }
          onChange={(event) =>
            onChange(
              formatarPeso(
                event.target.value
              )
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
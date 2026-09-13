"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  Calculator,
  FileText,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { salvarCte } from "@/actions/cte/salvar-cte";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  GrupoIcmsCteForm,
  TipoServicoCteForm,
  TomadorServicoCteForm,
  UnidadeMedidaCteForm,
} from "@/lib/cte/form-types";
import { cn } from "@/lib/utils";

type Aba =
  | "identificacao"
  | "tributos"
  | "documentos"
  | "emissao"
  | "observacoes"
  | "reforma";

type Cliente = {
  id: string;
  nome: string;
  cpfCnpj: string;
  municipio: string | null;
  codigoMunicipio: string | null;
  uf: string | null;
};

type Empresa = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  inscricaoEstadual: string | null;
  municipio: string | null;
  codigoMunicipio: string | null;
  uf: string | null;
};

type Natureza = {
  id: string;
  descricao: string;
  cfop: string;
  informacoesComplementaresPadrao:
    | string
    | null;
};

type Configuracao = {
  ambiente: "HOMOLOGACAO" | "PRODUCAO";
  regimeTributario: string;
  serieCte: number;
  rntrc: string | null;
};

type CargaLinha = {
  id: string;
  unidade: UnidadeMedidaCteForm;
  tipoMedida: string;
  quantidade: string;
};

type ComponenteLinha = {
  id: string;
  nome: string;
  valor: string;
};

type Props = {
  empresaId: string;
  empresa: Empresa;
  clientes: Cliente[];
  naturezas: Natureza[];
  configuracao: Configuracao | null;
  proximoNumeroCte: number;
};

const ABAS: Array<{
  id: Aba;
  label: string;
}> = [
  { id: "identificacao", label: "Identificação" },
  { id: "tributos", label: "Comp./Tributos" },
  { id: "documentos", label: "Documentos" },
  { id: "emissao", label: "Emissão" },
  { id: "observacoes", label: "Obs. Cont." },
  { id: "reforma", label: "Reforma Tributária" },
];

const UNIDADES: Array<{
  value: UnidadeMedidaCteForm;
  label: string;
}> = [
  { value: "QUILOGRAMA", label: "Quilograma" },
  { value: "TONELADA", label: "Tonelada" },
  { value: "METRO_CUBICO", label: "Metro cúbico" },
  { value: "UNIDADE", label: "Unidade" },
  { value: "LITRO", label: "Litro" },
  { value: "MMBTU", label: "MMBTU" },
];

function novoId() {
  return `${Date.now()}-${Math.random()}`;
}

function agoraLocal() {
  const agora = new Date();
  const local = new Date(
    agora.getTime() -
      agora.getTimezoneOffset() * 60_000
  );
  return local.toISOString().slice(0, 16);
}

function numeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function paraNumero(
  valor: string
): number | null {
  if (!valor.trim()) return null;

  const numero = Number(
    valor.replace(",", ".")
  );

  return Number.isFinite(numero)
    ? numero
    : null;
}

export function CteEmissaoModal({
  empresaId,
  empresa,
  clientes,
  naturezas,
  configuracao,
  proximoNumeroCte,
}: Props) {
  const router = useRouter();

  const [aba, setAba] =
    useState<Aba>("identificacao");
  const [telaCheia, setTelaCheia] =
    useState(false);
  const [salvando, setSalvando] =
    useState(false);
  const [erro, setErro] = useState("");

  const [dataEmissao] =
    useState(agoraLocal);
  const [numeroCte, setNumeroCte] =
    useState(String(proximoNumeroCte));
  const [numeroCteEditado, setNumeroCteEditado] =
    useState(false);

  const [tipoServico, setTipoServico] =
    useState<TipoServicoCteForm>("NORMAL");
  const [tomador, setTomador] =
    useState<TomadorServicoCteForm>(
      "REMETENTE"
    );

  const [remetenteId, setRemetenteId] =
    useState("");
  const [destinatarioId, setDestinatarioId] =
    useState("");
  const [expedidorId, setExpedidorId] =
    useState("");
  const [recebedorId, setRecebedorId] =
    useState("");
  const [tomadorOutrosId, setTomadorOutrosId] =
    useState("");

  const [naturezaId, setNaturezaId] =
    useState("");
  const [cfop, setCfop] = useState("");
  const [naturezaOperacao, setNaturezaOperacao] =
    useState("");

  const [produtoPredominante, setProdutoPredominante] =
    useState("");
  const [tipoCarga, setTipoCarga] =
    useState("");
  const [valorCarga, setValorCarga] =
    useState("");
  const [valorCargaAverbacao, setValorCargaAverbacao] =
    useState("");

  const [cargas, setCargas] =
    useState<CargaLinha[]>([
      {
        id: novoId(),
        unidade: "QUILOGRAMA",
        tipoMedida: "PESO BRUTO",
        quantidade: "",
      },
    ]);

  const [valorPrestacao, setValorPrestacao] =
    useState("");
  const [valorReceber, setValorReceber] =
    useState("");
  const [componentes, setComponentes] =
    useState<ComponenteLinha[]>([
      {
        id: novoId(),
        nome: "FRETE",
        valor: "",
      },
    ]);

  const [chavesNfe, setChavesNfe] =
    useState<string[]>([""]);

  const [codigoMunicipioEnvio, setCodigoMunicipioEnvio] =
    useState(empresa.codigoMunicipio ?? "");
  const [municipioEnvio, setMunicipioEnvio] =
    useState(empresa.municipio ?? "");
  const [ufEnvio, setUfEnvio] =
    useState(empresa.uf ?? "");

  const [codigoMunicipioInicio, setCodigoMunicipioInicio] =
    useState(empresa.codigoMunicipio ?? "");
  const [municipioInicio, setMunicipioInicio] =
    useState(empresa.municipio ?? "");
  const [ufInicio, setUfInicio] =
    useState(empresa.uf ?? "");

  const [codigoMunicipioFim, setCodigoMunicipioFim] =
    useState("");
  const [municipioFim, setMunicipioFim] =
    useState("");
  const [ufFim, setUfFim] = useState("");

  const grupoInicial: GrupoIcmsCteForm =
    configuracao?.regimeTributario ===
    "SIMPLES_NACIONAL"
      ? "ICMSSN"
      : "ICMS00";

  const [grupoIcms, setGrupoIcms] =
    useState<GrupoIcmsCteForm>(
      grupoInicial
    );
  const [cstIcms, setCstIcms] =
    useState(
      grupoInicial === "ICMSSN"
        ? "90"
        : "00"
    );
  const [baseCalculoIcms, setBaseCalculoIcms] =
    useState("");
  const [percentualReducaoBc, setPercentualReducaoBc] =
    useState("");
  const [aliquotaIcms, setAliquotaIcms] =
    useState("");
  const [valorCreditoIcms, setValorCreditoIcms] =
    useState("");
  const [valorIcms, setValorIcms] =
    useState("");
  const [valorTotalTributos, setValorTotalTributos] =
    useState("");
  const [codigoBeneficioFiscal, setCodigoBeneficioFiscal] =
    useState("");
  const [baseCalculoStRetido, setBaseCalculoStRetido] =
    useState("");
  const [aliquotaStRetido, setAliquotaStRetido] =
    useState("");
  const [valorIcmsStRetido, setValorIcmsStRetido] =
    useState("");

  const [baseCalculoUfFim, setBaseCalculoUfFim] =
    useState("");
  const [percentualFcpUfFim, setPercentualFcpUfFim] =
    useState("");
  const [percentualIcmsUfFim, setPercentualIcmsUfFim] =
    useState("");
  const [percentualIcmsInterestadual, setPercentualIcmsInterestadual] =
    useState("");
  const [valorFcpUfFim, setValorFcpUfFim] =
    useState("");
  const [valorIcmsUfFim, setValorIcmsUfFim] =
    useState("");
  const [valorIcmsUfInicio, setValorIcmsUfInicio] =
    useState("");

  const [informacoesAdicionais, setInformacoesAdicionais] =
    useState("");
  const [informacoesFisco, setInformacoesFisco] =
    useState("");

  const [editarIbsCbs, setEditarIbsCbs] =
    useState(false);
  const [cstIbsCbs, setCstIbsCbs] =
    useState("");
  const [classificacaoIbsCbs, setClassificacaoIbsCbs] =
    useState("");
  const [baseCalculoIbsCbs, setBaseCalculoIbsCbs] =
    useState("");
  const [aliquotaIbsUf, setAliquotaIbsUf] =
    useState("");
  const [valorIbsUf, setValorIbsUf] =
    useState("");
  const [aliquotaIbsMunicipio, setAliquotaIbsMunicipio] =
    useState("");
  const [valorIbsMunicipio, setValorIbsMunicipio] =
    useState("");
  const [valorIbs, setValorIbs] =
    useState("");
  const [aliquotaCbs, setAliquotaCbs] =
    useState("");
  const [valorCbs, setValorCbs] =
    useState("");
  const [valorTotalDfe, setValorTotalDfe] =
    useState("");

  const clienteDestinatario = useMemo(
    () =>
      clientes.find(
        (cliente) =>
          cliente.id === destinatarioId
      ),
    [clientes, destinatarioId]
  );

  function fechar() {
    router.back();
  }

  function selecionarNatureza(
    id: string
  ) {
    setNaturezaId(id);

    const natureza = naturezas.find(
      (item) => item.id === id
    );

    if (!natureza) {
      setCfop("");
      setNaturezaOperacao("");
      return;
    }

    setCfop(natureza.cfop);
    setNaturezaOperacao(
      natureza.descricao
    );

    if (
      !informacoesAdicionais &&
      natureza.informacoesComplementaresPadrao
    ) {
      setInformacoesAdicionais(
        natureza.informacoesComplementaresPadrao
      );
    }
  }

  function selecionarDestinatario(
    id: string
  ) {
    setDestinatarioId(id);

    const cliente = clientes.find(
      (item) => item.id === id
    );

    if (
      cliente?.codigoMunicipio &&
      cliente.municipio &&
      cliente.uf
    ) {
      setCodigoMunicipioFim(
        cliente.codigoMunicipio
      );
      setMunicipioFim(cliente.municipio);
      setUfFim(cliente.uf);
    }
  }

  function atualizarCarga(
    id: string,
    patch: Partial<CargaLinha>
  ) {
    setCargas((atual) =>
      atual.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item
      )
    );
  }

  function atualizarComponente(
    id: string,
    patch: Partial<ComponenteLinha>
  ) {
    setComponentes((atual) =>
      atual.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item
      )
    );
  }

  function atualizarChave(
    indice: number,
    valor: string
  ) {
    setChavesNfe((atual) =>
      atual.map((item, index) =>
        index === indice
          ? numeros(valor).slice(0, 44)
          : item
      )
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErro("");

    const numeroInformado = Number(numeroCte);

    if (
      !numeroCte ||
      !Number.isInteger(numeroInformado) ||
      numeroInformado < 1 ||
      numeroInformado > 999_999_999
    ) {
      setErro(
        "Informe um número de CT-e entre 1 e 999999999."
      );
      return;
    }

    if (!configuracao) {
      setErro(
        "Configure os parâmetros fiscais antes de emitir CT-e."
      );
      setAba("emissao");
      return;
    }

    if (
      !remetenteId ||
      !destinatarioId
    ) {
      setErro(
        "Informe remetente e destinatário."
      );
      setAba("identificacao");
      return;
    }

    if (
      !cfop ||
      !naturezaOperacao.trim()
    ) {
      setErro(
        "Selecione a natureza da prestação e confira o CFOP."
      );
      setAba("identificacao");
      return;
    }

    const prestacao =
      paraNumero(valorPrestacao);
    const receber =
      paraNumero(valorReceber) ??
      prestacao;
    const carga = paraNumero(valorCarga);

    if (
      prestacao === null ||
      prestacao <= 0 ||
      carga === null ||
      carga <= 0
    ) {
      setErro(
        "Informe valores válidos para a prestação e para a carga."
      );
      setAba("identificacao");
      return;
    }

    const quantidades = cargas
      .map((item) => ({
        unidade: item.unidade,
        tipoMedida:
          item.tipoMedida.trim(),
        quantidade:
          paraNumero(item.quantidade),
      }))
      .filter(
        (item): item is {
          unidade: UnidadeMedidaCteForm;
          tipoMedida: string;
          quantidade: number;
        } =>
          Boolean(item.tipoMedida) &&
          item.quantidade !== null &&
          item.quantidade > 0
      );

    if (quantidades.length === 0) {
      setErro(
        "Informe ao menos uma quantidade de carga."
      );
      setAba("identificacao");
      return;
    }

    const documentos = Array.from(
      new Set(
        chavesNfe
          .map(numeros)
          .filter(Boolean)
      )
    );

    if (
      documentos.length === 0 ||
      documentos.some(
        (chave) => chave.length !== 44
      )
    ) {
      setErro(
        "Informe ao menos uma chave de NF-e com 44 dígitos."
      );
      setAba("documentos");
      return;
    }

    const componentesValidos =
      componentes
        .map((item) => ({
          nome: item.nome.trim(),
          valor: paraNumero(item.valor),
        }))
        .filter(
          (item): item is {
            nome: string;
            valor: number;
          } =>
            Boolean(item.nome) &&
            item.valor !== null &&
            item.valor >= 0
        );

    try {
      setSalvando(true);

      const resultado = await salvarCte({
        empresaId,
        numero:
          numeroCteEditado
            ? numeroInformado
            : undefined,
        tipoServico,
        cfop,
        naturezaOperacao,
        codigoMunicipioEnvio,
        municipioEnvio,
        ufEnvio,
        codigoMunicipioInicio,
        municipioInicio,
        ufInicio,
        codigoMunicipioFim,
        municipioFim,
        ufFim,
        tomadorServico: tomador,
        remetenteClienteId: remetenteId,
        destinatarioClienteId:
          destinatarioId,
        expedidorClienteId:
          expedidorId || undefined,
        recebedorClienteId:
          recebedorId || undefined,
        tomadorOutrosClienteId:
          tomadorOutrosId || undefined,
        valorPrestacao: prestacao,
        valorReceber: receber ?? prestacao,
        valorCarga: carga,
        valorCargaAverbacao:
          paraNumero(
            valorCargaAverbacao
          ),
        produtoPredominante,
        outrasCaracteristicasCarga:
          tipoCarga,
        rntrc:
          configuracao.rntrc ?? undefined,
        chavesNfe: documentos,
        quantidadesCarga: quantidades,
        componentesValor:
          componentesValidos.length > 0
            ? componentesValidos
            : [
                {
                  nome: "FRETE",
                  valor: prestacao,
                },
              ],
        grupoIcms,
        cstIcms,
        percentualReducaoBc:
          paraNumero(
            percentualReducaoBc
          ),
        baseCalculoIcms:
          paraNumero(baseCalculoIcms),
        aliquotaIcms:
          paraNumero(aliquotaIcms),
        valorIcms:
          paraNumero(valorIcms),
        valorCreditoIcms:
          paraNumero(valorCreditoIcms),
        baseCalculoStRetido:
          paraNumero(
            baseCalculoStRetido
          ),
        aliquotaStRetido:
          paraNumero(aliquotaStRetido),
        valorIcmsStRetido:
          paraNumero(
            valorIcmsStRetido
          ),
        codigoBeneficioFiscal,
        valorTotalTributos:
          paraNumero(
            valorTotalTributos
          ),
        baseCalculoUfFim:
          paraNumero(baseCalculoUfFim),
        percentualFcpUfFim:
          paraNumero(
            percentualFcpUfFim
          ),
        percentualIcmsUfFim:
          paraNumero(
            percentualIcmsUfFim
          ),
        percentualIcmsInterestadual:
          paraNumero(
            percentualIcmsInterestadual
          ),
        valorFcpUfFim:
          paraNumero(valorFcpUfFim),
        valorIcmsUfFim:
          paraNumero(valorIcmsUfFim),
        valorIcmsUfInicio:
          paraNumero(
            valorIcmsUfInicio
          ),
        cstIbsCbs:
          editarIbsCbs
            ? cstIbsCbs
            : undefined,
        classificacaoTributariaIbsCbs:
          editarIbsCbs
            ? classificacaoIbsCbs
            : undefined,
        baseCalculoIbsCbs:
          editarIbsCbs
            ? paraNumero(
                baseCalculoIbsCbs
              )
            : undefined,
        aliquotaIbsUf:
          editarIbsCbs
            ? paraNumero(aliquotaIbsUf)
            : undefined,
        valorIbsUf:
          editarIbsCbs
            ? paraNumero(valorIbsUf)
            : undefined,
        aliquotaIbsMunicipio:
          editarIbsCbs
            ? paraNumero(
                aliquotaIbsMunicipio
              )
            : undefined,
        valorIbsMunicipio:
          editarIbsCbs
            ? paraNumero(
                valorIbsMunicipio
              )
            : undefined,
        valorIbs:
          editarIbsCbs
            ? paraNumero(valorIbs)
            : undefined,
        aliquotaCbs:
          editarIbsCbs
            ? paraNumero(aliquotaCbs)
            : undefined,
        valorCbs:
          editarIbsCbs
            ? paraNumero(valorCbs)
            : undefined,
        valorTotalDfe:
          editarIbsCbs
            ? paraNumero(valorTotalDfe)
            : undefined,
        informacoesAdicionais,
        informacoesFisco,
      });

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      router.replace(
        `/empresa/${empresaId}/cte`
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar CT-e pelo modal:",
        error
      );
      setErro(
        "Não foi possível salvar o CT-e."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !salvando) {
          fechar();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-w-none flex-col gap-0 overflow-hidden p-0",
          telaCheia
            ? "h-[100dvh] w-screen rounded-none"
            : "h-[94dvh] w-[96vw] max-w-[1500px] rounded-2xl"
        )}
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <header className="shrink-0 border-b bg-background px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText size={20} />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Emissão de CT-e
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Preencha as abas e salve o documento em rascunho antes da validação e autorização na SEFAZ.
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() =>
                    setTelaCheia(
                      (atual) => !atual
                    )
                  }
                  aria-label={
                    telaCheia
                      ? "Sair da tela cheia"
                      : "Tela cheia"
                  }
                >
                  {telaCheia ? (
                    <Minimize2 size={17} />
                  ) : (
                    <Maximize2 size={17} />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={fechar}
                  disabled={salvando}
                  aria-label="Fechar emissão de CT-e"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_.7fr_.7fr_.5fr_1.4fr]">
              <Campo label="Número CT-e">
                <Input
                  value={numeroCte}
                  onChange={(event) => {
                    setNumeroCte(
                      numeros(
                        event.target.value
                      ).slice(0, 9)
                    );
                    setNumeroCteEditado(true);
                  }}
                  inputMode="numeric"
                  maxLength={9}
                  className="h-10"
                />
              </Campo>
              <Campo label="Modelo">
                <Input
                  value="57"
                  readOnly
                  className="h-10 bg-muted/40"
                />
              </Campo>
              <Campo label="Série">
                <Input
                  value={String(
                    configuracao?.serieCte ?? 1
                  )}
                  readOnly
                  className="h-10 bg-muted/40"
                />
              </Campo>
              <Campo label="DV">
                <Input
                  value="Auto"
                  readOnly
                  className="h-10 bg-muted/40"
                />
              </Campo>
              <Campo label="Data emissão">
                <Input
                  type="datetime-local"
                  value={dataEmissao}
                  readOnly
                  className="h-10 bg-muted/40"
                />
              </Campo>
            </div>
          </header>

          <nav className="shrink-0 overflow-x-auto border-b bg-background px-3 sm:px-5">
            <div className="flex min-w-max">
              {ABAS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setAba(item.id)
                  }
                  className={cn(
                    "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    aba === item.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <main className="min-h-0 flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6">
            {!configuracao && (
              <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                Configure ambiente, série e RNTRC em Configurações antes de salvar um CT-e.
              </div>
            )}

            {aba === "identificacao" && (
              <div className="space-y-5">
                <Bloco titulo="Identificação da prestação">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <Campo label="Modal *">
                      <Input
                        value="Rodoviário"
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Tipo de serviço *">
                      <select
                        value={tipoServico}
                        onChange={(event) =>
                          setTipoServico(
                            event.target.value as TipoServicoCteForm
                          )
                        }
                        className={selectClass}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="SUBCONTRATACAO">Subcontratação</option>
                        <option value="REDESPACHO">Redespacho</option>
                        <option value="REDESPACHO_INTERMEDIARIO">Redespacho intermediário</option>
                        <option value="SERVICO_VINCULADO_MULTIMODAL">Serviço vinculado ao multimodal</option>
                      </select>
                    </Campo>
                    <Campo label="Tomador / Contratante *">
                      <select
                        value={tomador}
                        onChange={(event) =>
                          setTomador(
                            event.target.value as TomadorServicoCteForm
                          )
                        }
                        className={selectClass}
                      >
                        <option value="REMETENTE">0 - Remetente</option>
                        <option value="EXPEDIDOR">1 - Expedidor</option>
                        <option value="RECEBEDOR">2 - Recebedor</option>
                        <option value="DESTINATARIO">3 - Destinatário</option>
                        <option value="OUTROS">4 - Outros</option>
                      </select>
                    </Campo>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <SelecaoCliente
                      label="Remetente *"
                      value={remetenteId}
                      clientes={clientes}
                      onChange={setRemetenteId}
                    />
                    <SelecaoCliente
                      label="Destinatário *"
                      value={destinatarioId}
                      clientes={clientes}
                      onChange={selecionarDestinatario}
                    />
                  </div>

                  {tomador === "OUTROS" && (
                    <div className="mt-4">
                      <SelecaoCliente
                        label="Outro tomador *"
                        value={tomadorOutrosId}
                        clientes={clientes}
                        onChange={setTomadorOutrosId}
                      />
                    </div>
                  )}

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_.45fr]">
                    <Campo label="Natureza da operação *">
                      <select
                        value={naturezaId}
                        onChange={(event) =>
                          selecionarNatureza(
                            event.target.value
                          )
                        }
                        className={selectClass}
                      >
                        <option value="">
                          Selecione a natureza de operação...
                        </option>
                        {naturezas.map(
                          (natureza) => (
                            <option
                              key={natureza.id}
                              value={natureza.id}
                            >
                              {natureza.descricao} — CFOP {natureza.cfop}
                            </option>
                          )
                        )}
                      </select>
                    </Campo>
                    <Campo label="CFOP">
                      <Input
                        value={cfop}
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                  </div>

                  {naturezaId === "" && (
                    <div className="mt-4 grid gap-4 lg:grid-cols-[.45fr_1.4fr]">
                      <Campo label="CFOP manual">
                        <Input
                          value={cfop}
                          onChange={(event) =>
                            setCfop(
                              numeros(
                                event.target.value
                              ).slice(0, 4)
                            )
                          }
                          className="h-10"
                        />
                      </Campo>
                      <Campo label="Natureza manual">
                        <Input
                          value={naturezaOperacao}
                          onChange={(event) =>
                            setNaturezaOperacao(
                              event.target.value
                            )
                          }
                          className="h-10"
                        />
                      </Campo>
                    </div>
                  )}
                </Bloco>

                <Bloco titulo="Carga e valores">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Campo label="Produto predominante *">
                      <Input
                        value={produtoPredominante}
                        onChange={(event) =>
                          setProdutoPredominante(
                            event.target.value
                          )
                        }
                        className="h-10"
                      />
                    </Campo>
                    <Campo label="Tipo / característica da carga">
                      <Input
                        value={tipoCarga}
                        onChange={(event) =>
                          setTipoCarga(
                            event.target.value
                          )
                        }
                        className="h-10"
                        placeholder="Ex.: carga geral, pescado congelado..."
                      />
                    </Campo>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <Campo label="Valor da carga *">
                      <Input
                        inputMode="decimal"
                        value={valorCarga}
                        onChange={(event) =>
                          setValorCarga(
                            event.target.value
                          )
                        }
                        className="h-10"
                      />
                    </Campo>
                    <Campo label="Valor do serviço *">
                      <Input
                        inputMode="decimal"
                        value={valorPrestacao}
                        onChange={(event) =>
                          setValorPrestacao(
                            event.target.value
                          )
                        }
                        className="h-10"
                      />
                    </Campo>
                    <Campo label="Valor a receber">
                      <Input
                        inputMode="decimal"
                        value={valorReceber}
                        onChange={(event) =>
                          setValorReceber(
                            event.target.value
                          )
                        }
                        className="h-10"
                        placeholder="Se vazio, usa o valor do serviço"
                      />
                    </Campo>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-xl border">
                    <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Quantidades da carga
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Informe peso, volume ou outra unidade utilizada no CT-e.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCargas((atual) => [
                            ...atual,
                            {
                              id: novoId(),
                              unidade: "QUILOGRAMA",
                              tipoMedida: "PESO BRUTO",
                              quantidade: "",
                            },
                          ])
                        }
                      >
                        <Plus size={15} />
                        Carga
                      </Button>
                    </div>

                    <div className="divide-y">
                      {cargas.map((item) => (
                        <div
                          key={item.id}
                          className="grid gap-3 p-4 lg:grid-cols-[1fr_1.2fr_1fr_auto]"
                        >
                          <select
                            value={item.unidade}
                            onChange={(event) =>
                              atualizarCarga(
                                item.id,
                                {
                                  unidade:
                                    event.target.value as UnidadeMedidaCteForm,
                                }
                              )
                            }
                            className={selectClass}
                          >
                            {UNIDADES.map(
                              (unidade) => (
                                <option
                                  key={unidade.value}
                                  value={unidade.value}
                                >
                                  {unidade.label}
                                </option>
                              )
                            )}
                          </select>
                          <Input
                            value={item.tipoMedida}
                            onChange={(event) =>
                              atualizarCarga(
                                item.id,
                                {
                                  tipoMedida:
                                    event.target.value,
                                }
                              )
                            }
                            placeholder="PESO BRUTO"
                            className="h-10"
                          />
                          <Input
                            inputMode="decimal"
                            value={item.quantidade}
                            onChange={(event) =>
                              atualizarCarga(
                                item.id,
                                {
                                  quantidade:
                                    event.target.value,
                                }
                              )
                            }
                            placeholder="Quantidade"
                            className="h-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            disabled={
                              cargas.length === 1
                            }
                            onClick={() =>
                              setCargas((atual) =>
                                atual.filter(
                                  (carga) =>
                                    carga.id !== item.id
                                )
                              )
                            }
                            aria-label="Excluir quantidade da carga"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-xl border">
                    <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Componentes do valor da prestação
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Frete peso, pedágio, despacho e demais componentes.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setComponentes(
                            (atual) => [
                              ...atual,
                              {
                                id: novoId(),
                                nome: "",
                                valor: "",
                              },
                            ]
                          )
                        }
                      >
                        <Plus size={15} />
                        Componente
                      </Button>
                    </div>
                    <div className="divide-y">
                      {componentes.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="grid gap-3 p-4 lg:grid-cols-[1.6fr_1fr_auto]"
                          >
                            <Input
                              value={item.nome}
                              onChange={(event) =>
                                atualizarComponente(
                                  item.id,
                                  {
                                    nome:
                                      event.target.value,
                                  }
                                )
                              }
                              placeholder="Descrição do componente"
                              className="h-10"
                            />
                            <Input
                              inputMode="decimal"
                              value={item.valor}
                              onChange={(event) =>
                                atualizarComponente(
                                  item.id,
                                  {
                                    valor:
                                      event.target.value,
                                  }
                                )
                              }
                              placeholder="Valor"
                              className="h-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={
                                componentes.length === 1
                              }
                              onClick={() =>
                                setComponentes(
                                  (atual) =>
                                    atual.filter(
                                      (componente) =>
                                        componente.id !==
                                        item.id
                                    )
                                )
                              }
                              aria-label="Excluir componente"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Bloco>
              </div>
            )}

            {aba === "tributos" && (
              <div className="space-y-5">
                <Bloco titulo="ICMS da prestação">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <Campo label="Grupo ICMS *">
                      <select
                        value={grupoIcms}
                        onChange={(event) =>
                          setGrupoIcms(
                            event.target.value as GrupoIcmsCteForm
                          )
                        }
                        className={selectClass}
                      >
                        <option value="ICMSSN">Simples Nacional</option>
                        <option value="ICMS00">ICMS 00</option>
                        <option value="ICMS20">ICMS 20</option>
                        <option value="ICMS45">ICMS 40/41/51</option>
                        <option value="ICMS60">ICMS 60</option>
                        <option value="ICMS90">ICMS 90</option>
                        <option value="ICMS_OUTRA_UF">ICMS Outra UF</option>
                      </select>
                    </Campo>
                    <Campo label="CST *">
                      <Input
                        value={cstIcms}
                        onChange={(event) =>
                          setCstIcms(
                            numeros(
                              event.target.value
                            ).slice(0, 2)
                          )
                        }
                        className="h-10"
                      />
                    </Campo>
                    <Campo label="Valor B.C. ICMS">
                      <Input inputMode="decimal" value={baseCalculoIcms} onChange={(event) => setBaseCalculoIcms(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Redução B.C. (%)">
                      <Input inputMode="decimal" value={percentualReducaoBc} onChange={(event) => setPercentualReducaoBc(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Alíquota ICMS (%)">
                      <Input inputMode="decimal" value={aliquotaIcms} onChange={(event) => setAliquotaIcms(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Valor do ICMS">
                      <Input inputMode="decimal" value={valorIcms} onChange={(event) => setValorIcms(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Crédito outorgado">
                      <Input inputMode="decimal" value={valorCreditoIcms} onChange={(event) => setValorCreditoIcms(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Valor tributos">
                      <Input inputMode="decimal" value={valorTotalTributos} onChange={(event) => setValorTotalTributos(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Cód. benefício fiscal">
                      <Input value={codigoBeneficioFiscal} onChange={(event) => setCodigoBeneficioFiscal(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="B.C. ST retido">
                      <Input inputMode="decimal" value={baseCalculoStRetido} onChange={(event) => setBaseCalculoStRetido(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Alíquota ST retido (%)">
                      <Input inputMode="decimal" value={aliquotaStRetido} onChange={(event) => setAliquotaStRetido(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Valor ICMS ST retido">
                      <Input inputMode="decimal" value={valorIcmsStRetido} onChange={(event) => setValorIcmsStRetido(event.target.value)} className="h-10" />
                    </Campo>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <Campo label="Valor para averbação">
                      <Input inputMode="decimal" value={valorCargaAverbacao} onChange={(event) => setValorCargaAverbacao(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Retira no destino">
                      <Input value="Não" readOnly className="h-10 bg-muted/40" />
                    </Campo>
                    <Campo label="Formato DACTE">
                      <Input value="Retrato" readOnly className="h-10 bg-muted/40" />
                    </Campo>
                  </div>
                </Bloco>

                <Bloco titulo="ICMS DIFAL / FCP">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Campo label="B.C. UF fim">
                      <Input inputMode="decimal" value={baseCalculoUfFim} onChange={(event) => setBaseCalculoUfFim(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="FCP UF fim (%)">
                      <Input inputMode="decimal" value={percentualFcpUfFim} onChange={(event) => setPercentualFcpUfFim(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="ICMS UF fim (%)">
                      <Input inputMode="decimal" value={percentualIcmsUfFim} onChange={(event) => setPercentualIcmsUfFim(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="ICMS interestadual (%)">
                      <Input inputMode="decimal" value={percentualIcmsInterestadual} onChange={(event) => setPercentualIcmsInterestadual(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Valor FCP UF fim">
                      <Input inputMode="decimal" value={valorFcpUfFim} onChange={(event) => setValorFcpUfFim(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Valor ICMS UF fim">
                      <Input inputMode="decimal" value={valorIcmsUfFim} onChange={(event) => setValorIcmsUfFim(event.target.value)} className="h-10" />
                    </Campo>
                    <Campo label="Valor ICMS UF início">
                      <Input inputMode="decimal" value={valorIcmsUfInicio} onChange={(event) => setValorIcmsUfInicio(event.target.value)} className="h-10" />
                    </Campo>
                  </div>
                </Bloco>
              </div>
            )}

            {aba === "documentos" && (
              <div className="space-y-5">
                <div className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1">
                  <DocumentoAba label="NF-e" ativo />
                  <DocumentoAba label="NF" />
                  <DocumentoAba label="Outros" />
                  <DocumentoAba label="CT-e" />
                  <DocumentoAba label="Comp./Sub." />
                  <DocumentoAba label="Volumes" />
                  <DocumentoAba label="DC-e" />
                </div>

                <Bloco titulo="NF-e transportadas">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Informe as chaves de acesso das NF-e transportadas. O CT-e aceita várias notas.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setChavesNfe(
                          (atual) => [
                            ...atual,
                            "",
                          ]
                        )
                      }
                    >
                      <Plus size={15} />
                      NF-e
                    </Button>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-xl border">
                    <div className="grid grid-cols-[1fr_auto] border-b bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>Chave NF-e</span>
                      <span>Ação</span>
                    </div>
                    <div className="divide-y">
                      {chavesNfe.map(
                        (chave, indice) => (
                          <div
                            key={indice}
                            className="grid grid-cols-[1fr_auto] gap-3 p-3"
                          >
                            <Input
                              value={chave}
                              onChange={(event) =>
                                atualizarChave(
                                  indice,
                                  event.target.value
                                )
                              }
                              inputMode="numeric"
                              maxLength={44}
                              placeholder="44 dígitos da chave de acesso"
                              className="h-10 font-mono"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={
                                chavesNfe.length === 1
                              }
                              onClick={() =>
                                setChavesNfe(
                                  (atual) =>
                                    atual.filter(
                                      (_, index) =>
                                        index !== indice
                                    )
                                )
                              }
                              aria-label="Excluir NF-e"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    As abas NF, Outros, CT-e, Comp./Sub., Volumes e DC-e aparecem como referência de organização, mas só serão habilitadas quando o respectivo grupo fiscal estiver implementado no XML do Faturístico.
                  </p>
                </Bloco>
              </div>
            )}

            {aba === "emissao" && (
              <div className="space-y-5">
                <Bloco titulo="Participantes complementares">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <SelecaoCliente
                      label="Recebedor"
                      value={recebedorId}
                      clientes={clientes}
                      onChange={setRecebedorId}
                    />
                    <SelecaoCliente
                      label="Expedidor"
                      value={expedidorId}
                      clientes={clientes}
                      onChange={setExpedidorId}
                    />
                  </div>
                </Bloco>

                <Bloco titulo="Parâmetros da emissão">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Campo label="Empresa emitente">
                      <Input
                        value={`${empresa.razaoSocial} — ${empresa.cnpj}`}
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="RNTRC">
                      <Input
                        value={
                          configuracao?.rntrc ??
                          "Não configurado"
                        }
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Chave CT-e">
                      <Input
                        value="Gerada na validação"
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Tipo ambiente">
                      <Input
                        value={
                          configuracao?.ambiente ===
                          "PRODUCAO"
                            ? "1 - Produção"
                            : "2 - Homologação"
                        }
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Tipo emissão">
                      <Input
                        value="1 - Normal"
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Finalidade CT-e">
                      <Input
                        value="0 - CT-e Normal"
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Tipo impressão">
                      <Input
                        value="1 - Retrato"
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Gera financeiro">
                      <Input
                        value="Não integrado nesta versão"
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                    <Campo label="Data/hora de emissão">
                      <Input
                        type="datetime-local"
                        value={dataEmissao}
                        readOnly
                        className="h-10 bg-muted/40"
                      />
                    </Campo>
                  </div>
                </Bloco>

                <Bloco titulo="Municípios da prestação">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <Municipio
                      titulo="Cidade de emissão"
                      codigo={codigoMunicipioEnvio}
                      municipio={municipioEnvio}
                      uf={ufEnvio}
                      onCodigo={setCodigoMunicipioEnvio}
                      onMunicipio={setMunicipioEnvio}
                      onUf={setUfEnvio}
                    />
                    <Municipio
                      titulo="Cidade início da prestação"
                      codigo={codigoMunicipioInicio}
                      municipio={municipioInicio}
                      uf={ufInicio}
                      onCodigo={setCodigoMunicipioInicio}
                      onMunicipio={setMunicipioInicio}
                      onUf={setUfInicio}
                    />
                    <Municipio
                      titulo="Cidade término da prestação"
                      codigo={codigoMunicipioFim}
                      municipio={municipioFim}
                      uf={ufFim}
                      onCodigo={setCodigoMunicipioFim}
                      onMunicipio={setMunicipioFim}
                      onUf={setUfFim}
                    />
                  </div>

                  {clienteDestinatario && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      O município de término foi preenchido a partir do destinatário selecionado e pode ser ajustado quando necessário.
                    </p>
                  )}
                </Bloco>
              </div>
            )}

            {aba === "observacoes" && (
              <div className="space-y-5">
                <Bloco titulo="Observações do contribuinte">
                  <Campo label="Informações complementares">
                    <textarea
                      value={informacoesAdicionais}
                      onChange={(event) =>
                        setInformacoesAdicionais(
                          event.target.value
                        )
                      }
                      rows={9}
                      className={textareaClass}
                      placeholder="Observações que acompanharão o CT-e..."
                    />
                  </Campo>
                </Bloco>

                <Bloco titulo="Informações de interesse do Fisco">
                  <Campo label="Informações do Fisco">
                    <textarea
                      value={informacoesFisco}
                      onChange={(event) =>
                        setInformacoesFisco(
                          event.target.value
                        )
                      }
                      rows={8}
                      className={textareaClass}
                    />
                  </Campo>
                </Bloco>
              </div>
            )}

            {aba === "reforma" && (
              <Bloco titulo="IBS e CBS — Reforma Tributária">
                <label className="mb-5 flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={editarIbsCbs}
                    onChange={(event) =>
                      setEditarIbsCbs(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <span>
                    Editar grupo IBS/CBS deste CT-e
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                  <Campo label="CST IBS/CBS" className="sm:col-span-2 lg:col-span-2 xl:col-span-3">
                    <Input value={cstIbsCbs} onChange={(event) => setCstIbsCbs(numeros(event.target.value).slice(0, 3))} disabled={!editarIbsCbs} className="h-10" placeholder="000" />
                  </Campo>
                  <Campo label="Class. Trib. IBS/CBS" className="sm:col-span-2 lg:col-span-2 xl:col-span-3">
                    <Input value={classificacaoIbsCbs} onChange={(event) => setClassificacaoIbsCbs(numeros(event.target.value).slice(0, 6))} disabled={!editarIbsCbs} className="h-10" placeholder="000001" />
                  </Campo>
                  <Campo label="V. BC IBS/CBS">
                    <Input inputMode="decimal" value={baseCalculoIbsCbs} onChange={(event) => setBaseCalculoIbsCbs(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="P. IBS UF">
                    <Input inputMode="decimal" value={aliquotaIbsUf} onChange={(event) => setAliquotaIbsUf(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="V. IBS UF">
                    <Input inputMode="decimal" value={valorIbsUf} onChange={(event) => setValorIbsUf(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="P. IBS Mun.">
                    <Input inputMode="decimal" value={aliquotaIbsMunicipio} onChange={(event) => setAliquotaIbsMunicipio(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="V. IBS Mun.">
                    <Input inputMode="decimal" value={valorIbsMunicipio} onChange={(event) => setValorIbsMunicipio(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="V. IBS">
                    <Input inputMode="decimal" value={valorIbs} onChange={(event) => setValorIbs(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="P. CBS">
                    <Input inputMode="decimal" value={aliquotaCbs} onChange={(event) => setAliquotaCbs(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="V. CBS">
                    <Input inputMode="decimal" value={valorCbs} onChange={(event) => setValorCbs(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                  <Campo label="Valor total DFe">
                    <Input inputMode="decimal" value={valorTotalDfe} onChange={(event) => setValorTotalDfe(event.target.value)} disabled={!editarIbsCbs} className="h-10" />
                  </Campo>
                </div>

                <p className="mt-5 text-xs leading-5 text-muted-foreground">
                  O Faturístico habilita aqui somente os campos da Reforma Tributária que já estão ligados à estrutura XML do CT-e. Campos adicionais serão incluídos conforme forem implementados e validados no leiaute fiscal vigente.
                </p>
              </Bloco>
            )}
          </main>

          {erro && (
            <div
              role="alert"
              className="shrink-0 border-t border-destructive/30 bg-destructive/10 px-5 py-2.5 text-sm text-destructive"
            >
              {erro}
            </div>
          )}

          <footer className="shrink-0 border-t bg-background px-4 py-3 sm:px-6">
            <div className="grid gap-2 sm:grid-cols-3 sm:items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={fechar}
                disabled={salvando}
                className="sm:justify-self-start"
              >
                Sair
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled
                title="O simulador de frete mínimo ainda não possui fonte de cálculo configurada."
                className="sm:justify-self-center"
              >
                <Calculator size={16} />
                Simular Frete Mínimo
              </Button>

              <Button
                type="submit"
                disabled={salvando}
                className="sm:justify-self-end"
              >
                {salvando ? (
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}
                {salvando
                  ? "Salvando..."
                  : "Salvar CT-e"}
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20";

const textareaClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20";

function Campo({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block space-y-1.5",
        className
      )}
    >
      <span className="text-xs font-semibold text-foreground/80">
        {label}
      </span>
      {children}
    </label>
  );
}

function Bloco({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-sm font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function SelecaoCliente({
  label,
  value,
  clientes,
  onChange,
}: {
  label: string;
  value: string;
  clientes: Cliente[];
  onChange: (value: string) => void;
}) {
  return (
    <Campo label={label}>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={selectClass}
      >
        <option value="">
          Pesquise / selecione o cadastro...
        </option>
        {clientes.map((cliente) => (
          <option
            key={cliente.id}
            value={cliente.id}
          >
            {cliente.nome} — {cliente.cpfCnpj}
          </option>
        ))}
      </select>
    </Campo>
  );
}

function Municipio({
  titulo,
  codigo,
  municipio,
  uf,
  onCodigo,
  onMunicipio,
  onUf,
}: {
  titulo: string;
  codigo: string;
  municipio: string;
  uf: string;
  onCodigo: (value: string) => void;
  onMunicipio: (value: string) => void;
  onUf: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </p>
      <div className="space-y-3">
        <Input
          value={codigo}
          onChange={(event) =>
            onCodigo(
              numeros(
                event.target.value
              ).slice(0, 7)
            )
          }
          placeholder="Código IBGE"
          className="h-10"
        />
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Input
            value={municipio}
            onChange={(event) =>
              onMunicipio(
                event.target.value
              )
            }
            placeholder="Município"
            className="h-10"
          />
          <Input
            value={uf}
            onChange={(event) =>
              onUf(
                event.target.value
                  .toUpperCase()
                  .slice(0, 2)
              )
            }
            maxLength={2}
            placeholder="UF"
            className="h-10"
          />
        </div>
      </div>
    </div>
  );
}

function DocumentoAba({
  label,
  ativo = false,
}: {
  label: string;
  ativo?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!ativo}
      className={cn(
        "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium",
        ativo
          ? "bg-background text-foreground shadow-sm"
          : "cursor-not-allowed text-muted-foreground/60"
      )}
    >
      {label}
    </button>
  );
}

"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Save,
} from "lucide-react";

import { salvarCte } from "@/actions/cte/salvar-cte";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  GrupoIcmsCteForm,
  TomadorServicoCteForm,
  UnidadeMedidaCteForm,
} from "@/lib/cte/form-types";

const unidades: Array<{
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

type Cliente = {
  id: string;
  tipoPessoa: "FISICA" | "JURIDICA";
  nome: string;
  cpfCnpj: string;
  inscricaoEstadual: string | null;
  email: string | null;
  telefone: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  codigoMunicipio: string | null;
  uf: string | null;
  codigoPais: string | null;
  pais: string | null;
};

type Empresa = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  inscricaoEstadual: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  municipio: string | null;
  codigoMunicipio: string | null;
  uf: string | null;
};

type Participante = {
  papel: string;
  cpfCnpj: string;
};

type CteEdicao = {
  id: string;
  status: string;
  tipoServico: string;
  cfop: string;
  naturezaOperacao: string;
  codigoMunicipioEnvio: string;
  municipioEnvio: string;
  ufEnvio: string;
  codigoMunicipioInicio: string;
  municipioInicio: string;
  ufInicio: string;
  codigoMunicipioFim: string;
  municipioFim: string;
  ufFim: string;
  tomadorServico: string;
  valorPrestacao: number;
  valorReceber: number;
  valorCarga: number;
  valorCargaAverbacao: number | null;
  produtoPredominante: string;
  outrasCaracteristicasCarga: string | null;
  rntrc: string | null;
  informacoesAdicionais: string | null;
  informacoesFisco: string | null;
  grupoIcms: string;
  cstIcms: string;
  percentualReducaoBc: number | null;
  baseCalculoIcms: number | null;
  aliquotaIcms: number | null;
  valorIcms: number | null;
  valorCreditoIcms: number | null;
  baseCalculoStRetido: number | null;
  aliquotaStRetido: number | null;
  valorIcmsStRetido: number | null;
  codigoBeneficioFiscal: string | null;
  valorTotalTributos: number | null;
  baseCalculoUfFim: number | null;
  percentualFcpUfFim: number | null;
  percentualIcmsUfFim: number | null;
  percentualIcmsInterestadual: number | null;
  valorFcpUfFim: number | null;
  valorIcmsUfFim: number | null;
  valorIcmsUfInicio: number | null;
  cstIbsCbs: string | null;
  classificacaoTributariaIbsCbs: string | null;
  baseCalculoIbsCbs: number | null;
  aliquotaIbsUf: number | null;
  valorIbsUf: number | null;
  aliquotaIbsMunicipio: number | null;
  valorIbsMunicipio: number | null;
  valorIbs: number | null;
  aliquotaCbs: number | null;
  valorCbs: number | null;
  valorTotalDfe: number | null;
  participantes: Participante[];
  documentosNfe: Array<{
    chaveAcesso: string;
  }>;
  quantidadesCarga: Array<{
    unidade: UnidadeMedidaCteForm;
    tipoMedida: string;
    quantidade: number;
  }>;
  componentesValor: Array<{
    nome: string;
    valor: number;
  }>;
};

type Props = {
  empresaId: string;
  empresa: Empresa;
  clientes: Cliente[];
  configuracao: {
    ambiente: "HOMOLOGACAO" | "PRODUCAO";
    regimeTributario: string;
    serieCte: number;
    rntrc: string | null;
  } | null;
  cte?: CteEdicao | null;
  somenteLeitura?: boolean;
};

function numeros(valor: string) {
  return valor.replace(/\D/g, "");
}

function numeroOuVazio(
  valor: number | null | undefined
) {
  return valor === null || valor === undefined
    ? ""
    : String(valor);
}

function documentoParticipante(
  cte: CteEdicao | null | undefined,
  papel: string
) {
  return cte?.participantes.find(
    (item) => item.papel === papel
  )?.cpfCnpj;
}

function localizarCliente(
  clientes: Cliente[],
  documento: string | undefined
) {
  const doc = numeros(documento ?? "");
  return (
    clientes.find(
      (cliente) =>
        numeros(cliente.cpfCnpj) === doc
    )?.id ?? ""
  );
}

function parseComponentes(texto: string) {
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const [nome, valor] =
        linha.split("=");

      return {
        nome: nome?.trim() ?? "",
        valor: Number(
          (valor ?? "0")
            .replace(",", ".")
        ),
      };
    })
    .filter(
      (item) =>
        item.nome &&
        Number.isFinite(item.valor) &&
        item.valor >= 0
    );
}

export function CteForm({
  empresaId,
  empresa,
  clientes,
  configuracao,
  cte = null,
  somenteLeitura = false,
}: Props) {
  const router = useRouter();

  const [salvando, setSalvando] =
    useState(false);
  const [erro, setErro] =
    useState("");

  const remetenteInicial =
    localizarCliente(
      clientes,
      documentoParticipante(
        cte,
        "REMETENTE"
      )
    );
  const destinatarioInicial =
    localizarCliente(
      clientes,
      documentoParticipante(
        cte,
        "DESTINATARIO"
      )
    );

  const [tipoServico, setTipoServico] =
    useState(
      cte?.tipoServico ?? "NORMAL"
    );
  const [cfop, setCfop] = useState(
    cte?.cfop ?? "5353"
  );
  const [naturezaOperacao, setNaturezaOperacao] =
    useState(
      cte?.naturezaOperacao ??
        "PRESTAÇÃO DE SERVIÇO DE TRANSPORTE"
    );

  const [remetenteId, setRemetenteId] =
    useState(remetenteInicial);
  const [destinatarioId, setDestinatarioId] =
    useState(destinatarioInicial);
  const [expedidorId, setExpedidorId] =
    useState(
      localizarCliente(
        clientes,
        documentoParticipante(
          cte,
          "EXPEDIDOR"
        )
      )
    );
  const [recebedorId, setRecebedorId] =
    useState(
      localizarCliente(
        clientes,
        documentoParticipante(
          cte,
          "RECEBEDOR"
        )
      )
    );
  const [tomadorOutrosId, setTomadorOutrosId] =
    useState(
      localizarCliente(
        clientes,
        documentoParticipante(
          cte,
          "TOMADOR_OUTROS"
        )
      )
    );
  const [tomador, setTomador] =
    useState<TomadorServicoCteForm>(
      (cte?.tomadorServico as TomadorServicoCteForm) ??
        "REMETENTE"
    );

  const [codigoMunicipioEnvio, setCodigoMunicipioEnvio] =
    useState(
      cte?.codigoMunicipioEnvio ??
        empresa.codigoMunicipio ??
        ""
    );
  const [municipioEnvio, setMunicipioEnvio] =
    useState(
      cte?.municipioEnvio ??
        empresa.municipio ??
        ""
    );
  const [ufEnvio, setUfEnvio] =
    useState(
      cte?.ufEnvio ?? empresa.uf ?? ""
    );

  const [codigoMunicipioInicio, setCodigoMunicipioInicio] =
    useState(
      cte?.codigoMunicipioInicio ??
        empresa.codigoMunicipio ??
        ""
    );
  const [municipioInicio, setMunicipioInicio] =
    useState(
      cte?.municipioInicio ??
        empresa.municipio ??
        ""
    );
  const [ufInicio, setUfInicio] =
    useState(
      cte?.ufInicio ?? empresa.uf ?? ""
    );

  const destinatarioInicialDados =
    clientes.find(
      (item) => item.id === destinatarioInicial
    );

  const [codigoMunicipioFim, setCodigoMunicipioFim] =
    useState(
      cte?.codigoMunicipioFim ??
        destinatarioInicialDados?.codigoMunicipio ??
        ""
    );
  const [municipioFim, setMunicipioFim] =
    useState(
      cte?.municipioFim ??
        destinatarioInicialDados?.municipio ??
        ""
    );
  const [ufFim, setUfFim] =
    useState(
      cte?.ufFim ??
        destinatarioInicialDados?.uf ??
        ""
    );

  const [valorPrestacao, setValorPrestacao] =
    useState(
      numeroOuVazio(cte?.valorPrestacao)
    );
  const [valorReceber, setValorReceber] =
    useState(
      numeroOuVazio(cte?.valorReceber)
    );
  const [valorCarga, setValorCarga] =
    useState(
      numeroOuVazio(cte?.valorCarga)
    );
  const [valorCargaAverbacao, setValorCargaAverbacao] =
    useState(
      numeroOuVazio(
        cte?.valorCargaAverbacao
      )
    );
  const [produtoPredominante, setProdutoPredominante] =
    useState(
      cte?.produtoPredominante ?? ""
    );
  const [outrasCaracteristicas, setOutrasCaracteristicas] =
    useState(
      cte?.outrasCaracteristicasCarga ?? ""
    );
  const [rntrc, setRntrc] = useState(
    cte?.rntrc ?? configuracao?.rntrc ?? ""
  );

  const primeiraQuantidade =
    cte?.quantidadesCarga[0];

  const [unidade, setUnidade] =
    useState<UnidadeMedidaCteForm>(
      primeiraQuantidade?.unidade ??
        "QUILOGRAMA"
    );
  const [tipoMedida, setTipoMedida] =
    useState(
      primeiraQuantidade?.tipoMedida ??
        "PESO BRUTO"
    );
  const [quantidade, setQuantidade] =
    useState(
      numeroOuVazio(
        primeiraQuantidade?.quantidade
      )
    );

  const [chavesNfe, setChavesNfe] =
    useState(
      cte?.documentosNfe
        .map((item) => item.chaveAcesso)
        .join("\n") ?? ""
    );
  const [componentesTexto, setComponentesTexto] =
    useState(
      cte?.componentesValor
        .map(
          (item) =>
            `${item.nome}=${item.valor}`
        )
        .join("\n") ?? ""
    );

  const [grupoIcms, setGrupoIcms] =
    useState<GrupoIcmsCteForm>(
      (cte?.grupoIcms as GrupoIcmsCteForm) ??
        (configuracao?.regimeTributario ===
        "SIMPLES_NACIONAL"
          ? "ICMSSN"
          : "ICMS00")
    );
  const [cstIcms, setCstIcms] =
    useState(cte?.cstIcms ?? "90");
  const [baseCalculoIcms, setBaseCalculoIcms] =
    useState(
      numeroOuVazio(cte?.baseCalculoIcms)
    );
  const [aliquotaIcms, setAliquotaIcms] =
    useState(
      numeroOuVazio(cte?.aliquotaIcms)
    );
  const [valorIcms, setValorIcms] =
    useState(
      numeroOuVazio(cte?.valorIcms)
    );
  const [percentualReducaoBc, setPercentualReducaoBc] =
    useState(
      numeroOuVazio(
        cte?.percentualReducaoBc
      )
    );
  const [baseCalculoStRetido, setBaseCalculoStRetido] =
    useState(
      numeroOuVazio(
        cte?.baseCalculoStRetido
      )
    );
  const [aliquotaStRetido, setAliquotaStRetido] =
    useState(
      numeroOuVazio(
        cte?.aliquotaStRetido
      )
    );
  const [valorIcmsStRetido, setValorIcmsStRetido] =
    useState(
      numeroOuVazio(
        cte?.valorIcmsStRetido
      )
    );
  const [valorCreditoIcms, setValorCreditoIcms] =
    useState(
      numeroOuVazio(
        cte?.valorCreditoIcms
      )
    );
  const [codigoBeneficioFiscal, setCodigoBeneficioFiscal] =
    useState(
      cte?.codigoBeneficioFiscal ?? ""
    );
  const [valorTotalTributos, setValorTotalTributos] =
    useState(
      numeroOuVazio(
        cte?.valorTotalTributos
      )
    );

  const [baseCalculoUfFim, setBaseCalculoUfFim] =
    useState(
      numeroOuVazio(cte?.baseCalculoUfFim)
    );
  const [percentualFcpUfFim, setPercentualFcpUfFim] =
    useState(
      numeroOuVazio(
        cte?.percentualFcpUfFim
      )
    );
  const [percentualIcmsUfFim, setPercentualIcmsUfFim] =
    useState(
      numeroOuVazio(
        cte?.percentualIcmsUfFim
      )
    );
  const [percentualIcmsInterestadual, setPercentualIcmsInterestadual] =
    useState(
      numeroOuVazio(
        cte?.percentualIcmsInterestadual
      )
    );
  const [valorFcpUfFim, setValorFcpUfFim] =
    useState(
      numeroOuVazio(cte?.valorFcpUfFim)
    );
  const [valorIcmsUfFim, setValorIcmsUfFim] =
    useState(
      numeroOuVazio(cte?.valorIcmsUfFim)
    );
  const [valorIcmsUfInicio, setValorIcmsUfInicio] =
    useState(
      numeroOuVazio(
        cte?.valorIcmsUfInicio
      )
    );

  const [cstIbsCbs, setCstIbsCbs] =
    useState(cte?.cstIbsCbs ?? "");
  const [classificacaoIbsCbs, setClassificacaoIbsCbs] =
    useState(
      cte?.classificacaoTributariaIbsCbs ??
        ""
    );
  const [baseCalculoIbsCbs, setBaseCalculoIbsCbs] =
    useState(
      numeroOuVazio(
        cte?.baseCalculoIbsCbs
      )
    );
  const [aliquotaIbsUf, setAliquotaIbsUf] =
    useState(
      numeroOuVazio(cte?.aliquotaIbsUf)
    );
  const [valorIbsUf, setValorIbsUf] =
    useState(
      numeroOuVazio(cte?.valorIbsUf)
    );
  const [aliquotaIbsMunicipio, setAliquotaIbsMunicipio] =
    useState(
      numeroOuVazio(
        cte?.aliquotaIbsMunicipio
      )
    );
  const [valorIbsMunicipio, setValorIbsMunicipio] =
    useState(
      numeroOuVazio(
        cte?.valorIbsMunicipio
      )
    );
  const [valorIbs, setValorIbs] =
    useState(numeroOuVazio(cte?.valorIbs));
  const [aliquotaCbs, setAliquotaCbs] =
    useState(
      numeroOuVazio(cte?.aliquotaCbs)
    );
  const [valorCbs, setValorCbs] =
    useState(numeroOuVazio(cte?.valorCbs));
  const [valorTotalDfe, setValorTotalDfe] =
    useState(
      numeroOuVazio(cte?.valorTotalDfe)
    );

  const [informacoesAdicionais, setInformacoesAdicionais] =
    useState(
      cte?.informacoesAdicionais ?? ""
    );
  const [informacoesFisco, setInformacoesFisco] =
    useState(cte?.informacoesFisco ?? "");

  const clientesCompletos = useMemo(
    () =>
      clientes.map((cliente) => ({
        ...cliente,
        incompleto:
          !cliente.logradouro ||
          !cliente.numero ||
          !cliente.bairro ||
          !cliente.codigoMunicipio ||
          !cliente.municipio ||
          !cliente.uf,
      })),
    [clientes]
  );

  function valorNumero(valor: string) {
    if (!valor.trim()) return null;
    const numero = Number(
      valor.replace(",", ".")
    );
    return Number.isFinite(numero)
      ? numero
      : null;
  }

  function selecionarDestinatario(
    clienteId: string
  ) {
    setDestinatarioId(clienteId);

    const cliente = clientes.find(
      (item) => item.id === clienteId
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

  function selecionarRemetente(
    clienteId: string
  ) {
    setRemetenteId(clienteId);

    const cliente = clientes.find(
      (item) => item.id === clienteId
    );

    if (
      cliente?.codigoMunicipio &&
      cliente.municipio &&
      cliente.uf
    ) {
      setCodigoMunicipioInicio(
        cliente.codigoMunicipio
      );
      setMunicipioInicio(cliente.municipio);
      setUfInicio(cliente.uf);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setErro("");

    const prestacao =
      valorNumero(valorPrestacao);
    const receber =
      valorNumero(valorReceber) ??
      prestacao;
    const carga = valorNumero(valorCarga);
    const quantidadeNumero =
      valorNumero(quantidade);

    if (
      prestacao === null ||
      prestacao <= 0 ||
      carga === null ||
      carga <= 0 ||
      quantidadeNumero === null ||
      quantidadeNumero <= 0
    ) {
      setErro(
        "Informe valores válidos para prestação, carga e quantidade."
      );
      return;
    }

    const componentes =
      parseComponentes(componentesTexto);

    try {
      setSalvando(true);

      const resultado = await salvarCte({
        empresaId,
        cteId: cte?.id,
        tipoServico:
          tipoServico as "NORMAL",
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
          valorNumero(
            valorCargaAverbacao
          ),
        produtoPredominante,
        outrasCaracteristicasCarga:
          outrasCaracteristicas,
        rntrc,
        chavesNfe: chavesNfe
          .split(/\s+/)
          .map(numeros)
          .filter(Boolean),
        quantidadesCarga: [
          {
            unidade,
            tipoMedida,
            quantidade:
              quantidadeNumero,
          },
        ],
        componentesValor:
          componentes.length > 0
            ? componentes
            : [
                {
                  nome: "FRETE",
                  valor: prestacao,
                },
              ],
        grupoIcms,
        cstIcms,
        percentualReducaoBc:
          valorNumero(
            percentualReducaoBc
          ),
        baseCalculoIcms:
          valorNumero(baseCalculoIcms),
        aliquotaIcms:
          valorNumero(aliquotaIcms),
        valorIcms:
          valorNumero(valorIcms),
        valorCreditoIcms:
          valorNumero(valorCreditoIcms),
        baseCalculoStRetido:
          valorNumero(
            baseCalculoStRetido
          ),
        aliquotaStRetido:
          valorNumero(aliquotaStRetido),
        valorIcmsStRetido:
          valorNumero(
            valorIcmsStRetido
          ),
        codigoBeneficioFiscal,
        valorTotalTributos:
          valorNumero(
            valorTotalTributos
          ),
        baseCalculoUfFim:
          valorNumero(baseCalculoUfFim),
        percentualFcpUfFim:
          valorNumero(
            percentualFcpUfFim
          ),
        percentualIcmsUfFim:
          valorNumero(
            percentualIcmsUfFim
          ),
        percentualIcmsInterestadual:
          valorNumero(
            percentualIcmsInterestadual
          ),
        valorFcpUfFim:
          valorNumero(valorFcpUfFim),
        valorIcmsUfFim:
          valorNumero(valorIcmsUfFim),
        valorIcmsUfInicio:
          valorNumero(
            valorIcmsUfInicio
          ),
        cstIbsCbs,
        classificacaoTributariaIbsCbs:
          classificacaoIbsCbs,
        baseCalculoIbsCbs:
          valorNumero(baseCalculoIbsCbs),
        aliquotaIbsUf:
          valorNumero(aliquotaIbsUf),
        valorIbsUf:
          valorNumero(valorIbsUf),
        aliquotaIbsMunicipio:
          valorNumero(
            aliquotaIbsMunicipio
          ),
        valorIbsMunicipio:
          valorNumero(
            valorIbsMunicipio
          ),
        valorIbs:
          valorNumero(valorIbs),
        aliquotaCbs:
          valorNumero(aliquotaCbs),
        valorCbs:
          valorNumero(valorCbs),
        valorTotalDfe:
          valorNumero(valorTotalDfe),
        informacoesAdicionais,
        informacoesFisco,
      });

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      router.push(
        `/empresa/${empresaId}/cte/${resultado.cteId}`
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao salvar CT-e:",
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {!configuracao && (
        <Aviso>
          A configuração fiscal ainda não foi criada. Configure ambiente, série do CT-e e RNTRC antes da emissão.
        </Aviso>
      )}

      <Secao
        titulo="Identificação da prestação"
        descricao="Dados gerais e percurso do CT-e modelo 57."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Campo label="Tipo de serviço">
            <select
              value={tipoServico}
              onChange={(e) =>
                setTipoServico(e.target.value)
              }
              disabled={somenteLeitura}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="NORMAL">Normal</option>
              <option value="SUBCONTRATACAO">Subcontratação</option>
              <option value="REDESPACHO">Redespacho</option>
              <option value="REDESPACHO_INTERMEDIARIO">Redespacho intermediário</option>
              <option value="SERVICO_VINCULADO_MULTIMODAL">Serviço vinculado a multimodal</option>
            </select>
          </Campo>

          <Campo label="CFOP">
            <Input
              value={cfop}
              onChange={(e) =>
                setCfop(
                  numeros(e.target.value).slice(0, 4)
                )
              }
              maxLength={4}
              disabled={somenteLeitura}
              placeholder="5353"
            />
          </Campo>

          <Campo
            label="Natureza da prestação"
            className="md:col-span-2"
          >
            <Input
              value={naturezaOperacao}
              onChange={(e) =>
                setNaturezaOperacao(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Municipio
            titulo="Envio do CT-e"
            codigo={codigoMunicipioEnvio}
            municipio={municipioEnvio}
            uf={ufEnvio}
            onCodigo={setCodigoMunicipioEnvio}
            onMunicipio={setMunicipioEnvio}
            onUf={setUfEnvio}
            disabled={somenteLeitura}
          />
          <Municipio
            titulo="Início da prestação"
            codigo={codigoMunicipioInicio}
            municipio={municipioInicio}
            uf={ufInicio}
            onCodigo={setCodigoMunicipioInicio}
            onMunicipio={setMunicipioInicio}
            onUf={setUfInicio}
            disabled={somenteLeitura}
          />
          <Municipio
            titulo="Fim da prestação"
            codigo={codigoMunicipioFim}
            municipio={municipioFim}
            uf={ufFim}
            onCodigo={setCodigoMunicipioFim}
            onMunicipio={setMunicipioFim}
            onUf={setUfFim}
            disabled={somenteLeitura}
          />
        </div>
      </Secao>

      <Secao
        titulo="Participantes"
        descricao="Selecione os clientes que participam da prestação. O CT-e guarda uma cópia dos dados fiscais e do endereço."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SelecaoCliente
            label="Remetente *"
            value={remetenteId}
            clientes={clientesCompletos}
            onChange={selecionarRemetente}
            disabled={somenteLeitura}
          />
          <SelecaoCliente
            label="Destinatário *"
            value={destinatarioId}
            clientes={clientesCompletos}
            onChange={selecionarDestinatario}
            disabled={somenteLeitura}
          />
          <Campo label="Tomador do serviço">
            <select
              value={tomador}
              onChange={(e) =>
                setTomador(
                  e.target.value as TomadorServicoCteForm
                )
              }
              disabled={somenteLeitura}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="REMETENTE">Remetente</option>
              <option value="EXPEDIDOR">Expedidor</option>
              <option value="RECEBEDOR">Recebedor</option>
              <option value="DESTINATARIO">Destinatário</option>
              <option value="OUTROS">Outros</option>
            </select>
          </Campo>
          <SelecaoCliente
            label="Expedidor (opcional)"
            value={expedidorId}
            clientes={clientesCompletos}
            onChange={setExpedidorId}
            disabled={somenteLeitura}
          />
          <SelecaoCliente
            label="Recebedor (opcional)"
            value={recebedorId}
            clientes={clientesCompletos}
            onChange={setRecebedorId}
            disabled={somenteLeitura}
          />
          {tomador === "OUTROS" && (
            <SelecaoCliente
              label="Outro tomador *"
              value={tomadorOutrosId}
              clientes={clientesCompletos}
              onChange={setTomadorOutrosId}
              disabled={somenteLeitura}
            />
          )}
        </div>
      </Secao>

      <Secao
        titulo="Documentos transportados"
        descricao="Informe as chaves das NF-e vinculadas ao transporte, uma por linha."
      >
        <textarea
          value={chavesNfe}
          onChange={(e) =>
            setChavesNfe(e.target.value)
          }
          disabled={somenteLeitura}
          rows={5}
          placeholder="4426... (44 dígitos)"
          className="w-full rounded-xl border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-70"
        />
      </Secao>

      <Secao
        titulo="Carga"
        descricao="Valores e medidas da carga transportada."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Campo label="Valor da carga *">
            <Input
              inputMode="decimal"
              value={valorCarga}
              onChange={(e) =>
                setValorCarga(e.target.value)
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Valor para averbação">
            <Input
              inputMode="decimal"
              value={valorCargaAverbacao}
              onChange={(e) =>
                setValorCargaAverbacao(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo
            label="Produto predominante *"
            className="md:col-span-2"
          >
            <Input
              value={produtoPredominante}
              onChange={(e) =>
                setProdutoPredominante(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Unidade da medida">
            <select
              value={unidade}
              onChange={(e) =>
                setUnidade(
                  e.target.value as UnidadeMedidaCteForm
                )
              }
              disabled={somenteLeitura}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              {unidades.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Tipo da medida">
            <Input
              value={tipoMedida}
              onChange={(e) =>
                setTipoMedida(e.target.value)
              }
              disabled={somenteLeitura}
              placeholder="PESO BRUTO"
            />
          </Campo>
          <Campo label="Quantidade *">
            <Input
              inputMode="decimal"
              value={quantidade}
              onChange={(e) =>
                setQuantidade(e.target.value)
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="RNTRC *">
            <Input
              value={rntrc}
              onChange={(e) =>
                setRntrc(e.target.value)
              }
              disabled={somenteLeitura}
              placeholder="8 dígitos ou ISENTO"
            />
          </Campo>
          <Campo
            label="Outras características da carga"
            className="md:col-span-2 xl:col-span-4"
          >
            <Input
              value={outrasCaracteristicas}
              onChange={(e) =>
                setOutrasCaracteristicas(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
        </div>
      </Secao>

      <Secao
        titulo="Valores da prestação"
        descricao="Valor total, valor a receber e composição do frete."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Campo label="Valor da prestação *">
            <Input
              inputMode="decimal"
              value={valorPrestacao}
              onChange={(e) =>
                setValorPrestacao(e.target.value)
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Valor a receber">
            <Input
              inputMode="decimal"
              value={valorReceber}
              onChange={(e) =>
                setValorReceber(e.target.value)
              }
              disabled={somenteLeitura}
              placeholder="Igual à prestação se vazio"
            />
          </Campo>
          <Campo label="Tributos aproximados">
            <Input
              inputMode="decimal"
              value={valorTotalTributos}
              onChange={(e) =>
                setValorTotalTributos(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
        </div>

        <Campo
          label="Componentes do frete"
          ajuda="Um por linha no formato NOME=VALOR. Se ficar vazio, o sistema cria FRETE com o valor total da prestação."
          className="mt-4"
        >
          <textarea
            value={componentesTexto}
            onChange={(e) =>
              setComponentesTexto(
                e.target.value
              )
            }
            disabled={somenteLeitura}
            rows={4}
            placeholder={"FRETE PESO=1000,00\nPEDÁGIO=50,00"}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-70"
          />
        </Campo>
      </Secao>

      <Secao
        titulo="ICMS"
        descricao="Tributação estadual da prestação de transporte."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Campo label="Grupo do ICMS">
            <select
              value={grupoIcms}
              onChange={(e) =>
                setGrupoIcms(
                  e.target.value as GrupoIcmsCteForm
                )
              }
              disabled={somenteLeitura}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="ICMSSN">Simples Nacional</option>
              <option value="ICMS00">ICMS 00</option>
              <option value="ICMS20">ICMS 20</option>
              <option value="ICMS45">ICMS 40/41/51</option>
              <option value="ICMS60">ICMS 60</option>
              <option value="ICMS90">ICMS 90</option>
              <option value="ICMS_OUTRA_UF">ICMS outra UF</option>
            </select>
          </Campo>
          <Campo label="CST">
            <Input
              value={cstIcms}
              onChange={(e) =>
                setCstIcms(
                  numeros(e.target.value).slice(0, 2)
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Base de cálculo">
            <Input
              inputMode="decimal"
              value={baseCalculoIcms}
              onChange={(e) =>
                setBaseCalculoIcms(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Alíquota (%)">
            <Input
              inputMode="decimal"
              value={aliquotaIcms}
              onChange={(e) =>
                setAliquotaIcms(e.target.value)
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Valor do ICMS">
            <Input
              inputMode="decimal"
              value={valorIcms}
              onChange={(e) =>
                setValorIcms(e.target.value)
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Redução BC (%)">
            <Input
              inputMode="decimal"
              value={percentualReducaoBc}
              onChange={(e) =>
                setPercentualReducaoBc(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Crédito outorgado">
            <Input
              inputMode="decimal"
              value={valorCreditoIcms}
              onChange={(e) =>
                setValorCreditoIcms(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Código benefício fiscal">
            <Input
              value={codigoBeneficioFiscal}
              onChange={(e) =>
                setCodigoBeneficioFiscal(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="BC ST retido">
            <Input
              inputMode="decimal"
              value={baseCalculoStRetido}
              onChange={(e) =>
                setBaseCalculoStRetido(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Alíquota ST retido (%)">
            <Input
              inputMode="decimal"
              value={aliquotaStRetido}
              onChange={(e) =>
                setAliquotaStRetido(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
          <Campo label="Valor ICMS ST retido">
            <Input
              inputMode="decimal"
              value={valorIcmsStRetido}
              onChange={(e) =>
                setValorIcmsStRetido(
                  e.target.value
                )
              }
              disabled={somenteLeitura}
            />
          </Campo>
        </div>
      </Secao>

      <Secao
        titulo="ICMS partilha / FCP"
        descricao="Preencha somente quando a operação exigir o grupo ICMSUFFim."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Campo label="BC UF fim">
            <Input inputMode="decimal" value={baseCalculoUfFim} onChange={(e) => setBaseCalculoUfFim(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="FCP UF fim (%)">
            <Input inputMode="decimal" value={percentualFcpUfFim} onChange={(e) => setPercentualFcpUfFim(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="ICMS UF fim (%)">
            <Input inputMode="decimal" value={percentualIcmsUfFim} onChange={(e) => setPercentualIcmsUfFim(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="ICMS interestadual (%)">
            <Input inputMode="decimal" value={percentualIcmsInterestadual} onChange={(e) => setPercentualIcmsInterestadual(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor FCP UF fim">
            <Input inputMode="decimal" value={valorFcpUfFim} onChange={(e) => setValorFcpUfFim(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor ICMS UF fim">
            <Input inputMode="decimal" value={valorIcmsUfFim} onChange={(e) => setValorIcmsUfFim(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor ICMS UF início">
            <Input inputMode="decimal" value={valorIcmsUfInicio} onChange={(e) => setValorIcmsUfInicio(e.target.value)} disabled={somenteLeitura} />
          </Campo>
        </div>
      </Secao>

      <Secao
        titulo="IBS e CBS"
        descricao="Grupo da Reforma Tributária do Consumo. Preencha quando aplicável à tributação do documento."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Campo label="CST IBS/CBS">
            <Input value={cstIbsCbs} onChange={(e) => setCstIbsCbs(numeros(e.target.value).slice(0, 3))} disabled={somenteLeitura} placeholder="000" />
          </Campo>
          <Campo label="Classificação tributária">
            <Input value={classificacaoIbsCbs} onChange={(e) => setClassificacaoIbsCbs(numeros(e.target.value).slice(0, 6))} disabled={somenteLeitura} placeholder="000001" />
          </Campo>
          <Campo label="Base IBS/CBS">
            <Input inputMode="decimal" value={baseCalculoIbsCbs} onChange={(e) => setBaseCalculoIbsCbs(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Alíquota IBS UF (%)">
            <Input inputMode="decimal" value={aliquotaIbsUf} onChange={(e) => setAliquotaIbsUf(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor IBS UF">
            <Input inputMode="decimal" value={valorIbsUf} onChange={(e) => setValorIbsUf(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Alíquota IBS Município (%)">
            <Input inputMode="decimal" value={aliquotaIbsMunicipio} onChange={(e) => setAliquotaIbsMunicipio(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor IBS Município">
            <Input inputMode="decimal" value={valorIbsMunicipio} onChange={(e) => setValorIbsMunicipio(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor IBS total">
            <Input inputMode="decimal" value={valorIbs} onChange={(e) => setValorIbs(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Alíquota CBS (%)">
            <Input inputMode="decimal" value={aliquotaCbs} onChange={(e) => setAliquotaCbs(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor CBS">
            <Input inputMode="decimal" value={valorCbs} onChange={(e) => setValorCbs(e.target.value)} disabled={somenteLeitura} />
          </Campo>
          <Campo label="Valor total do DFe">
            <Input inputMode="decimal" value={valorTotalDfe} onChange={(e) => setValorTotalDfe(e.target.value)} disabled={somenteLeitura} />
          </Campo>
        </div>
      </Secao>

      <Secao
        titulo="Informações adicionais"
        descricao="Observações do contribuinte e informações de interesse do Fisco."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Campo label="Informações do contribuinte">
            <textarea
              value={informacoesAdicionais}
              onChange={(e) => setInformacoesAdicionais(e.target.value)}
              disabled={somenteLeitura}
              rows={5}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-70"
            />
          </Campo>
          <Campo label="Informações do Fisco">
            <textarea
              value={informacoesFisco}
              onChange={(e) => setInformacoesFisco(e.target.value)}
              disabled={somenteLeitura}
              rows={5}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-70"
            />
          </Campo>
        </div>
      </Secao>

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>

        {!somenteLeitura && (
          <Button
            type="submit"
            size="lg"
            disabled={salvando}
          >
            {salvando ? (
              <LoaderCircle
                className="animate-spin"
              />
            ) : (
              <Save />
            )}
            {salvando
              ? "Salvando..."
              : "Salvar CT-e"}
          </Button>
        )}
      </div>
    </form>
  );
}

function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold">
          {titulo}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {descricao}
        </p>
      </div>
      {children}
    </section>
  );
}

function Campo({
  label,
  ajuda,
  className = "",
  children,
}: {
  label: string;
  ajuda?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">
        {label}
      </label>
      {children}
      {ajuda && (
        <p className="text-xs leading-5 text-muted-foreground">
          {ajuda}
        </p>
      )}
    </div>
  );
}

function SelecaoCliente({
  label,
  value,
  clientes,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  clientes: Array<
    Cliente & { incompleto: boolean }
  >;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <Campo label={label}>
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        disabled={disabled}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
      >
        <option value="">
          Selecione...
        </option>
        {clientes.map((cliente) => (
          <option
            key={cliente.id}
            value={cliente.id}
          >
            {cliente.nome} — {cliente.cpfCnpj}
            {cliente.incompleto
              ? " (cadastro incompleto)"
              : ""}
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
  disabled,
}: {
  titulo: string;
  codigo: string;
  municipio: string;
  uf: string;
  onCodigo: (valor: string) => void;
  onMunicipio: (valor: string) => void;
  onUf: (valor: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="mb-3 text-sm font-semibold">
        {titulo}
      </p>
      <div className="space-y-3">
        <Input
          placeholder="Código IBGE"
          value={codigo}
          onChange={(e) =>
            onCodigo(
              numeros(e.target.value).slice(0, 7)
            )
          }
          disabled={disabled}
        />
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Input
            placeholder="Município"
            value={municipio}
            onChange={(e) =>
              onMunicipio(e.target.value)
            }
            disabled={disabled}
          />
          <Input
            placeholder="UF"
            maxLength={2}
            value={uf}
            onChange={(e) =>
              onUf(
                e.target.value
                  .toUpperCase()
                  .slice(0, 2)
              )
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

function Aviso({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
      {children}
    </div>
  );
}

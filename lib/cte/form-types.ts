export type TipoServicoCteForm =
  | "NORMAL"
  | "SUBCONTRATACAO"
  | "REDESPACHO"
  | "REDESPACHO_INTERMEDIARIO"
  | "SERVICO_VINCULADO_MULTIMODAL";

export type TomadorServicoCteForm =
  | "REMETENTE"
  | "EXPEDIDOR"
  | "RECEBEDOR"
  | "DESTINATARIO"
  | "OUTROS";

export type UnidadeMedidaCteForm =
  | "METRO_CUBICO"
  | "QUILOGRAMA"
  | "TONELADA"
  | "UNIDADE"
  | "LITRO"
  | "MMBTU";

export type GrupoIcmsCteForm =
  | "ICMS00"
  | "ICMS20"
  | "ICMS45"
  | "ICMS60"
  | "ICMS90"
  | "ICMS_OUTRA_UF"
  | "ICMSSN";

export type QuantidadeCargaCteForm = {
  unidade: UnidadeMedidaCteForm;
  tipoMedida: string;
  quantidade: number;
};

export type ComponenteValorCteForm = {
  nome: string;
  valor: number;
};

export type PagamentoVinculadoCteForm = {
  numeroPagamento: number;
  idTransacao: string;
  tipoMeioPagamento: string;
  cnpjRecebedor: string;
  cnpjBasePsp: string;
};

export type SalvarCteData = {
  empresaId: string;
  cteId?: string;

  tipoServico: TipoServicoCteForm;
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

  tomadorServico: TomadorServicoCteForm;

  remetenteClienteId: string;
  destinatarioClienteId: string;
  expedidorClienteId?: string;
  recebedorClienteId?: string;
  tomadorOutrosClienteId?: string;

  valorPrestacao: number;
  valorReceber: number;
  valorCarga: number;
  valorCargaAverbacao?: number | null;
  produtoPredominante: string;
  outrasCaracteristicasCarga?: string;
  rntrc?: string;

  chavesNfe: string[];
  quantidadesCarga: QuantidadeCargaCteForm[];
  componentesValor: ComponenteValorCteForm[];
  pagamentosVinculados?: PagamentoVinculadoCteForm[];

  grupoIcms: GrupoIcmsCteForm;
  cstIcms: string;
  percentualReducaoBc?: number | null;
  baseCalculoIcms?: number | null;
  aliquotaIcms?: number | null;
  valorIcms?: number | null;
  valorCreditoIcms?: number | null;
  baseCalculoStRetido?: number | null;
  aliquotaStRetido?: number | null;
  valorIcmsStRetido?: number | null;
  codigoBeneficioFiscal?: string;
  valorTotalTributos?: number | null;

  baseCalculoUfFim?: number | null;
  percentualFcpUfFim?: number | null;
  percentualIcmsUfFim?: number | null;
  percentualIcmsInterestadual?: number | null;
  valorFcpUfFim?: number | null;
  valorIcmsUfFim?: number | null;
  valorIcmsUfInicio?: number | null;

  cstIbsCbs?: string;
  classificacaoTributariaIbsCbs?: string;
  baseCalculoIbsCbs?: number | null;
  aliquotaIbsUf?: number | null;
  valorIbsUf?: number | null;
  aliquotaIbsMunicipio?: number | null;
  valorIbsMunicipio?: number | null;
  valorIbs?: number | null;
  aliquotaCbs?: number | null;
  valorCbs?: number | null;
  valorTotalDfe?: number | null;

  informacoesAdicionais?: string;
  informacoesFisco?: string;
};

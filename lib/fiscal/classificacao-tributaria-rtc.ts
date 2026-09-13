import { prisma } from "@/lib/prisma";

export const CHAVE_CACHE_CLASS_TRIB_RTC =
  "classTrib";

export const FONTE_CLASS_TRIB_RTC =
  "SVRS Conformidade Facil";

export type ClassificacaoTributariaRtc = {
  cst: string;
  codigo: string;
  descricao: string;
  permiteNfe: boolean | null;
  tipoAliquota: string | null;
  reducaoIbs: number | null;
  reducaoCbs: number | null;

  indGIBSCBS: boolean | null;
  indGIBSCBSMono: boolean | null;
  indGTransfCred: boolean | null;
  indGAjusteCompet: boolean | null;
  indGRed: boolean | null;
  indGDif: boolean | null;

  indGTribRegular: boolean | null;
  indCredPres: boolean | null;
  indRedutorBc: boolean | null;

  indMonoPadrao: boolean | null;
  indMonoReten: boolean | null;
  indMonoRet: boolean | null;
  indMonoDif: boolean | null;
};

type ObjetoJson = Record<string, unknown>;

type ContextoCst = Pick<
  ClassificacaoTributariaRtc,
  | "indGIBSCBS"
  | "indGIBSCBSMono"
  | "indGTransfCred"
  | "indGAjusteCompet"
  | "indGRed"
  | "indGDif"
> & {
  cst: string | null;
};

const CONTEXTO_VAZIO: ContextoCst = {
  cst: null,
  indGIBSCBS: null,
  indGIBSCBSMono: null,
  indGTransfCred: null,
  indGAjusteCompet: null,
  indGRed: null,
  indGDif: null,
};

function objetoJson(
  valor: unknown
): valor is ObjetoJson {
  return (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

function normalizarChave(
  valor: string
) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function entradasNormalizadas(
  objeto: ObjetoJson
) {
  return Object.entries(objeto).map(
    ([chave, valor]) => ({
      chave: normalizarChave(chave),
      valor,
    })
  );
}

function textoPorChaves(
  objeto: ObjetoJson,
  chaves: string[]
) {
  const procuradas = new Set(
    chaves.map(normalizarChave)
  );

  const entrada =
    entradasNormalizadas(objeto).find(
      (item) =>
        procuradas.has(item.chave) &&
        (typeof item.valor === "string" ||
          typeof item.valor === "number")
    );

  if (!entrada) {
    return null;
  }

  const texto = String(
    entrada.valor
  ).trim();

  return texto || null;
}

function converterBooleano(
  valor: unknown
): boolean | null {
  if (typeof valor === "boolean") {
    return valor;
  }

  if (typeof valor === "number") {
    if (valor === 1) return true;
    if (valor === 0) return false;
  }

  if (typeof valor === "string") {
    const texto = valor
      .trim()
      .toLowerCase();

    if (
      ["1", "true", "sim", "s", "x"].includes(
        texto
      )
    ) {
      return true;
    }

    if (
      ["0", "false", "nao", "não", "n", ""].includes(
        texto
      )
    ) {
      return false;
    }
  }

  return null;
}

function booleanoPorChaves(
  objeto: ObjetoJson,
  chaves: string[]
) {
  const procuradas = new Set(
    chaves.map(normalizarChave)
  );

  const entrada =
    entradasNormalizadas(objeto).find(
      (item) =>
        procuradas.has(item.chave)
    );

  return entrada
    ? converterBooleano(entrada.valor)
    : null;
}

function numeroPorPadraoDeChave(
  objeto: ObjetoJson,
  contem: string[]
) {
  const termos = contem.map(
    normalizarChave
  );

  for (const entrada of
    entradasNormalizadas(objeto)) {
    if (
      !termos.every((termo) =>
        entrada.chave.includes(termo)
      )
    ) {
      continue;
    }

    const numero = Number(
      String(entrada.valor)
        .replace(",", ".")
    );

    if (Number.isFinite(numero)) {
      return numero;
    }
  }

  return null;
}

function detectarPermissaoNfe(
  objeto: ObjetoJson
) {
  const explicita = booleanoPorChaves(
    objeto,
    [
      "indNFe",
      "ind_nfe",
      "permiteNfe",
      "nfe",
    ]
  );

  if (explicita !== null) {
    return explicita;
  }

  const candidatas =
    entradasNormalizadas(objeto).filter(
      (item) =>
        item.chave.includes("dfe") ||
        item.chave.includes("document") ||
        item.chave.includes("modelo")
    );

  if (candidatas.length === 0) {
    return null;
  }

  const texto = candidatas
    .map((item) =>
      typeof item.valor === "string"
        ? item.valor
        : JSON.stringify(item.valor)
    )
    .join(" ")
    .toUpperCase();

  if (
    /\bNFE\b/.test(texto) ||
    /\b55\b/.test(texto)
  ) {
    return true;
  }

  return false;
}

function obterCodigoClassificacao(
  objeto: ObjetoJson,
  cstHerdado: string | null
) {
  const codigoExplicito =
    textoPorChaves(objeto, [
      "cClassTrib",
      "codigoClassTrib",
      "codigoClassificacaoTributaria",
      "classTrib",
    ]);

  if (
    codigoExplicito &&
    /^\d{6}$/.test(codigoExplicito)
  ) {
    return codigoExplicito;
  }

  const codigoGenerico =
    textoPorChaves(objeto, [
      "codigo",
      "cod",
    ]);

  if (
    codigoGenerico &&
    /^\d{6}$/.test(codigoGenerico) &&
    (!cstHerdado ||
      codigoGenerico.startsWith(
        cstHerdado
      ))
  ) {
    return codigoGenerico;
  }

  return null;
}

function obterCst(
  objeto: ObjetoJson,
  cstHerdado: string | null
) {
  const candidato = textoPorChaves(
    objeto,
    [
      "cst",
      "codigoCst",
      "codCst",
    ]
  );

  if (
    candidato &&
    /^\d{3}$/.test(candidato)
  ) {
    return candidato;
  }

  return cstHerdado;
}

function primeiroBooleano(
  ...valores: Array<boolean | null>
) {
  return valores.find(
    (valor) => valor !== null
  ) ?? null;
}

function atualizarContextoCst(
  objeto: ObjetoJson,
  anterior: ContextoCst
): ContextoCst {
  return {
    cst: obterCst(
      objeto,
      anterior.cst
    ),
    indGIBSCBS: primeiroBooleano(
      booleanoPorChaves(objeto, [
        "ind_gIBSCBS",
        "indGIBSCBS",
      ]),
      anterior.indGIBSCBS
    ),
    indGIBSCBSMono: primeiroBooleano(
      booleanoPorChaves(objeto, [
        "ind_gIBSCBSMono",
        "indGIBSCBSMono",
      ]),
      anterior.indGIBSCBSMono
    ),
    indGTransfCred: primeiroBooleano(
      booleanoPorChaves(objeto, [
        "ind_gTransfCred",
        "indGTransfCred",
      ]),
      anterior.indGTransfCred
    ),
    indGAjusteCompet: primeiroBooleano(
      booleanoPorChaves(objeto, [
        "ind_gAjusteCompet",
        "indGAjusteCompet",
      ]),
      anterior.indGAjusteCompet
    ),
    indGRed: primeiroBooleano(
      booleanoPorChaves(objeto, [
        "ind_gRed",
        "indGRed",
      ]),
      anterior.indGRed
    ),
    indGDif: primeiroBooleano(
      booleanoPorChaves(objeto, [
        "ind_gDif",
        "indGDif",
      ]),
      anterior.indGDif
    ),
  };
}

export function extrairClassificacoesRtc(
  payload: unknown
): ClassificacaoTributariaRtc[] {
  const encontrados = new Map<
    string,
    ClassificacaoTributariaRtc
  >();

  function percorrer(
    valor: unknown,
    contexto: ContextoCst
  ) {
    if (Array.isArray(valor)) {
      for (const item of valor) {
        percorrer(item, contexto);
      }
      return;
    }

    if (!objetoJson(valor)) {
      return;
    }

    const contextoLocal =
      atualizarContextoCst(
        valor,
        contexto
      );

    const codigo =
      obterCodigoClassificacao(
        valor,
        contextoLocal.cst
      );

    if (codigo) {
      const cst =
        contextoLocal.cst ??
        codigo.slice(0, 3);

      const descricao =
        textoPorChaves(valor, [
          "descricaoReduzida",
          "descricao",
          "nome",
          "descricaoClassTrib",
        ]) ??
        `Classificação ${codigo}`;

      encontrados.set(codigo, {
        cst,
        codigo,
        descricao,
        permiteNfe:
          detectarPermissaoNfe(valor),
        tipoAliquota:
          textoPorChaves(valor, [
            "tipoAliquota",
            "tpAliquota",
          ]),
        reducaoIbs:
          numeroPorPadraoDeChave(
            valor,
            ["red", "ibs"]
          ),
        reducaoCbs:
          numeroPorPadraoDeChave(
            valor,
            ["red", "cbs"]
          ),

        indGIBSCBS:
          contextoLocal.indGIBSCBS,
        indGIBSCBSMono:
          contextoLocal.indGIBSCBSMono,
        indGTransfCred:
          contextoLocal.indGTransfCred,
        indGAjusteCompet:
          contextoLocal.indGAjusteCompet,
        indGRed:
          contextoLocal.indGRed,
        indGDif:
          contextoLocal.indGDif,

        indGTribRegular:
          booleanoPorChaves(valor, [
            "ind_gTribRegular",
            "indGTribRegular",
            "indTribRegular",
          ]),
        indCredPres:
          booleanoPorChaves(valor, [
            "ind_CredPres",
            "indCredPres",
            "ind_gCredPresOper",
          ]),
        indRedutorBc:
          booleanoPorChaves(valor, [
            "ind_RedutorBC",
            "indRedutorBC",
          ]),
        indMonoPadrao:
          booleanoPorChaves(valor, [
            "indMonoPadrao",
          ]),
        indMonoReten:
          booleanoPorChaves(valor, [
            "indMonoReten",
          ]),
        indMonoRet:
          booleanoPorChaves(valor, [
            "indMonoRet",
          ]),
        indMonoDif:
          booleanoPorChaves(valor, [
            "indMonoDif",
          ]),
      });
    }

    for (const filho of
      Object.values(valor)) {
      if (
        typeof filho === "object" &&
        filho !== null
      ) {
        percorrer(
          filho,
          contextoLocal
        );
      }
    }
  }

  percorrer(
    payload,
    CONTEXTO_VAZIO
  );

  return [...encontrados.values()].sort(
    (a, b) =>
      a.codigo.localeCompare(b.codigo)
  );
}

export async function salvarTabelaClassTribRtc(
  payload: unknown,
  versaoFonte?: string | null
) {
  const agora = new Date();

  await prisma.tabelaRtcCache.upsert({
    where: {
      chave: CHAVE_CACHE_CLASS_TRIB_RTC,
    },
    create: {
      chave: CHAVE_CACHE_CLASS_TRIB_RTC,
      fonte: FONTE_CLASS_TRIB_RTC,
      versaoFonte:
        versaoFonte?.trim() || null,
      conteudoJson:
        JSON.stringify(payload),
      atualizadoEm: agora,
    },
    update: {
      fonte: FONTE_CLASS_TRIB_RTC,
      versaoFonte:
        versaoFonte?.trim() || null,
      conteudoJson:
        JSON.stringify(payload),
      atualizadoEm: agora,
    },
  });

  return agora;
}

export async function obterTabelaClassTribRtc() {
  const cache =
    await prisma.tabelaRtcCache.findUnique({
      where: {
        chave: CHAVE_CACHE_CLASS_TRIB_RTC,
      },
    });

  if (!cache) {
    return null;
  }

  let payload: unknown;

  try {
    payload = JSON.parse(
      cache.conteudoJson
    );
  } catch {
    return null;
  }

  return {
    classificacoes:
      extrairClassificacoesRtc(
        payload
      ),
    atualizadoEm:
      cache.atualizadoEm,
    fonte: cache.fonte,
    versaoFonte:
      cache.versaoFonte,
  };
}

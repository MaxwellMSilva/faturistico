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
  tributacaoRegular: boolean | null;
};

type ObjetoJson = Record<string, unknown>;

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

function booleanoPorPadraoDeChave(
  objeto: ObjetoJson,
  contem: string[]
) {
  const termos = contem.map(
    normalizarChave
  );

  const entrada =
    entradasNormalizadas(objeto).find(
      (item) =>
        termos.every((termo) =>
          item.chave.includes(termo)
        )
    );

  if (!entrada) {
    return null;
  }

  if (
    typeof entrada.valor === "boolean"
  ) {
    return entrada.valor;
  }

  if (
    typeof entrada.valor === "number"
  ) {
    return entrada.valor !== 0;
  }

  if (
    typeof entrada.valor === "string"
  ) {
    const texto = entrada.valor
      .trim()
      .toLowerCase();

    if (
      ["1", "true", "sim", "s"].includes(
        texto
      )
    ) {
      return true;
    }

    if (
      ["0", "false", "nao", "não", "n"].includes(
        texto
      )
    ) {
      return false;
    }
  }

  return null;
}

function detectarPermissaoNfe(
  objeto: ObjetoJson
) {
  const entradas =
    entradasNormalizadas(objeto);

  const candidatas = entradas.filter(
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

  if (/\bNFE\b/.test(texto)) {
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

export function extrairClassificacoesRtc(
  payload: unknown
): ClassificacaoTributariaRtc[] {
  const encontrados = new Map<
    string,
    ClassificacaoTributariaRtc
  >();

  function percorrer(
    valor: unknown,
    cstHerdado: string | null
  ) {
    if (Array.isArray(valor)) {
      for (const item of valor) {
        percorrer(item, cstHerdado);
      }
      return;
    }

    if (!objetoJson(valor)) {
      return;
    }

    const cstLocal = obterCst(
      valor,
      cstHerdado
    );

    const codigo =
      obterCodigoClassificacao(
        valor,
        cstLocal
      );

    if (codigo) {
      const cst =
        cstLocal ?? codigo.slice(0, 3);

      const descricao =
        textoPorChaves(valor, [
          "descricaoReduzida",
          "descricao",
          "nome",
          "descricaoClassTrib",
        ]) ??
        `Classificacao ${codigo}`;

      const tipoAliquota =
        textoPorChaves(valor, [
          "tipoAliquota",
          "tpAliquota",
        ]);

      const reducaoIbs =
        numeroPorPadraoDeChave(
          valor,
          ["red", "ibs"]
        );

      const reducaoCbs =
        numeroPorPadraoDeChave(
          valor,
          ["red", "cbs"]
        );

      const tributacaoRegular =
        booleanoPorPadraoDeChave(
          valor,
          ["tribut", "regular"]
        );

      encontrados.set(codigo, {
        cst,
        codigo,
        descricao,
        permiteNfe:
          detectarPermissaoNfe(valor),
        tipoAliquota,
        reducaoIbs,
        reducaoCbs,
        tributacaoRegular,
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
          cstLocal
        );
      }
    }
  }

  percorrer(payload, null);

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

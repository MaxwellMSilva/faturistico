import {
  NextRequest,
  NextResponse,
} from "next/server";

type MunicipioIbge = {
  id: number;
  nome: string;

  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla?: string;
      };
    };
  } | null;

  "regiao-imediata"?: {
    "regiao-intermediaria"?: {
      UF?: {
        sigla?: string;
      };
    };
  } | null;
};

function normalizarTexto(
  valor: string
) {
  return valor
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .trim();
}

function obterUf(
  municipio: MunicipioIbge
) {
  return (
    municipio.microrregiao
      ?.mesorregiao
      ?.UF
      ?.sigla ??
    municipio[
      "regiao-imediata"
    ]?.[
      "regiao-intermediaria"
    ]?.UF?.sigla ??
    ""
  );
}

export async function GET(
  request: NextRequest
) {
  const termoOriginal =
    request.nextUrl.searchParams
      .get("q")
      ?.trim() ?? "";

  if (termoOriginal.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
      {
        next: {
          revalidate:
            60 * 60 * 24,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "O serviço do IBGE não respondeu corretamente."
      );
    }

    const municipios =
      (await response.json()) as MunicipioIbge[];

    const termosBusca =
      normalizarTexto(
        termoOriginal
      )
        .split(/\s+/)
        .filter(Boolean);

    const resultados =
      municipios
        .map((municipio) => {
          const uf =
            obterUf(municipio);

          return {
            municipio:
              municipio.nome,

            uf,

            codigoMunicipio:
              String(
                municipio.id
              ),
          };
        })
        .filter((municipio) => {
          const texto =
            normalizarTexto(
              [
                municipio.municipio,
                municipio.uf,
                municipio
                  .codigoMunicipio,
              ].join(" ")
            );

          return termosBusca.every(
            (termo) =>
              texto.includes(termo)
          );
        })
        .slice(0, 20);

    return NextResponse.json(
      resultados
    );
  } catch (error) {
    console.error(
      "Erro ao consultar municípios:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Não foi possível consultar os municípios no IBGE.",
      },
      {
        status: 502,
      }
    );
  }
}
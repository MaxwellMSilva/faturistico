"use client";

import Link from "next/link";

import {
  ChevronRight,
  Search,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  empresaNome: string;
  usuarioNome: string;
  permissao: string;
};

type PaginaNavegacao = {
  nome: string;
  href: string;
  grupo: string;
  palavras: string[];
};

type BreadcrumbItem = {
  label: string;
  href?: string;
};

const titulosPagina: Record<
  string,
  string
> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  produtos: "Produtos",
  "naturezas-operacao":
    "Naturezas de operação",
  nfe: "NF-e",
  mdfe: "MDF-e",
  transportadores: "Transportadores",
  veiculos: "Veículos",
  motoristas: "Motoristas",
  configuracoes: "Configurações",
};

function criarPaginas(
  baseUrl: string
): PaginaNavegacao[] {
  return [
    {
      nome: "Dashboard",
      href: `${baseUrl}/dashboard`,
      grupo: "Visão geral",
      palavras: [
        "dashboard",
        "painel",
        "inicio",
        "visão",
      ],
    },
    {
      nome: "Clientes",
      href: `${baseUrl}/clientes`,
      grupo: "Cadastros",
      palavras: [
        "clientes",
        "cadastro",
        "cliente",
      ],
    },
    {
      nome: "Produtos",
      href: `${baseUrl}/produtos`,
      grupo: "Cadastros",
      palavras: [
        "produtos",
        "produto",
        "serviços",
        "itens",
      ],
    },
    {
      nome: "Naturezas de operação",
      href: `${baseUrl}/naturezas-operacao`,
      grupo: "Cadastros",
      palavras: [
        "naturezas",
        "operação",
        "cfop",
      ],
    },
    {
      nome: "NF-e",
      href: `${baseUrl}/nfe`,
      grupo: "Documentos fiscais",
      palavras: [
        "nfe",
        "nota",
        "fiscal",
        "emissão",
      ],
    },
    {
      nome: "Transportadores",
      href: `${baseUrl}/transportadores`,
      grupo: "Transportes",
      palavras: [
        "transportadores",
        "transportadora",
      ],
    },
    {
      nome: "Veículos",
      href: `${baseUrl}/veiculos`,
      grupo: "Transportes",
      palavras: [
        "veículos",
        "veiculo",
        "placa",
        "frota",
      ],
    },
    {
      nome: "Motoristas",
      href: `${baseUrl}/motoristas`,
      grupo: "Transportes",
      palavras: [
        "motoristas",
        "motorista",
        "cnh",
      ],
    },
    {
      nome: "Configurações",
      href: `${baseUrl}/configuracoes`,
      grupo: "Gestão",
      palavras: [
        "configurações",
        "configuracao",
        "fiscal",
        "certificado",
      ],
    },
  ];
}

function obterContextoPagina(
  pathname: string,
  empresaId: string,
  empresaNome: string
) {
  const baseUrl =
    `/empresa/${empresaId}`;

  const segmentos =
    pathname.split("/").filter(Boolean);

  const ultimoSegmento =
    segmentos[
      segmentos.length - 1
    ] ?? "dashboard";

  const penultimoSegmento =
    segmentos[
      segmentos.length - 2
    ];

  const inicio: BreadcrumbItem = {
    label: empresaNome,
    href: `${baseUrl}/dashboard`,
  };

  if (
    penultimoSegmento === "nfe" &&
    ultimoSegmento !== "nfe"
  ) {
    return {
      titulo: "Detalhes da NF-e",
      breadcrumbs: [
        inicio,
        {
          label: "NF-e",
          href: `${baseUrl}/nfe`,
        },
        {
          label: "Detalhes",
        },
      ],
    };
  }

  const titulo =
    titulosPagina[ultimoSegmento] ??
    "Painel";

  const paginaAtual =
    criarPaginas(baseUrl).find(
      (pagina) =>
        pagina.href === pathname ||
        pathname.startsWith(
          `${pagina.href}/`
        )
    );

  const breadcrumbs: BreadcrumbItem[] =
    [inicio];

  if (
    paginaAtual &&
    paginaAtual.href !==
      `${baseUrl}/dashboard`
  ) {
    breadcrumbs.push({
      label: paginaAtual.grupo,
    });
  }

  breadcrumbs.push({
    label: titulo,
  });

  return {
    titulo,
    breadcrumbs,
  };
}

function Breadcrumb({
  itens,
}: {
  itens: BreadcrumbItem[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mt-1"
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
        {itens.map((item, indice) => {
          const ultimo =
            indice ===
            itens.length - 1;

          return (
            <li
              key={`${item.label}-${indice}`}
              className="flex min-w-0 items-center gap-1"
            >
              {indice > 0 && (
                <ChevronRight
                  size={12}
                  className="shrink-0 text-muted-foreground/70"
                  aria-hidden
                />
              )}

              {item.href && !ultimo ? (
                <Link
                  href={item.href}
                  className="truncate transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    ultimo &&
                      "font-medium text-foreground/80"
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function BuscaPaginas({
  paginas,
}: {
  paginas: PaginaNavegacao[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [termo, setTermo] =
    useState("");

  const [aberto, setAberto] =
    useState(false);

  const resultados = useMemo(() => {
    const busca = termo
      .trim()
      .toLowerCase();

    if (!busca) {
      return paginas.slice(0, 6);
    }

    return paginas.filter((pagina) => {
      const texto = [
        pagina.nome,
        pagina.grupo,
        ...pagina.palavras,
      ]
        .join(" ")
        .toLowerCase();

      return texto.includes(busca);
    });
  }, [paginas, termo]);

  function navegar(href: string) {
    setTermo("");
    setAberto(false);
    router.push(href);
  }

  return (
    <div className="relative min-w-0 flex-1">
      <label className="relative block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="search"
          value={termo}
          placeholder="Buscar páginas do sistema..."
          onChange={(event) => {
            setTermo(event.target.value);
            setAberto(true);
          }}
          onFocus={() =>
            setAberto(true)
          }
          onBlur={() => {
            window.setTimeout(
              () => setAberto(false),
              150
            );
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              resultados[0]
            ) {
              navegar(
                resultados[0].href
              );
            }

            if (
              event.key === "Escape"
            ) {
              setAberto(false);
            }
          }}
          className="h-11 w-full rounded-xl border border-border/70 bg-muted/40 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </label>

      {aberto &&
        resultados.length > 0 && (
          <div className="absolute top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-xl border border-border/70 bg-white shadow-lg">
            <ul className="max-h-64 overflow-y-auto py-1">
              {resultados.map(
                (pagina) => {
                  const ativa =
                    pathname ===
                      pagina.href ||
                    pathname.startsWith(
                      `${pagina.href}/`
                    );

                  return (
                    <li
                      key={pagina.href}
                    >
                      <button
                        type="button"
                        onMouseDown={(
                          event
                        ) => {
                          event.preventDefault();

                          navegar(
                            pagina.href
                          );
                        }}
                        className={cn(
                          "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                          ativa &&
                            "bg-primary/5"
                        )}
                      >
                        <span className="text-sm font-medium">
                          {pagina.nome}
                        </span>

                        <span className="text-[11px] text-muted-foreground">
                          {pagina.grupo}
                        </span>
                      </button>
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        )}
    </div>
  );
}

function PerfilUsuario({
  inicial,
  usuarioExibicao,
  empresaExibicao,
}: {
  inicial: string;
  usuarioExibicao: string;
  empresaExibicao: string;
}) {
  return (
    <div className="flex h-11 max-w-[240px] min-w-0 shrink-0 items-center gap-2.5 rounded-xl border border-border/70 bg-white pl-1.5 pr-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-xs font-semibold text-white">
        {inicial}
      </div>

      <div className="hidden min-w-0 md:block">
        <p
          className="truncate text-sm font-semibold leading-4"
          title={usuarioExibicao}
        >
          {usuarioExibicao}
        </p>

        <p
          className="truncate text-[11px] leading-4 text-muted-foreground"
          title={empresaExibicao}
        >
          {empresaExibicao}
        </p>
      </div>
    </div>
  );
}

export function EmpresaHeader({
  empresaNome,
  usuarioNome,
}: Props) {
  const pathname = usePathname();

  const empresaExibicao =
    empresaNome.trim() ||
    "Empresa";

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const inicial =
    usuarioExibicao
      .charAt(0)
      .toUpperCase();

  const segmentos =
    pathname.split("/").filter(Boolean);

  const empresaId =
    segmentos[1] ?? "";

  const baseUrl =
    empresaId
      ? `/empresa/${empresaId}`
      : "";

  const paginas =
    baseUrl
      ? criarPaginas(baseUrl)
      : [];

  const { titulo, breadcrumbs } =
    obterContextoPagina(
      pathname,
      empresaId,
      empresaExibicao
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white">
      <div className="flex min-h-[72px] items-center gap-3 px-5 py-3 sm:gap-4 sm:px-6">
        <div className="min-w-0 shrink-0 sm:w-[180px] lg:w-[220px] xl:w-[260px]">
          <h1 className="truncate text-sm font-bold tracking-tight text-foreground lg:text-base">
            {titulo}
          </h1>

          <div className="hidden sm:block">
            <Breadcrumb
              itens={breadcrumbs}
            />
          </div>
        </div>

        <BuscaPaginas
          paginas={paginas}
        />

        <PerfilUsuario
          inicial={inicial}
          usuarioExibicao={
            usuarioExibicao
          }
          empresaExibicao={
            empresaExibicao
          }
        />
      </div>
    </header>
  );
}

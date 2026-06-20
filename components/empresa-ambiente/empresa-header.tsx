"use client";

import Link from "next/link";

import {
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  LogOut,
  Search,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

type Props = {
  empresaNome: string;
  usuarioNome: string;
  usuarioEmail?: string;
  permissao: string;
  privilegios: string[];
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

const nomesPermissoes: Record<
  string,
  string
> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  PERSONALIZADO: "Personalizado",
  VISUALIZADOR: "Visualizador",
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

  transportadores:
    "Transportadores",

  veiculos: "Veículos",
  motoristas: "Motoristas",

  configuracoes:
    "Configurações",
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
      nome:
        "Naturezas de operação",

      href:
        `${baseUrl}/naturezas-operacao`,

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
      grupo:
        "Documentos fiscais",

      palavras: [
        "nfe",
        "nota",
        "fiscal",
        "emissão",
      ],
    },

    {
      nome:
        "Transportadores",

      href:
        `${baseUrl}/transportadores`,

      grupo: "Transportes",

      palavras: [
        "transportadores",
        "transportadora",
      ],
    },

    {
      nome: "Veículos",
      href:
        `${baseUrl}/veiculos`,

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
      href:
        `${baseUrl}/motoristas`,

      grupo: "Transportes",

      palavras: [
        "motoristas",
        "motorista",
        "cnh",
      ],
    },

    {
      nome: "Configurações",

      href:
        `${baseUrl}/configuracoes`,

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

function obterPrivilegiosPagina(
  href: string
) {
  if (href.endsWith("/dashboard")) {
    return [
      "DASHBOARD_VISUALIZAR",
    ];
  }

  if (href.endsWith("/clientes")) {
    return [
      "CLIENTES_VISUALIZAR",
    ];
  }

  if (href.endsWith("/produtos")) {
    return [
      "PRODUTOS_VISUALIZAR",
    ];
  }

  if (
    href.endsWith(
      "/naturezas-operacao"
    )
  ) {
    return [
      "NATUREZAS_VISUALIZAR",
    ];
  }

  if (href.endsWith("/nfe")) {
    return [
      "NFE_VISUALIZAR",
    ];
  }

  if (
    href.endsWith(
      "/transportadores"
    )
  ) {
    return [
      "TRANSPORTADORES_VISUALIZAR",
    ];
  }

  if (href.endsWith("/veiculos")) {
    return [
      "VEICULOS_VISUALIZAR",
    ];
  }

  if (href.endsWith("/motoristas")) {
    return [
      "MOTORISTAS_VISUALIZAR",
    ];
  }

  if (
    href.endsWith(
      "/configuracoes"
    )
  ) {
    return [
      "CONFIGURACOES_VISUALIZAR",
      "CERTIFICADO_VISUALIZAR",
    ];
  }

  return [];
}

function filtrarPaginasPermitidas(
  paginas: PaginaNavegacao[],
  privilegios: string[]
) {
  return paginas.filter(
    (pagina) => {
      const privilegiosPagina =
        obterPrivilegiosPagina(
          pagina.href
        );

      if (
        privilegiosPagina.length === 0
      ) {
        return true;
      }

      return privilegiosPagina.some(
        (privilegio) =>
          privilegios.includes(
            privilegio
          )
      );
    }
  );
}

function obterContextoPagina(
  pathname: string,
  empresaId: string,
  empresaNome: string
) {
  const baseUrl =
    `/empresa/${empresaId}`;

  const segmentos =
    pathname
      .split("/")
      .filter(Boolean);

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
    penultimoSegmento ===
      "nfe" &&
    ultimoSegmento !== "nfe"
  ) {
    return {
      titulo:
        "Detalhes da NF-e",

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
    titulosPagina[
      ultimoSegmento
    ] ?? "Painel";

  const paginaAtual =
    criarPaginas(baseUrl).find(
      (pagina) =>
        pagina.href ===
          pathname ||
        pathname.startsWith(
          `${pagina.href}/`
        )
    );

  const breadcrumbs:
    BreadcrumbItem[] = [
      inicio,
    ];

  if (
    paginaAtual &&
    paginaAtual.href !==
      `${baseUrl}/dashboard`
  ) {
    breadcrumbs.push({
      label:
        paginaAtual.grupo,
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
        {itens.map(
          (item, indice) => {
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

                {item.href &&
                !ultimo ? (
                  <Link
                    href={
                      item.href
                    }
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
          }
        )}
      </ol>
    </nav>
  );
}

function BuscaPaginas({
  paginas,
}: {
  paginas:
    PaginaNavegacao[];
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    termo,
    setTermo,
  ] = useState("");

  const [
    aberto,
    setAberto,
  ] = useState(false);

  const resultados =
    useMemo(() => {
      const busca =
        termo
          .trim()
          .toLowerCase();

      if (!busca) {
        return paginas.slice(
          0,
          6
        );
      }

      return paginas.filter(
        (pagina) => {
          const texto = [
            pagina.nome,
            pagina.grupo,
            ...pagina.palavras,
          ]
            .join(" ")
            .toLowerCase();

          return texto.includes(
            busca
          );
        }
      );
    }, [paginas, termo]);

  function navegar(
    href: string
  ) {
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
          onChange={(
            event
          ) => {
            setTermo(
              event.target.value
            );

            setAberto(true);
          }}
          onFocus={() =>
            setAberto(true)
          }
          onBlur={() => {
            window.setTimeout(
              () =>
                setAberto(
                  false
                ),
              150
            );
          }}
          onKeyDown={(
            event
          ) => {
            if (
              event.key ===
                "Enter" &&
              resultados[0]
            ) {
              navegar(
                resultados[0]
                  .href
              );
            }

            if (
              event.key ===
              "Escape"
            ) {
              setAberto(
                false
              );
            }
          }}
          className="h-11 w-full rounded-xl border border-border/70 bg-muted/40 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </label>

      {aberto &&
        resultados.length >
          0 && (
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
                      key={
                        pagina.href
                      }
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
                          {
                            pagina.nome
                          }
                        </span>

                        <span className="text-[11px] text-muted-foreground">
                          {
                            pagina.grupo
                          }
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

type PerfilUsuarioProps = {
  inicial: string;
  usuarioExibicao: string;
  usuarioEmail?: string;
  empresaExibicao: string;
  permissao: string;
};

function PerfilUsuario({
  inicial,
  usuarioExibicao,
  usuarioEmail,
  empresaExibicao,
  permissao,
}: PerfilUsuarioProps) {
  const pathname =
    usePathname();

  const menuRef =
    useRef<HTMLDivElement>(
      null
    );

  const [
    aberto,
    setAberto,
  ] = useState(false);

  const [
    saindo,
    setSaindo,
  ] = useState(false);

  const nomePermissao =
    nomesPermissoes[
      permissao
    ] ?? permissao;

  const descricaoUsuario =
    usuarioEmail?.trim() ||
    nomePermissao;

  useEffect(() => {
    setAberto(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickFora(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setAberto(false);
      }
    }

    function handleTecla(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setAberto(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickFora
    );

    document.addEventListener(
      "keydown",
      handleTecla
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickFora
      );

      document.removeEventListener(
        "keydown",
        handleTecla
      );
    };
  }, []);

  async function handleLogout() {
    try {
      setSaindo(true);
      setAberto(false);

      await signOut({
        callbackUrl:
          "/entrar",
      });
    } catch (error) {
      console.error(
        "Erro ao encerrar sessão:",
        error
      );

      setSaindo(false);
    }
  }

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        onClick={() =>
          setAberto(
            (valor) => !valor
          )
        }
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="flex h-11 max-w-[260px] min-w-0 items-center gap-2.5 rounded-xl border border-border/70 bg-white pl-1.5 pr-2.5 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-xs font-semibold text-white">
          {inicial}
        </div>

        <div className="hidden min-w-0 md:block">
          <p
            className="truncate text-sm font-semibold leading-4"
            title={
              usuarioExibicao
            }
          >
            {usuarioExibicao}
          </p>

          <p
            className="truncate text-[11px] leading-4 text-muted-foreground"
            title={
              empresaExibicao
            }
          >
            {empresaExibicao}
          </p>
        </div>

        <ChevronDown
          size={15}
          className={cn(
            "hidden shrink-0 text-muted-foreground transition-transform duration-200 sm:block",

            aberto &&
              "rotate-180"
          )}
        />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-border/70 bg-white p-2 shadow-[0_18px_45px_rgb(15_23_42/0.18)]"
        >
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan-500 text-sm font-semibold text-white">
              {inicial}
            </div>

            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold"
                title={
                  usuarioExibicao
                }
              >
                {usuarioExibicao}
              </p>

              <p
                className="truncate text-xs text-muted-foreground"
                title={
                  descricaoUsuario
                }
              >
                {descricaoUsuario}
              </p>
            </div>
          </div>

          <div className="my-2 border-t" />

          <div className="px-2 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Empresa ativa
            </p>

            <p
              className="mt-1 truncate text-sm font-medium"
              title={
                empresaExibicao
              }
            >
              {empresaExibicao}
            </p>
          </div>

          <div className="my-2 border-t" />

          <button
            type="button"
            role="menuitem"
            onClick={
              handleLogout
            }
            disabled={saindo}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saindo ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <LogOut
                size={16}
              />
            )}

            {saindo
              ? "Saindo..."
              : "Sair da conta"}
          </button>
        </div>
      )}
    </div>
  );
}

export function EmpresaHeader({
  empresaNome,
  usuarioNome,
  usuarioEmail,
  permissao,
  privilegios,
}: Props) {
  const pathname =
    usePathname();

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
    pathname
      .split("/")
      .filter(Boolean);

  const empresaId =
    segmentos[1] ?? "";

  const baseUrl =
    empresaId
      ? `/empresa/${empresaId}`
      : "";

  const paginas =
    baseUrl
      ? filtrarPaginasPermitidas(
          criarPaginas(baseUrl),
          privilegios
        )
      : [];

  const {
    titulo,
    breadcrumbs,
  } = obterContextoPagina(
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
              itens={
                breadcrumbs
              }
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
          usuarioEmail={
            usuarioEmail
          }
          empresaExibicao={
            empresaExibicao
          }
          permissao={
            permissao
          }
        />
      </div>
    </header>
  );
}

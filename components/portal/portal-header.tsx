"use client";

import Link from "next/link";

import {
  ChevronRight,
  Search,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type RoleUsuario =
  | "OWNER"
  | "ADMIN"
  | "USUARIO";

type Props = {
  usuarioNome: string;
  usuarioEmail?: string;
  role: RoleUsuario;
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

const rotulosRole = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USUARIO: "Visualizador",
} as const;

function criarPaginas(
  podeGerenciarUsuarios: boolean
): PaginaNavegacao[] {
  return [
    {
      nome: "Painel",
      href: "/painel",
      grupo: "Plataforma",
      palavras: [
        "painel",
        "inicio",
        "home",
      ],
    },
    {
      nome: "Empresas",
      href: "/empresas",
      grupo: "Plataforma",
      palavras: [
        "empresas",
        "empresa",
        "cnpj",
      ],
    },
    {
      nome: "Nova empresa",
      href: "/empresas/nova",
      grupo: "Empresas",
      palavras: [
        "nova",
        "cadastro",
        "criar",
      ],
    },
    ...(podeGerenciarUsuarios
      ? [
          {
            nome: "Usuários",
            href: "/usuarios",
            grupo: "Plataforma",
            palavras: [
              "usuarios",
              "usuario",
              "acesso",
            ],
          } satisfies PaginaNavegacao,
        ]
      : []),
  ];
}

function obterContextoPagina(
  pathname: string
) {
  if (pathname === "/painel") {
    return {
      titulo: "Painel geral",
      breadcrumbs: [
        {
          label: "Plataforma",
          href: "/painel",
        },
        {
          label: "Painel geral",
        },
      ],
    };
  }

  if (pathname === "/empresas") {
    return {
      titulo: "Empresas",
      breadcrumbs: [
        {
          label: "Plataforma",
          href: "/painel",
        },
        {
          label: "Empresas",
        },
      ],
    };
  }

  if (
    pathname === "/empresas/nova"
  ) {
    return {
      titulo: "Nova empresa",
      breadcrumbs: [
        {
          label: "Plataforma",
          href: "/painel",
        },
        {
          label: "Empresas",
          href: "/empresas",
        },
        {
          label: "Nova empresa",
        },
      ],
    };
  }

  if (
    pathname.startsWith(
      "/empresas/"
    ) &&
    pathname.endsWith("/editar")
  ) {
    return {
      titulo: "Editar empresa",
      breadcrumbs: [
        {
          label: "Plataforma",
          href: "/painel",
        },
        {
          label: "Empresas",
          href: "/empresas",
        },
        {
          label: "Editar empresa",
        },
      ],
    };
  }

  if (pathname === "/usuarios") {
    return {
      titulo: "Usuários",
      breadcrumbs: [
        {
          label: "Plataforma",
          href: "/painel",
        },
        {
          label: "Usuários",
        },
      ],
    };
  }

  return {
    titulo: "Plataforma",
    breadcrumbs: [
      {
        label: "Plataforma",
        href: "/painel",
      },
    ],
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
          placeholder="Buscar páginas da plataforma..."
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
  contextoExibicao,
}: {
  inicial: string;
  usuarioExibicao: string;
  contextoExibicao: string;
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
          title={contextoExibicao}
        >
          {contextoExibicao}
        </p>
      </div>
    </div>
  );
}

export function PortalHeader({
  usuarioNome,
  role,
}: Props) {
  const pathname = usePathname();

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const inicial =
    usuarioExibicao
      .charAt(0)
      .toUpperCase();

  const podeGerenciarUsuarios =
    role === "OWNER" ||
    role === "ADMIN";

  const paginas = criarPaginas(
    podeGerenciarUsuarios
  );

  const { titulo, breadcrumbs } =
    obterContextoPagina(pathname);

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
          contextoExibicao={
            rotulosRole[role]
          }
        />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";

import {
  ArrowLeftRight,
  Building2,
  CarFront,
  ChevronDown,
  ClipboardList,
  FileText,
  Headphones,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Package,
  Settings,
  Truck,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

export type EmpresaSidebarProps = {
  empresaId: string;
  empresaNome: string;
  usuarioNome: string;
  usuarioEmail?: string;
  permissao: string;

  variante?:
    | "desktop"
    | "mobile";

  onNavigate?: () => void;
};

type ItemMenu = {
  nome: string;
  href: string;
  icon: typeof LayoutDashboard;
  ativo: boolean;
};

type GrupoMenu = {
  titulo: string;
  itens: ItemMenu[];
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

export function EmpresaSidebar({
  empresaId,
  empresaNome,
  usuarioNome,
  usuarioEmail,
  permissao,
  variante = "desktop",
  onNavigate,
}: EmpresaSidebarProps) {
  const pathname =
    usePathname();

  const menuUsuarioRef =
    useRef<HTMLDivElement>(
      null
    );

  const [
    saindo,
    setSaindo,
  ] = useState(false);

  const [
    menuUsuarioAberto,
    setMenuUsuarioAberto,
  ] = useState(false);

  const baseUrl =
    `/empresa/${empresaId}`;

  const grupos: GrupoMenu[] = [
    {
      titulo: "Visão geral",

      itens: [
        {
          nome: "Dashboard",
          href: `${baseUrl}/dashboard`,
          icon: LayoutDashboard,
          ativo: true,
        },
      ],
    },

    {
      titulo: "Cadastros",

      itens: [
        {
          nome: "Clientes",
          href: `${baseUrl}/clientes`,
          icon: Users,
          ativo: true,
        },

        {
          nome: "Produtos",
          href: `${baseUrl}/produtos`,
          icon: Package,
          ativo: true,
        },

        {
          nome:
            "Naturezas de operação",

          href:
            `${baseUrl}/naturezas-operacao`,

          icon:
            ClipboardList,

          ativo: true,
        },
      ],
    },

    {
      titulo:
        "Documentos fiscais",

      itens: [
        {
          nome: "NF-e",
          href: `${baseUrl}/nfe`,
          icon: FileText,
          ativo: true,
        },

        {
          nome: "MDF-e",
          href: `${baseUrl}/mdfe`,
          icon: Truck,
          ativo: false,
        },
      ],
    },

    {
      titulo: "Transportes",

      itens: [
        {
          nome:
            "Transportadores",

          href:
            `${baseUrl}/transportadores`,

          icon:
            Building2,

          ativo: true,
        },

        {
          nome: "Veículos",
          href:
            `${baseUrl}/veiculos`,
          icon: CarFront,
          ativo: true,
        },

        {
          nome: "Motoristas",
          href:
            `${baseUrl}/motoristas`,
          icon: UserRound,
          ativo: true,
        },
      ],
    },

    {
      titulo: "Gestão",

      itens: [
        {
          nome:
            "Configurações",

          href:
            `${baseUrl}/configuracoes`,

          icon:
            Settings,

          ativo: true,
        },
      ],
    },
  ];

  useEffect(() => {
    setMenuUsuarioAberto(
      false
    );
  }, [pathname]);

  useEffect(() => {
    function handleClickFora(
      event: MouseEvent
    ) {
      const elemento =
        menuUsuarioRef.current;

      if (
        elemento &&
        !elemento.contains(
          event.target as Node
        )
      ) {
        setMenuUsuarioAberto(
          false
        );
      }
    }

    function handleTecla(
      event: KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setMenuUsuarioAberto(
          false
        );
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

  function rotaSelecionada(
    href: string
  ) {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  const empresaExibicao =
    empresaNome.trim() ||
    "Empresa";

  const usuarioExibicao =
    usuarioNome.trim() ||
    "Usuário";

  const nomePermissao =
    nomesPermissoes[
      permissao
    ] ?? permissao;

  const emailExibicao =
    usuarioEmail?.trim() ||
    nomePermissao;

  const inicial =
    usuarioExibicao
      .charAt(0)
      .toUpperCase();

  async function handleLogout() {
    try {
      setSaindo(true);

      setMenuUsuarioAberto(
        false
      );

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
    <aside
      className={cn(
        "empresa-sidebar shrink-0 flex-col bg-empresa-sidebar",

        variante === "desktop"
          ? "sticky top-0 hidden h-screen w-[248px] lg:flex"
          : "flex h-full w-full"
      )}
      style={{
        backgroundColor:
          "#0a1628",

        backgroundImage:
          "linear-gradient(180deg, #0c1a30 0%, #0a1628 45%, #071018 100%)",
      }}
    >
      {/* Logo */}

      <div className="px-5 pb-5 pt-6">
        <Link
          href="/painel"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-[0_8px_24px_rgb(37_99_235/0.45)]">
            <Zap size={18} />
          </div>

          <div>
            <p className="text-[15px] font-bold leading-none tracking-tight text-white">
              Faturístico
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Fiscal
            </p>
          </div>
        </Link>
      </div>

      {/* Navegação */}

      <nav
        aria-label="Navegação da empresa"
        className="flex-1 overflow-y-auto px-3 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="space-y-7">
          {grupos.map(
            (grupo) => (
              <section
                key={
                  grupo.titulo
                }
                className="space-y-1"
              >
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {grupo.titulo}
                </p>

                {grupo.itens.map(
                  (item) => {
                    const Icone =
                      item.icon;

                    const selecionado =
                      rotaSelecionada(
                        item.href
                      );

                    if (
                      !item.ativo
                    ) {
                      return (
                        <div
                          key={
                            item.nome
                          }
                          aria-disabled="true"
                          className="flex h-10 cursor-not-allowed items-center justify-between gap-3 rounded-xl px-3 text-sm text-slate-500"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Icone
                              size={
                                17
                              }
                              className="shrink-0 text-slate-600"
                            />

                            <span className="truncate">
                              {
                                item.nome
                              }
                            </span>
                          </div>

                          <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                            Em breve
                          </span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={
                          item.nome
                        }
                        href={
                          item.href
                        }
                        onClick={
                          onNavigate
                        }
                        aria-current={
                          selecionado
                            ? "page"
                            : undefined
                        }
                        className={cn(
                          "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",

                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50",

                          selecionado
                            ? "bg-[#1e3a5f] text-white shadow-[inset_0_0_0_1px_rgb(96_165_250/0.2)]"
                            : "text-slate-400 hover:bg-[#132337] hover:text-slate-100"
                        )}
                      >
                        <Icone
                          size={
                            17
                          }
                          className={cn(
                            "shrink-0",

                            selecionado
                              ? "text-blue-300"
                              : "text-slate-500 group-hover:text-slate-300"
                          )}
                        />

                        <span className="truncate">
                          {
                            item.nome
                          }
                        </span>
                      </Link>
                    );
                  }
                )}
              </section>
            )
          )}
        </div>
      </nav>

      {/* Rodapé */}

      <div className="border-t border-white/10 bg-[#081220]/80 p-4">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-[#132337] hover:text-slate-100"
        >
          <Headphones
            size={17}
          />

          Suporte
        </button>

        <Link
          href="/empresas"
          onClick={onNavigate}
          className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-slate-300 transition-colors hover:border-white/15 hover:bg-[#132337] hover:text-white"
        >
          <ArrowLeftRight
            size={15}
          />

          Trocar de empresa
        </Link>

        {/* Empresa e usuário */}

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#132337]/80 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Empresa ativa
          </p>

          <p
            className="mt-1 truncate text-sm font-semibold text-white"
            title={
              empresaExibicao
            }
          >
            {empresaExibicao}
          </p>

          <div
            ref={
              menuUsuarioRef
            }
            className="relative mt-3 border-t border-white/10 pt-3"
          >
            {menuUsuarioAberto && (
              <div
                role="menu"
                className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-50 rounded-xl border border-white/10 bg-[#101f33] p-1.5 shadow-[0_18px_45px_rgb(0_0_0/0.45)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    saindo
                  }
                  className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saindo ? (
                    <LoaderCircle
                      size={
                        16
                      }
                      className="animate-spin"
                    />
                  ) : (
                    <LogOut
                      size={
                        16
                      }
                    />
                  )}

                  {saindo
                    ? "Saindo..."
                    : "Sair da conta"}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setMenuUsuarioAberto(
                  (aberto) =>
                    !aberto
                )
              }
              aria-haspopup="menu"
              aria-expanded={
                menuUsuarioAberto
              }
              className="flex w-full items-center gap-3 rounded-xl p-1 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white ring-2 ring-blue-400/30">
                {inicial}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold text-white"
                  title={
                    usuarioExibicao
                  }
                >
                  {
                    usuarioExibicao
                  }
                </p>

                <p
                  className="truncate text-[11px] text-slate-400"
                  title={
                    emailExibicao
                  }
                >
                  {
                    emailExibicao
                  }
                </p>
              </div>

              <ChevronDown
                size={16}
                className={cn(
                  "shrink-0 text-slate-500 transition-transform duration-200",

                  menuUsuarioAberto &&
                    "rotate-180 text-slate-300"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

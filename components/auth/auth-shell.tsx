import Link from "next/link";

import type { ReactNode } from "react";

import {
  BarChart3,
  Building2,
  FileText,
  ShieldCheck,
} from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  titulo: string;
  subtitulo: string;
  variante?: "login" | "cadastro";
};

const destaques = [
  {
    icone: FileText,
    titulo: "NF-e integrada",
    descricao:
      "Emita e acompanhe notas fiscais com rascunhos, itens e transporte.",
  },
  {
    icone: Building2,
    titulo: "Multi-empresa",
    descricao:
      "Ambientes separados com controle de acesso por empresa.",
  },
  {
    icone: BarChart3,
    titulo: "Dashboard fiscal",
    descricao:
      "Indicadores e status das notas em tempo real.",
  },
];

export function AuthShell({
  children,
  titulo,
  subtitulo,
  variante = "login",
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <aside
        className="relative hidden min-h-screen w-1/2 shrink-0 overflow-hidden lg:flex lg:flex-col"
        style={{
          backgroundColor: "#0a1628",
          backgroundImage:
            "linear-gradient(180deg, #0c1a30 0%, #0a1628 45%, #071018 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-32 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="relative z-10 flex min-h-screen flex-1 flex-col justify-between p-10 xl:p-14">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                <FileText size={22} />
              </div>

              <span className="text-xl font-bold tracking-tight text-white">
                Faturístico
              </span>
            </Link>

            <div className="mt-14 max-w-md">
              <p className="text-sm font-medium text-sky-300">
                {variante === "cadastro"
                  ? "Comece agora"
                  : "Gestão fiscal inteligente"}
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
                {variante === "cadastro"
                  ? "Organize sua operação fiscal em um só lugar"
                  : "Controle NF-e, empresas e tributos com segurança"}
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {variante === "cadastro"
                  ? "Crie a conta do proprietário e configure suas empresas para começar a emitir documentos."
                  : "Acesse o painel para gerenciar cadastros, notas fiscais e o acompanhamento tributário."}
              </p>
            </div>
          </div>

          <ul className="mt-12 space-y-5">
            {destaques.map((item) => {
              const Icone = item.icone;

              return (
                <li
                  key={item.titulo}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky-300 ring-1 ring-white/10">
                    <Icone size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.titulo}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      {item.descricao}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sky-300">
              <ShieldCheck size={18} />
            </div>

            <p className="text-sm text-slate-300">
              Ambiente protegido com acesso
              separado por empresa.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col bg-background">
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[400px]">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <FileText size={20} />
                </div>

                <span className="text-lg font-bold tracking-tight">
                  Faturístico
                </span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {titulo}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                {subtitulo}
              </p>
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

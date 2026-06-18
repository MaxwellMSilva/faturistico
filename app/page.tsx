import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { Button } from "@/components/ui/button";

export const dynamic =
  "force-dynamic";

const metricas = [
  { valor: "NF-e", rotulo: "Emissão integrada" },
  { valor: "Multi", rotulo: "Empresas em um painel" },
  { valor: "100%", rotulo: "Ambientes separados" },
  { valor: "24/7", rotulo: "Acesso online" },
];

const recursos = [
  {
    titulo: "Emissão de NF-e",
    descricao:
      "Rascunhos, itens, transporte e validação em um fluxo único — do cadastro ao XML.",
    icone: FileText,
    destaque: true,
  },
  {
    titulo: "Multi-empresa",
    descricao:
      "Cada CNPJ com ambiente isolado, permissões por usuário e troca rápida de contexto.",
    icone: Building2,
    destaque: false,
  },
  {
    titulo: "Dashboard fiscal",
    descricao:
      "Indicadores, status das notas e visão tributária para decidir com dados reais.",
    icone: BarChart3,
    destaque: false,
  },
  {
    titulo: "Cadastros completos",
    descricao:
      "Clientes, produtos, transportadores, veículos e motoristas prontos para a nota.",
    icone: Truck,
    destaque: false,
  },
];

const passos = [
  {
    numero: "01",
    titulo: "Crie sua conta",
    descricao:
      "Configure o proprietário e cadastre as empresas que irá operar.",
  },
  {
    numero: "02",
    titulo: "Organize o fiscal",
    descricao:
      "Certificado, produtos, clientes e naturezas de operação no mesmo lugar.",
  },
  {
    numero: "03",
    titulo: "Emita com confiança",
    descricao:
      "Gere NF-e, acompanhe status e monitore tudo pelo dashboard da empresa.",
  },
];

function PreviewDashboard() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
    >
      <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/90 p-4 shadow-[0_24px_80px_rgb(15_23_42/0.12)] backdrop-blur-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>

          <div className="rounded-full bg-muted px-3 py-1 text-[10px] font-medium text-muted-foreground">
            Dashboard · Empresa Demo
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "NF-e", value: "128", cor: "bg-primary" },
            { label: "Clientes", value: "54", cor: "bg-emerald-500" },
            { label: "Produtos", value: "312", cor: "bg-violet-500" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-card p-3"
            >
              <p className="text-[10px] text-muted-foreground">
                {item.label}
              </p>

              <p className="mt-1 text-lg font-bold">
                {item.value}
              </p>

              <div
                className={`mt-2 h-1 w-8 rounded-full ${item.cor}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-xl border border-border/60 bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">
              Notas recentes
            </p>

            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              3 autorizadas
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {[
              "NF-e 1.284 · Autorizada",
              "NF-e 1.283 · Rascunho",
              "NF-e 1.282 · Autorizada",
            ].map((linha) => (
              <div
                key={linha}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2 text-[11px] text-muted-foreground"
              >
                <FileText
                  size={12}
                  className="shrink-0 text-primary"
                />

                {linha}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-4 hidden rounded-xl border border-border/60 bg-white px-4 py-3 shadow-lg sm:block">
        <div className="flex items-center gap-2">
          <CheckCircle2
            size={16}
            className="text-emerald-500"
          />

          <p className="text-xs font-medium">
            NF-e validada com sucesso
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const session =
    await getServerSession(
      authOptions
    );

  if (
    session?.user &&
    "id" in session.user &&
    session.user.id
  ) {
    redirect("/painel");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_rgb(59_130_246/0.35)]">
              <Zap size={20} />
            </div>

            <div>
              <span className="text-lg font-bold tracking-tight">
                Faturístico
              </span>

              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Gestão fiscal
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              className="h-10"
              render={
                <Link href="/entrar" />
              }
            >
              Entrar
            </Button>

            <Button
              className="h-10 shadow-[0_8px_24px_rgb(59_130_246/0.25)]"
              render={
                <Link href="/cadastro" />
              }
            >
              Criar conta grátis
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,oklch(0.62_0.18_255/0.22),transparent)]"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.984_0.003_247)_70%)]"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
                <Sparkles size={15} />

                Plataforma fiscal para PMEs
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Emita NF-e e gerencie
                empresas sem
                complicação
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                O Faturístico une cadastros,
                emissão de notas e dashboard
                fiscal em uma experiência
                moderna — pensada para quem
                precisa de controle, não de
                planilhas.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-12 px-7 text-base shadow-[0_12px_32px_rgb(59_130_246/0.3)]"
                  render={
                    <Link href="/cadastro" />
                  }
                >
                  Começar agora

                  <ArrowRight size={18} />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-base"
                  render={
                    <Link href="/entrar" />
                  }
                >
                  Já tenho conta
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {[
                  "Multi-empresa",
                  "Controle de acesso",
                  "Dashboard em tempo real",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-primary"
                    />

                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <PreviewDashboard />
          </div>
        </section>

        <section className="border-y border-border/60 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
            {metricas.map((item) => (
              <div
                key={item.rotulo}
                className="text-center md:text-left"
              >
                <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  {item.valor}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {item.rotulo}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="recursos"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Recursos
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo para sua operação
              fiscal em um só sistema
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Do primeiro cadastro à nota
              autorizada, cada módulo foi
              pensado para reduzir retrabalho
              e aumentar a confiança na emissão.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {recursos.map((recurso) => {
              const Icone =
                recurso.icone;

              return (
                <article
                  key={recurso.titulo}
                  className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgb(15_23_42/0.08)] ${
                    recurso.destaque
                      ? "border-primary/25 bg-linear-to-br from-primary/10 via-card to-card md:col-span-2 lg:col-span-2 lg:row-span-1"
                      : "border-border/80 bg-card"
                  }`}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icone size={24} />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight">
                    {recurso.titulo}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {recurso.descricao}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Como funciona
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Três passos para começar
              </h2>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {passos.map((passo) => (
                <div
                  key={passo.numero}
                  className="relative rounded-2xl border border-border/80 bg-card p-6"
                >
                  <span className="text-4xl font-bold text-primary/20">
                    {passo.numero}
                  </span>

                  <h3 className="mt-4 text-lg font-semibold">
                    {passo.titulo}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {passo.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="relative overflow-hidden py-20"
          style={{
            backgroundColor: "#0a1628",
            backgroundImage:
              "linear-gradient(180deg, #0c1a30 0%, #0a1628 45%, #071018 100%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-sky-300">
                <ShieldCheck size={16} />

                Ambiente seguro e separado por empresa
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Pronto para modernizar sua
                gestão fiscal?
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-400">
                Crie sua conta em minutos e
                comece a organizar empresas,
                cadastros e notas fiscais com
                uma plataforma feita para o
                dia a dia do contador e do
                empresário.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 bg-white px-7 text-base text-slate-900 hover:bg-white/90"
                  render={
                    <Link href="/cadastro" />
                  }
                >
                  Criar conta gratuita

                  <ArrowRight size={18} />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 border-white/20 bg-white/5 px-7 text-base text-white hover:bg-white/10 hover:text-white"
                  render={
                    <Link href="/entrar" />
                  }
                >
                  Fazer login
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap size={18} />
            </div>

            <div>
              <p className="font-semibold">
                Faturístico
              </p>

              <p className="text-xs text-muted-foreground">
                Gestão fiscal e emissão de
                documentos
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            Faturístico. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

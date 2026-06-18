import Link from "next/link";

import {
  ArrowLeft,
  FileText,
  Home,
  SearchX,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <FileText size={20} />
            </div>

            <span className="text-lg font-bold tracking-tight">
              Faturístico
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-lg text-center">
          <div
            aria-hidden
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          >
            <SearchX size={36} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Erro 404
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Página não encontrada
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            O endereço que você acessou não
            existe, foi movido ou não está mais
            disponível no sistema.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="h-11"
              render={
                <Link href="/" />
              }
            >
              <Home size={18} />

              Ir para o início
            </Button>

            <Button
              variant="outline"
              className="h-11"
              render={
                <Link href="/painel" />
              }
            >
              <ArrowLeft size={18} />

              Acessar o painel
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
          Precisa de ajuda? Volte ao início ou
          faça login para continuar.
        </div>
      </footer>
    </div>
  );
}

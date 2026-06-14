"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  LogIn,
} from "lucide-react";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const emailNormalizado =
      email.trim().toLowerCase();

    if (!emailNormalizado) {
      setErro(
        "Informe seu e-mail."
      );

      return;
    }

    if (!senha) {
      setErro(
        "Informe sua senha."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await signIn(
          "credentials",
          {
            email:
              emailNormalizado,

            senha,

            redirect: false,
          }
        );

      if (
        !resultado ||
        resultado.error
      ) {
        setErro(
          "E-mail ou senha inválidos."
        );

        return;
      }

      window.location.assign(
        "/painel"
      );
    } catch (error) {
      console.error(
        "Erro ao realizar login:",
        error
      );

      setErro(
        "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="p-6 sm:p-8">
            {/* Cabeçalho */}

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <FileText size={27} />
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Faturístico
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Sistema de gestão fiscal e
                emissão de documentos.
              </p>
            </div>

            {/* Formulário */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  E-mail
                </label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="h-12"
                  placeholder="seuemail@empresa.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(
                      event.target.value
                    );

                    if (erro) {
                      setErro("");
                    }
                  }}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="senha"
                  className="text-sm font-medium"
                >
                  Senha
                </label>

                <div className="relative">
                  <Input
                    id="senha"
                    name="senha"
                    type={
                      mostrarSenha
                        ? "text"
                        : "password"
                    }
                    className="h-12 pr-12"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(event) => {
                      setSenha(
                        event.target.value
                      );

                      if (erro) {
                        setErro("");
                      }
                    }}
                    autoComplete="current-password"
                    disabled={carregando}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha(
                        (valorAtual) =>
                          !valorAtual
                      )
                    }
                    className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    disabled={carregando}
                  >
                    {mostrarSenha ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {erro && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {erro}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />

                    Entrar
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Cadastro */}

          <div className="border-t bg-muted/20 p-6 sm:px-8">
            <p className="text-center text-sm text-muted-foreground">
              Ainda não possui uma conta?
            </p>

            <Link
              href="/cadastro"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Criar conta
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Acesse com segurança os dados
          fiscais das suas empresas.
        </p>
      </div>
    </main>
  );
}
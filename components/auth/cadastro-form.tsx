"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import { register } from "@/actions/auth/register";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function emailValido(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

export function CadastroForm() {
  const router = useRouter();

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  function limparErro() {
    if (erro) {
      setErro("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const nomeNormalizado =
      nome.trim();

    const emailNormalizado =
      email
        .trim()
        .toLowerCase();

    if (!nomeNormalizado) {
      setErro(
        "Informe seu nome completo."
      );

      return;
    }

    if (!emailNormalizado) {
      setErro(
        "Informe seu e-mail."
      );

      return;
    }

    if (
      !emailValido(
        emailNormalizado
      )
    ) {
      setErro(
        "Informe um e-mail válido."
      );

      return;
    }

    if (!senha) {
      setErro(
        "Informe uma senha."
      );

      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    if (!confirmarSenha) {
      setErro(
        "Confirme sua senha."
      );

      return;
    }

    if (
      senha !== confirmarSenha
    ) {
      setErro(
        "As senhas não conferem."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await register({
          nome:
            nomeNormalizado,

          email:
            emailNormalizado,

          senha,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      router.replace(
        "/entrar?cadastro=sucesso"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao realizar cadastro:",
        error
      );

      setErro(
        "Não foi possível criar sua conta. Tente novamente."
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
                Crie a conta inicial do
                proprietário da plataforma.
              </p>
            </div>

            {/* Formulário */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              <div className="space-y-2">
                <label
                  htmlFor="nome"
                  className="text-sm font-medium"
                >
                  Nome completo
                </label>

                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  className="h-12"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(event) => {
                    setNome(
                      event.target.value
                    );

                    limparErro();
                  }}
                  autoComplete="name"
                  disabled={carregando}
                  required
                />
              </div>

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

                    limparErro();
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
                    placeholder="Crie uma senha"
                    value={senha}
                    onChange={(event) => {
                      setSenha(
                        event.target.value
                      );

                      limparErro();
                    }}
                    autoComplete="new-password"
                    minLength={6}
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
                    className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                    aria-pressed={
                      mostrarSenha
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

                <p className="text-xs text-muted-foreground">
                  Utilize pelo menos 6
                  caracteres.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmarSenha"
                  className="text-sm font-medium"
                >
                  Confirmar senha
                </label>

                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={
                      mostrarConfirmacao
                        ? "text"
                        : "password"
                    }
                    className="h-12 pr-12"
                    placeholder="Digite novamente sua senha"
                    value={confirmarSenha}
                    onChange={(event) => {
                      setConfirmarSenha(
                        event.target.value
                      );

                      limparErro();
                    }}
                    autoComplete="new-password"
                    minLength={6}
                    disabled={carregando}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacao(
                        (valorAtual) =>
                          !valorAtual
                      )
                    }
                    className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      mostrarConfirmacao
                        ? "Ocultar confirmação da senha"
                        : "Mostrar confirmação da senha"
                    }
                    aria-pressed={
                      mostrarConfirmacao
                    }
                    disabled={carregando}
                  >
                    {mostrarConfirmacao ? (
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
                  aria-live="polite"
                  className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{erro}</p>
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

                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />

                    Criar conta
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Login */}

          <div className="border-t bg-muted/20 p-6 sm:px-8">
            <p className="text-center text-sm text-muted-foreground">
              Já possui uma conta?
            </p>

            <Link
              href="/entrar"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Fazer login
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Após a criação do proprietário,
          os demais usuários deverão ser
          cadastrados pelo painel.
        </p>
      </div>
    </main>
  );
}
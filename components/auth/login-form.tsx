"use client";

import Link from "next/link";

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  BadgeCheck,
  LoaderCircle,
  LogIn,
} from "lucide-react";

import { signIn } from "next-auth/react";

import { CampoSenha } from "@/components/auth/campo-senha";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function obterMensagemErroLogin(
  erro: string
) {
  let erroNormalizado = erro;

  try {
    erroNormalizado =
      decodeURIComponent(erro);
  } catch {
    erroNormalizado = erro;
  }

  if (
    erroNormalizado.includes(
      "USUARIO_INATIVO"
    )
  ) {
    return "Sua conta está inativa. Entre em contato com o proprietário ou administrador da plataforma.";
  }

  if (
    erroNormalizado.includes(
      "CREDENCIAIS_INVALIDAS"
    )
  ) {
    return "E-mail ou senha inválidos.";
  }

  if (
    erroNormalizado.includes(
      "CredentialsSignin"
    )
  ) {
    return "E-mail ou senha inválidos.";
  }

  return "Não foi possível realizar o login.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    cadastroSucesso,
    setCadastroSucesso,
  ] = useState(false);

  useEffect(() => {
    setCadastroSucesso(
      searchParams.get("cadastro") ===
        "sucesso"
    );
  }, [searchParams]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const emailNormalizado =
      email
        .trim()
        .toLowerCase();

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

      if (!resultado) {
        setErro(
          "Não foi possível realizar o login."
        );

        return;
      }

      if (
        resultado.error ||
        !resultado.ok
      ) {
        setErro(
          obterMensagemErroLogin(
            resultado.error ?? ""
          )
        );

        return;
      }

      router.replace(
        "/painel"
      );

      router.refresh();
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

  function limparErro() {
    if (erro) {
      setErro("");
    }
  }

  return (
    <div className="space-y-6">
      {cadastroSucesso && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <BadgeCheck
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p>
            Conta criada com sucesso.
            Faça login para continuar.
          </p>
        </div>
      )}

      <form
        onSubmit={handleLogin}
        className="space-y-5"
        noValidate
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
            className="h-11"
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

        <CampoSenha
          id="senha"
          name="senha"
          label="Senha"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(valor) => {
            setSenha(valor);
            limparErro();
          }}
          autoComplete="current-password"
          disabled={carregando}
          required
        />

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
          className="h-11 w-full"
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

      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 flex items-center"
        >
          <div className="w-full border-t border-border/80" />
        </div>

        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-background px-3 text-muted-foreground">
            ou
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não possui uma conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

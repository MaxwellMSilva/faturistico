"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import { register } from "@/actions/auth/register";

import { CampoSenha } from "@/components/auth/campo-senha";

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
    <div className="space-y-6">
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
            className="h-11"
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
          placeholder="Crie uma senha"
          value={senha}
          onChange={(valor) => {
            setSenha(valor);
            limparErro();
          }}
          autoComplete="new-password"
          minLength={6}
          disabled={carregando}
          required
          ajuda="Utilize pelo menos 6 caracteres."
        />

        <CampoSenha
          id="confirmarSenha"
          name="confirmarSenha"
          label="Confirmar senha"
          placeholder="Digite novamente sua senha"
          value={confirmarSenha}
          onChange={(valor) => {
            setConfirmarSenha(valor);
            limparErro();
          }}
          autoComplete="new-password"
          minLength={6}
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

      <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs leading-5 text-muted-foreground">
        Esta etapa cria a conta do
        proprietário da plataforma. Os
        demais usuários devem ser
        cadastrados posteriormente pelo
        painel.
      </p>

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
        Já possui uma conta?{" "}
        <Link
          href="/entrar"
          className="font-medium text-primary hover:underline"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
}

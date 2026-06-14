"use client";

import Link from "next/link";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { register } from "@/actions/auth/register";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CadastroForm() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [
    confirmarSenha,
    setConfirmarSenha,
  ] = useState("");

  const [carregando, setCarregando] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha ||
      !confirmarSenha
    ) {
      alert(
        "Preencha todos os campos."
      );

      return;
    }

    if (senha !== confirmarSenha) {
      alert(
        "As senhas não conferem."
      );

      return;
    }

    if (senha.length < 6) {
      alert(
        "A senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado = await register({
        nome,
        email,
        senha,
      });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        "Cadastro realizado com sucesso."
      );

      router.replace("/entrar");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível realizar o cadastro."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Faturístico
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua conta para começar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Input
            className="h-12"
            type="text"
            placeholder="Nome completo"
            autoComplete="name"
            value={nome}
            onChange={(event) =>
              setNome(event.target.value)
            }
            disabled={carregando}
            required
          />

          <Input
            className="h-12"
            type="email"
            placeholder="E-mail"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            disabled={carregando}
            required
          />

          <Input
            className="h-12"
            type="password"
            placeholder="Senha"
            autoComplete="new-password"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
            disabled={carregando}
            minLength={6}
            required
          />

          <Input
            className="h-12"
            type="password"
            placeholder="Confirmar senha"
            autoComplete="new-password"
            value={confirmarSenha}
            onChange={(event) =>
              setConfirmarSenha(
                event.target.value
              )
            }
            disabled={carregando}
            minLength={6}
            required
          />

          <Button
            type="submit"
            className="h-12 w-full"
            disabled={carregando}
          >
            {carregando
              ? "Cadastrando..."
              : "Criar conta"}
          </Button>
        </form>

        <div className="mt-6 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já possui uma conta?
          </p>

          <Link
            href="/entrar"
            className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  );
}
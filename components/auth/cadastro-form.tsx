"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { register } from "@/actions/auth/register";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CadastroForm() {
  const router = useRouter();

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  const [confirmarSenha,
    setConfirmarSenha] =
    useState("");

  async function handleSubmit() {
    try {
      if (
        senha !== confirmarSenha
      ) {
        alert(
          "As senhas não conferem."
        );

        return;
      }

      await register({
        nome,
        email,
        senha,
      });

      alert(
        "Cadastro realizado com sucesso."
      );

      router.push("/entrar");

    } catch (error) {
      console.error(error);

      alert(
        "Erro ao cadastrar usuário."
      );
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

        <div className="space-y-4">

          <Input
            className="h-12"
            placeholder="Nome Completo"
          />

          <Input
            className="h-12"
            placeholder="E-mail"
          />

          <Input
            className="h-12"
            type="password"
            placeholder="Senha"
          />

          <Input
            className="h-12"
            type="password"
            placeholder="Confirmar Senha"
          />

          <Button
            className="h-12 w-full"
          >
            Criar Conta
          </Button> 

        </div>

        <div className="mt-6 border-t pt-6 text-center">

          <p className="text-sm text-muted-foreground">
            Já possui uma conta?
          </p>

          <Link
            href="/entrar"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Fazer Login
          </Link>

        </div>

      </div>

    </div>
  );
}
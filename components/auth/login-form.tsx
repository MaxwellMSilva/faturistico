"use client";

import Link from "next/link";

import { useState } from "react";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] =
    useState("");

  const [senha, setSenha] =
    useState("");

  async function handleLogin() {
    const result = await signIn(
      "credentials",
      {
        email,
        senha,
        redirect: false,
      }
    );

    if (result?.error) {
      alert("Login inválido");
      return;
    }

    window.location.href =
      "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">

      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold">
            Faturístico
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sistema de gestão fiscal e emissão de documentos
          </p>

        </div>

        <div className="space-y-4">

          <Input
            className="h-12"
            placeholder="E-mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Input
            className="h-12"
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
          />

          <Button
            onClick={handleLogin}
            className="h-12 w-full"
          >
            Entrar
          </Button>

        </div>

        <div className="mt-6 border-t pt-6 text-center">

          <p className="text-sm text-muted-foreground">
            Ainda não possui conta?
          </p>

          <Link
            href="/cadastro"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Criar Conta
          </Link>

        </div>

      </div>

    </div>
  );
}
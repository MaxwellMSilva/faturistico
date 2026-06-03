"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

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
    <div className="w-full space-y-4 rounded-xl border p-6">

      <h1 className="text-2xl font-bold">
        Entrar
      </h1>

      <input
        className="w-full rounded border p-2"
        placeholder="E-mail"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        className="w-full rounded border p-2"
        placeholder="Senha"
        value={senha}
        onChange={(e) =>
          setSenha(e.target.value)
        }
      />

      <button
        onClick={handleLogin}
        className="w-full rounded-lg bg-black px-4 py-2 text-white"
      >
        Entrar
      </button>

    </div>
  );
}
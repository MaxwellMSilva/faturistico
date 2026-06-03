"use client";

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
    <div className="w-full space-y-4 rounded-xl border p-6">

      <h1 className="text-2xl font-bold">
        Criar Conta
      </h1>

      <Input
        placeholder="Nome"
        value={nome}
        onChange={(e) =>
          setNome(e.target.value)
        }
      />

      <Input
        placeholder="E-mail"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) =>
          setSenha(e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Confirmar senha"
        value={confirmarSenha}
        onChange={(e) =>
          setConfirmarSenha(
            e.target.value
          )
        }
      />

      <Button
        onClick={handleSubmit}
        className="w-full"
      >
        Cadastrar
      </Button>

    </div>
  );
}
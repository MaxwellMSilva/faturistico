"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";

import { deleteNaturezaOperacao } from "@/actions/naturezas-operacao/delete-natureza-operacao";

import { Button } from "@/components/ui/button";

type Props = {
  empresaId: string;

  naturezaId: string;

  descricao: string;
};

export function NaturezaDeleteButton({
  empresaId,
  naturezaId,
  descricao,
}: Props) {
  const router = useRouter();

  const [carregando, setCarregando] =
    useState(false);

  async function handleDelete() {
    const confirmado =
      window.confirm(
        `Deseja realmente excluir a natureza "${descricao}"?`
      );

    if (!confirmado) {
      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await deleteNaturezaOperacao({
          empresaId,
          naturezaId,
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        "Natureza excluída com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível excluir a natureza de operação."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={carregando}
    >
      <Trash2 size={16} />

      {carregando
        ? "Excluindo..."
        : "Excluir"}
    </Button>
  );
}
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";

import { deleteProduto } from "@/actions/produtos/delete-produto";

import { Button } from "@/components/ui/button";

type Props = {
  empresaId: string;

  produtoId: string;

  produtoDescricao: string;
};

export function ProdutoDeleteButton({
  empresaId,
  produtoId,
  produtoDescricao,
}: Props) {
  const router = useRouter();

  const [carregando, setCarregando] =
    useState(false);

  async function handleDelete() {
    const confirmado =
      window.confirm(
        `Deseja realmente excluir o produto "${produtoDescricao}"?`
      );

    if (!confirmado) {
      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await deleteProduto({
          empresaId,
          produtoId,
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        "Produto excluído com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível excluir o produto."
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
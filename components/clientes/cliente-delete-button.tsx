"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";

import { deleteCliente } from "@/actions/clientes/delete-cliente";

import { Button } from "@/components/ui/button";

type Props = {
  empresaId: string;
  clienteId: string;
  clienteNome: string;
};

export function ClienteDeleteButton({
  empresaId,
  clienteId,
  clienteNome,
}: Props) {
  const router = useRouter();

  const [carregando, setCarregando] =
    useState(false);

  async function handleDelete() {
    const confirmado = window.confirm(
      `Deseja realmente excluir o cliente "${clienteNome}"?`
    );

    if (!confirmado) {
      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await deleteCliente({
          empresaId,
          clienteId,
        });

      if (!resultado.success) {
        alert(resultado.message);
        return;
      }

      alert(
        "Cliente excluído com sucesso."
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível excluir o cliente."
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
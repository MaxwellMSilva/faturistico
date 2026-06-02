"use client";

import { useRouter } from "next/navigation";

import { deleteCliente } from "@/actions/clientes/delete-cliente";

type Props = {
  id: string;
  nome: string;
};

export function ClienteDeleteButton({
  id,
  nome,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmar = confirm(
      `Deseja excluir ${nome}?`
    );

    if (!confirmar) return;

    await deleteCliente(id);

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-500 hover:bg-red-50"
    >
      Excluir
    </button>
  );
}
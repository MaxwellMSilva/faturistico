"use client";

import { useRouter } from "next/navigation";

import { deleteProduto } from "@/actions/produtos/delete-produto";

type Props = {
  id: string;
  descricao: string;
};

export function ProdutoDeleteButton({
  id,
  descricao,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmar = confirm(
      `Deseja excluir ${descricao}?`
    );

    if (!confirmar) return;

    await deleteProduto(id);

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
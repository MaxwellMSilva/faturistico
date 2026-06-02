"use client";

import { useRouter } from "next/navigation";

import { deleteNaturezaOperacao } from "@/actions/naturezas-operacao/delete-natureza-operacao";

type Props = {
  id: string;
  descricao: string;
};

export function NaturezaOperacaoDeleteButton({
  id,
  descricao,
}: Props) {
  const router = useRouter();

  async function handleDelete() {
    const confirmar = confirm(
      `Deseja excluir ${descricao}?`
    );

    if (!confirmar) return;

    await deleteNaturezaOperacao(id);

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
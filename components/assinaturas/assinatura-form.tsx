"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { createAssinatura } from "@/actions/assinaturas/create-assinatura";

import { useSession } from "next-auth/react";

type Modulo = {
  id: string;
  nome: string;
  codigo: string;
  valor: number;
};

type Props = {
  modulos: Modulo[];
};

type CreateAssinaturaData = {
  usuarioId: string;
  moduloIds: string[];
};

export function AssinaturaForm({
  modulos,
}: Props) {

    const { data: session } =
    useSession();

    const router = useRouter();

    async function handleAssinar() {
    if (selecionados.length === 0) {
        alert(
        "Selecione pelo menos um módulo."
        );

        return;
    }

    try {

      if (!session?.user?.id) {
        alert(
          "Você precisa estar logado."
        );

        return;
      }

        await createAssinatura({
          usuarioId:
            session.user.id,
          moduloIds: selecionados,
        });

        alert(
        "Assinatura criada com sucesso."
        );

        router.push("/empresa/nova");
      } catch (error: any) {
        console.error(error);

        alert(
          error?.message ||
          JSON.stringify(error)
        );
      }
    }

  const [selecionados, setSelecionados] =
    useState<string[]>([]);

  const total = useMemo(() => {
    return modulos
      .filter((m) =>
        selecionados.includes(m.id)
      )
      .reduce(
        (acc, modulo) =>
          acc + modulo.valor,
        0
      );
  }, [selecionados, modulos]);

  function toggleModulo(id: string) {
    setSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  return (
    <div className="space-y-6">

      <div className="rounded-xl border p-6">

        <div className="space-y-4">

          {modulos.map((modulo) => (
            <label
              key={modulo.id}
              className="flex cursor-pointer items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  checked={selecionados.includes(
                    modulo.id
                  )}
                  onChange={() =>
                    toggleModulo(modulo.id)
                  }
                />

                <span>
                  {modulo.nome}
                </span>

              </div>

              <span>
                R$ {modulo.valor.toFixed(2)}
              </span>

            </label>
          ))}

        </div>

      </div>

      <div className="flex items-center justify-between rounded-xl border p-6">

        <div>

          <p className="text-sm text-muted-foreground">
            Total Mensal
          </p>

          <h2 className="text-3xl font-bold">
            R$ {total.toFixed(2)}
          </h2>

        </div>

        <button
        onClick={handleAssinar}
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground"
        >
            Assinar
        </button>

      </div>

    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  LoaderCircle,
  Trash2,
} from "lucide-react";

import { deleteCte } from "@/actions/cte/delete-cte";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Props = {
  empresaId: string;
  cteId: string;
  numero: number;
  serie: number;
  remetenteNome: string;
};

function formatarNumero(
  numero: number
) {
  return String(numero).padStart(
    9,
    "0"
  );
}

export function CteDeleteButton({
  empresaId,
  cteId,
  numero,
  serie,
  remetenteNome,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);
  const [carregando, setCarregando] =
    useState(false);
  const [erro, setErro] =
    useState("");

  async function handleDelete() {
    setErro("");

    try {
      setCarregando(true);

      const resultado =
        await deleteCte(
          empresaId,
          cteId
        );

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      setAberto(false);
      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao excluir rascunho do CT-e:",
        error
      );

      setErro(
        "Não foi possível excluir o rascunho. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <AlertDialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (!valor) {
          setErro("");
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <Trash2 size={16} />
        Excluir
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle size={23} />
          </div>

          <AlertDialogTitle>
            Excluir rascunho do CT-e
          </AlertDialogTitle>

          <AlertDialogDescription>
            Você está prestes a excluir definitivamente o CT-e{" "}
            <strong className="font-semibold text-foreground">
              nº {formatarNumero(numero)}
            </strong>
            , série{" "}
            <strong className="font-semibold text-foreground">
              {serie}
            </strong>
            , do remetente{" "}
            <strong className="font-semibold text-foreground">
              {remetenteNome}
            </strong>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
          <p className="font-medium text-destructive">
            Esta ação não poderá ser desfeita.
          </p>

          <p className="mt-1 text-muted-foreground">
            Participantes, documentos vinculados, carga e valores deste rascunho também serão removidos.
          </p>
        </div>

        {erro && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {erro}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={carregando}
          >
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={carregando}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {carregando ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Confirmar exclusão
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

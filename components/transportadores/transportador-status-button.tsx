"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  LoaderCircle,
  Power,
  PowerOff,
} from "lucide-react";

import { alterarStatusTransportador } from "@/actions/transportadores/alterar-status-transportador";

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
  transportadorId: string;
  transportadorNome: string;
  ativo: boolean;
};

export function TransportadorStatusButton({
  empresaId,
  transportadorId,
  transportadorNome,
  ativo,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const vaiAtivar = !ativo;

  async function handleAlterarStatus() {
    setErro("");

    try {
      setCarregando(true);

      const resultado =
        await alterarStatusTransportador({
          empresaId,
          transportadorId,
          ativo: vaiAtivar,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao alterar status do transportador:",
        error
      );

      setErro(
        "Não foi possível alterar o status do transportador. Tente novamente."
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
            className={
              vaiAtivar
                ? "border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400"
                : "border-amber-500/30 text-amber-700 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-400"
            }
          />
        }
      >
        {vaiAtivar ? (
          <>
            <Power size={16} />

            Ativar
          </>
        ) : (
          <>
            <PowerOff size={16} />

            Inativar
          </>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={
              vaiAtivar
                ? "mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"
                : "mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600"
            }
          >
            {vaiAtivar ? (
              <Power size={23} />
            ) : (
              <AlertTriangle
                size={23}
              />
            )}
          </div>

          <AlertDialogTitle>
            {vaiAtivar
              ? "Ativar transportador"
              : "Inativar transportador"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            Você está prestes a{" "}
            {vaiAtivar
              ? "ativar"
              : "inativar"}{" "}
            o transportador{" "}
            <strong className="font-semibold text-foreground">
              {transportadorNome}
            </strong>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div
          className={
            vaiAtivar
              ? "rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm"
              : "rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm"
          }
        >
          {vaiAtivar ? (
            <>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                O transportador voltará a
                ficar disponível.
              </p>

              <p className="mt-1 text-muted-foreground">
                Ele poderá ser utilizado
                novamente em novas
                operações, notas fiscais e
                transportes.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-amber-700 dark:text-amber-400">
                O histórico será
                preservado.
              </p>

              <p className="mt-1 text-muted-foreground">
                O transportador deixará de
                ficar disponível para novas
                operações, mas continuará
                vinculado aos registros já
                existentes.
              </p>
            </>
          )}
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

              void handleAlterarStatus();
            }}
            disabled={carregando}
            className={
              vaiAtivar
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }
          >
            {carregando ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                {vaiAtivar
                  ? "Ativando..."
                  : "Inativando..."}
              </>
            ) : vaiAtivar ? (
              <>
                <Power size={16} />

                Confirmar ativação
              </>
            ) : (
              <>
                <PowerOff size={16} />

                Confirmar inativação
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

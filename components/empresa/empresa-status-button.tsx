"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  LoaderCircle,
  Power,
  PowerOff,
} from "lucide-react";

import { toggleStatusEmpresa } from "@/actions/empresa/toggle-status-empresa";

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
  empresaNome: string;
  ativo: boolean;
};

export function EmpresaStatusButton({
  empresaId,
  empresaNome,
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

  async function handleConfirmar() {
    setErro("");

    try {
      setCarregando(true);

      const resultado =
        await toggleStatusEmpresa({
          empresaId,
          ativo: !ativo,
        });

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao alterar status da empresa:",
        error
      );

      setErro(
        "Não foi possível alterar o status da empresa."
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
              ativo
                ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                : "border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700"
            }
          />
        }
      >
        {ativo ? (
          <PowerOff size={16} />
        ) : (
          <Power size={16} />
        )}

        {ativo
          ? "Inativar"
          : "Ativar"}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={[
              "mb-2 flex h-12 w-12 items-center justify-center rounded-xl",
              ativo
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-700",
            ].join(" ")}
          >
            {ativo ? (
              <PowerOff size={23} />
            ) : (
              <Power size={23} />
            )}
          </div>

          <AlertDialogTitle>
            {ativo
              ? "Inativar empresa"
              : "Ativar empresa"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {ativo
              ? `A empresa "${empresaNome}" será colocada em modo de consulta.`
              : `A empresa "${empresaNome}" voltará a permitir alterações.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div className="text-sm">
            <p className="font-medium">
              {ativo
                ? "Nenhum dado será excluído."
                : "As operações serão liberadas novamente."}
            </p>

            <p className="mt-1 text-muted-foreground">
              {ativo
                ? "Somente o proprietário poderá acessar a empresa enquanto ela estiver inativa, sem realizar alterações."
                : "Usuários vinculados poderão voltar a acessar a empresa conforme suas permissões."}
            </p>
          </div>
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

              void handleConfirmar();
            }}
            disabled={carregando}
            className={
              ativo
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-emerald-600 text-white hover:bg-emerald-600/90"
            }
          >
            {carregando ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Salvando...
              </>
            ) : ativo ? (
              <>
                <PowerOff size={16} />

                Confirmar inativação
              </>
            ) : (
              <>
                <Power size={16} />

                Confirmar ativação
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
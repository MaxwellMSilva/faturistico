"use client";

import {
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  FileDown,
  LoaderCircle,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import { cancelarCte } from "@/actions/cte/cancelar-cte";
import { consultarCte } from "@/actions/cte/consultar-cte";
import { deleteCte } from "@/actions/cte/delete-cte";
import { emitirCte } from "@/actions/cte/emitir-cte";
import { validarCteAction } from "@/actions/cte/validar-cte";
import { Button } from "@/components/ui/button";

type Props = {
  empresaId: string;
  cteId: string;
  status: string;
  podeValidar: boolean;
  podeEmitir: boolean;
  podeCancelar: boolean;
  podeExcluir: boolean;
  possuiXml: boolean;
};

export function CteActions({
  empresaId,
  cteId,
  status,
  podeValidar,
  podeEmitir,
  podeCancelar,
  podeExcluir,
  possuiXml,
}: Props) {
  const router = useRouter();
  const [pendente, iniciar] =
    useTransition();

  const [mensagem, setMensagem] =
    useState("");
  const [erro, setErro] =
    useState("");
  const [mostrarCancelamento, setMostrarCancelamento] =
    useState(false);
  const [justificativa, setJustificativa] =
    useState("");

  function executar(
    tarefa: () => Promise<{
      success: boolean;
      message?: string;
      erros?: Array<{
        mensagem: string;
      }>;
    }>
  ) {
    setMensagem("");
    setErro("");

    iniciar(async () => {
      const resultado = await tarefa();

      if (!resultado.success) {
        const detalhes =
          resultado.erros?.length
            ? ` ${resultado.erros
                .map(
                  (item) => item.mensagem
                )
                .join(" ")}`
            : "";

        setErro(
          `${resultado.message ?? "A operação não foi concluída."}${detalhes}`
        );
        router.refresh();
        return;
      }

      setMensagem(
        resultado.message ??
          "Operação concluída com sucesso."
      );
      router.refresh();
    });
  }

  function handleExcluir() {
    if (
      !window.confirm(
        "Excluir este rascunho de CT-e? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    setMensagem("");
    setErro("");

    iniciar(async () => {
      const resultado = await deleteCte(
        empresaId,
        cteId
      );

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      router.push(
        `/empresa/${empresaId}/cte`
      );
      router.refresh();
    });
  }

  function handleCancelar() {
    executar(() =>
      cancelarCte(
        empresaId,
        cteId,
        justificativa
      )
    );
  }

  const podeRevalidar =
    [
      "RASCUNHO",
      "VALIDADO",
      "REJEITADO",
    ].includes(status);

  const podeTransmitir =
    [
      "RASCUNHO",
      "VALIDADO",
      "REJEITADO",
    ].includes(status);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {podeValidar &&
          podeRevalidar && (
            <Button
              type="button"
              variant="outline"
              disabled={pendente}
              onClick={() =>
                executar(() =>
                  validarCteAction(
                    empresaId,
                    cteId
                  )
                )
              }
            >
              {pendente ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <CheckCircle2 />
              )}
              Validar
            </Button>
          )}

        {podeEmitir &&
          podeTransmitir && (
            <Button
              type="button"
              disabled={pendente}
              onClick={() =>
                executar(() =>
                  emitirCte(
                    empresaId,
                    cteId
                  )
                )
              }
            >
              {pendente ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Send />
              )}
              Emitir CT-e
            </Button>
          )}

        {[
          "AUTORIZADO",
          "CANCELADO",
          "PROCESSANDO",
        ].includes(status) && (
          <Button
            type="button"
            variant="outline"
            disabled={pendente}
            onClick={() =>
              executar(() =>
                consultarCte(
                  empresaId,
                  cteId
                )
              )
            }
          >
            <RefreshCw
              className={
                pendente
                  ? "animate-spin"
                  : ""
              }
            />
            Consultar SEFAZ
          </Button>
        )}

        {status === "AUTORIZADO" && (
          <Link
            href={`/empresa/${empresaId}/cte/${cteId}/dacte`}
            target="_blank"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium transition hover:bg-muted"
          >
            <FileDown size={16} />
            DACTE
          </Link>
        )}

        {possuiXml && (
          <Link
            href={`/api/cte/${cteId}/xml`}
            target="_blank"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border bg-background px-2.5 text-sm font-medium transition hover:bg-muted"
          >
            <FileDown size={16} />
            XML
          </Link>
        )}

        {podeCancelar &&
          status === "AUTORIZADO" && (
            <Button
              type="button"
              variant="destructive"
              disabled={pendente}
              onClick={() =>
                setMostrarCancelamento(
                  (valor) => !valor
                )
              }
            >
              <Ban />
              Cancelar CT-e
            </Button>
          )}

        {podeExcluir &&
          status === "RASCUNHO" && (
            <Button
              type="button"
              variant="destructive"
              disabled={pendente}
              onClick={handleExcluir}
            >
              <Trash2 />
              Excluir rascunho
            </Button>
          )}
      </div>

      {mostrarCancelamento && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
          <label className="text-sm font-medium">
            Justificativa do cancelamento
          </label>
          <textarea
            value={justificativa}
            onChange={(event) =>
              setJustificativa(
                event.target.value
              )
            }
            rows={3}
            maxLength={255}
            placeholder="Informe o motivo com no mínimo 15 caracteres."
            className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/15"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {justificativa.length}/255 caracteres
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={
                pendente ||
                justificativa.trim()
                  .length < 15
              }
              onClick={handleCancelar}
            >
              {pendente && (
                <LoaderCircle className="animate-spin" />
              )}
              Confirmar cancelamento
            </Button>
          </div>
        </div>
      )}

      {mensagem && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}
    </div>
  );
}

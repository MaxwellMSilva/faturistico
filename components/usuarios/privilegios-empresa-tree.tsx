"use client";

import type {
  PrivilegioEmpresa,
} from "@prisma/client";

import {
  CheckCheck,
  ShieldCheck,
} from "lucide-react";

export type GrupoPrivilegioProp = {
  id: string;
  titulo: string;
  descricao: string;

  privilegios: Array<{
    valor: PrivilegioEmpresa;
    titulo: string;
    descricao: string;
  }>;
};

type Props = {
  grupos: GrupoPrivilegioProp[];

  selecionados:
    PrivilegioEmpresa[];

  onChange: (
    privilegios:
      PrivilegioEmpresa[]
  ) => void;

  disabled?: boolean;
};

export function PrivilegiosEmpresaTree({
  grupos,
  selecionados,
  onChange,
  disabled = false,
}: Props) {
  const selecionadosSet =
    new Set(selecionados);

  const todosPrivilegios =
    grupos.flatMap(
      (grupo) =>
        grupo.privilegios.map(
          (item) => item.valor
        )
    );

  const todosSelecionados =
    todosPrivilegios.length > 0 &&
    todosPrivilegios.every(
      (privilegio) =>
        selecionadosSet.has(
          privilegio
        )
    );

  function alternarTodos() {
    if (disabled) {
      return;
    }

    onChange(
      todosSelecionados
        ? []
        : todosPrivilegios
    );
  }

  function alternarGrupo(
    privilegiosGrupo:
      PrivilegioEmpresa[]
  ) {
    if (disabled) {
      return;
    }

    const grupoCompleto =
      privilegiosGrupo.every(
        (privilegio) =>
          selecionadosSet.has(
            privilegio
          )
      );

    const novos =
      new Set(selecionados);

    if (grupoCompleto) {
      privilegiosGrupo.forEach(
        (privilegio) =>
          novos.delete(
            privilegio
          )
      );
    } else {
      privilegiosGrupo.forEach(
        (privilegio) =>
          novos.add(
            privilegio
          )
      );
    }

    onChange(
      Array.from(novos)
    );
  }

  function alternarPrivilegio(
    privilegio:
      PrivilegioEmpresa
  ) {
    if (disabled) {
      return;
    }

    const novos =
      new Set(selecionados);

    if (
      novos.has(
        privilegio
      )
    ) {
      novos.delete(
        privilegio
      );
    } else {
      novos.add(
        privilegio
      );
    }

    onChange(
      Array.from(novos)
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck size={20} />
          </div>

          <div>
            <p className="font-medium">
              Privilégios personalizados
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {selecionados.length} de{" "}
              {todosPrivilegios.length}{" "}
              privilégios selecionados.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={alternarTodos}
          disabled={disabled}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={16} />

          {todosSelecionados
            ? "Desmarcar todos"
            : "Selecionar todos"}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {grupos.map(
          (grupo) => {
            const privilegiosGrupo =
              grupo.privilegios.map(
                (item) =>
                  item.valor
              );

            const quantidadeSelecionada =
              privilegiosGrupo.filter(
                (privilegio) =>
                  selecionadosSet.has(
                    privilegio
                  )
              ).length;

            const grupoCompleto =
              quantidadeSelecionada ===
                privilegiosGrupo.length &&
              privilegiosGrupo.length >
                0;

            return (
              <section
                key={grupo.id}
                className="rounded-xl border bg-background"
              >
                <div className="border-b bg-muted/20 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-primary"
                      checked={
                        grupoCompleto
                      }
                      onChange={() =>
                        alternarGrupo(
                          privilegiosGrupo
                        )
                      }
                      disabled={disabled}
                    />

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-3">
                        <span className="font-semibold">
                          {grupo.titulo}
                        </span>

                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {
                            quantidadeSelecionada
                          }
                          /
                          {
                            privilegiosGrupo.length
                          }
                        </span>
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {grupo.descricao}
                      </span>
                    </span>
                  </label>
                </div>

                <div className="space-y-1 p-3">
                  {grupo.privilegios.map(
                    (item) => (
                      <label
                        key={
                          item.valor
                        }
                        className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/40"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 accent-primary"
                          checked={selecionadosSet.has(
                            item.valor
                          )}
                          onChange={() =>
                            alternarPrivilegio(
                              item.valor
                            )
                          }
                          disabled={
                            disabled
                          }
                        />

                        <span>
                          <span className="block text-sm font-medium">
                            {item.titulo}
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {
                              item.descricao
                            }
                          </span>
                        </span>
                      </label>
                    )
                  )}
                </div>
              </section>
            );
          }
        )}
      </div>
    </div>
  );
}
"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Pencil,
  Plus,
} from "lucide-react";

import { createNaturezaOperacao } from "@/actions/naturezas-operacao/create-natureza-operacao";
import { updateNaturezaOperacao } from "@/actions/naturezas-operacao/update-natureza-operacao";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type FinalidadeNfe =
  | "NORMAL"
  | "COMPLEMENTAR"
  | "AJUSTE"
  | "DEVOLUCAO";

type Natureza = {
  id: string;

  descricao: string;
  cfop: string;

  finalidadeNfe: FinalidadeNfe;

  consumidorFinal: boolean;
  contribuinteIcms: boolean;

  ativo: boolean;
};

type Props = {
  empresaId: string;

  natureza?: Natureza;
};

const finalidades = [
  {
    value: "NORMAL",
    label: "NF-e normal",
  },
  {
    value: "COMPLEMENTAR",
    label: "NF-e complementar",
  },
  {
    value: "AJUSTE",
    label: "NF-e de ajuste",
  },
  {
    value: "DEVOLUCAO",
    label: "Devolução",
  },
] satisfies Array<{
  value: FinalidadeNfe;
  label: string;
}>;

export function NaturezaOperacaoDialog({
  empresaId,
  natureza,
}: Props) {
  const router = useRouter();

  const editando =
    Boolean(natureza);

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  function criarEstadoInicial() {
    return {
      descricao:
        natureza?.descricao ?? "",

      cfop:
        natureza?.cfop ?? "",

      finalidadeNfe:
        natureza?.finalidadeNfe ??
        ("NORMAL" as FinalidadeNfe),

      consumidorFinal:
        natureza?.consumidorFinal ??
        false,

      contribuinteIcms:
        natureza?.contribuinteIcms ??
        true,

      ativo:
        natureza?.ativo ?? true,
    };
  }

  const [form, setForm] =
    useState(criarEstadoInicial);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.descricao.trim()) {
      alert(
        "Informe a descrição."
      );

      return;
    }

    if (
      form.cfop.replace(/\D/g, "")
        .length !== 4
    ) {
      alert(
        "Informe um CFOP com 4 números."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        natureza
          ? await updateNaturezaOperacao({
              id: natureza.id,
              empresaId,

              ...form,
            })
          : await createNaturezaOperacao({
              empresaId,

              ...form,
            });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        editando
          ? "Natureza atualizada com sucesso."
          : "Natureza cadastrada com sucesso."
      );

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível salvar a natureza de operação."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={
            editando
              ? "outline"
              : "default"
          }
          size={
            editando
              ? "sm"
              : "default"
          }
        >
          {editando ? (
            <Pencil size={16} />
          ) : (
            <Plus size={17} />
          )}

          {editando
            ? "Editar"
            : "Nova Natureza"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editando
              ? "Editar Natureza de Operação"
              : "Nova Natureza de Operação"}
          </DialogTitle>

          <DialogDescription>
            Configure o CFOP e a finalidade
            fiscal desta operação.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Descrição"
              value={form.descricao}
              onChange={(event) =>
                setForm(
                  (anterior) => ({
                    ...anterior,

                    descricao:
                      event.target.value,
                  })
                )
              }
              className="md:col-span-2"
              disabled={carregando}
              required
            />

            <Input
              placeholder="CFOP"
              inputMode="numeric"
              maxLength={4}
              value={form.cfop}
              onChange={(event) =>
                setForm(
                  (anterior) => ({
                    ...anterior,

                    cfop:
                      event.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(0, 4),
                  })
                )
              }
              disabled={carregando}
              required
            />

            <select
              value={
                form.finalidadeNfe
              }
              onChange={(event) =>
                setForm(
                  (anterior) => ({
                    ...anterior,

                    finalidadeNfe:
                      event.target
                        .value as FinalidadeNfe,
                  })
                )
              }
              className="h-10 rounded-md border bg-background px-3 text-sm"
              disabled={carregando}
            >
              {finalidades.map(
                (finalidade) => (
                  <option
                    key={
                      finalidade.value
                    }
                    value={
                      finalidade.value
                    }
                  >
                    {finalidade.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-3 rounded-xl border p-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={
                  form.consumidorFinal
                }
                onChange={(event) =>
                  setForm(
                    (anterior) => ({
                      ...anterior,

                      consumidorFinal:
                        event.target
                          .checked,
                    })
                  )
                }
                disabled={carregando}
              />

              <div>
                <p className="text-sm font-medium">
                  Consumidor final
                </p>

                <p className="text-xs text-muted-foreground">
                  Indica operação destinada ao consumidor final.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={
                  form.contribuinteIcms
                }
                onChange={(event) =>
                  setForm(
                    (anterior) => ({
                      ...anterior,

                      contribuinteIcms:
                        event.target
                          .checked,
                    })
                  )
                }
                disabled={carregando}
              />

              <div>
                <p className="text-sm font-medium">
                  Contribuinte de ICMS
                </p>

                <p className="text-xs text-muted-foreground">
                  Indica operação para destinatário contribuinte.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(event) =>
                  setForm(
                    (anterior) => ({
                      ...anterior,

                      ativo:
                        event.target
                          .checked,
                    })
                  )
                }
                disabled={carregando}
              />

              <div>
                <p className="text-sm font-medium">
                  Natureza ativa
                </p>

                <p className="text-xs text-muted-foreground">
                  Permite utilizar esta natureza em novas notas.
                </p>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={carregando}
            >
              {carregando
                ? "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Cadastrar natureza"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
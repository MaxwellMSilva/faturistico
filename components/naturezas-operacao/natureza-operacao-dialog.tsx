"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ClipboardList,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Settings2,
  X,
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
    label: "NF-e de devolução",
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

  type FormNatureza =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [form, setForm] =
    useState<FormNatureza>(
      criarEstadoInicial
    );

  function atualizarCampo<
    Campo extends keyof FormNatureza,
  >(
    campo: Campo,
    valor: FormNatureza[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const descricao =
      form.descricao.trim();

    const cfop =
      form.cfop.replace(
        /\D/g,
        ""
      );

    if (!descricao) {
      setErro(
        "Informe a descrição da natureza de operação."
      );

      return;
    }

    if (cfop.length !== 4) {
      setErro(
        "Informe um CFOP válido com 4 números."
      );

      return;
    }

    try {
      setCarregando(true);

      const dados = {
        empresaId,

        descricao,
        cfop,

        finalidadeNfe:
          form.finalidadeNfe,

        consumidorFinal:
          form.consumidorFinal,

        contribuinteIcms:
          form.contribuinteIcms,

        ativo:
          form.ativo,
      };

      const resultado =
        natureza
          ? await updateNaturezaOperacao({
              id: natureza.id,
              ...dados,
            })
          : await createNaturezaOperacao(
              dados
            );

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
        "Erro ao salvar natureza de operação:",
        error
      );

      setErro(
        "Não foi possível salvar a natureza de operação. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );

          setErro("");
        }
      }}
    >
      <DialogTrigger
        render={
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
            className={
              editando
                ? undefined
                : "h-11"
            }
          />
        }
      >
        {editando ? (
          <>
            <Pencil size={16} />
            Editar
          </>
        ) : (
          <>
            <Plus size={17} />
            Nova natureza
          </>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editando
              ? "Editar natureza de operação"
              : "Nova natureza de operação"}
          </DialogTitle>

          <DialogDescription>
            Configure o CFOP, a finalidade
            e as regras fiscais da operação.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Identificação */}

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ClipboardList
                  size={20}
                />
              </div>

              <div>
                <h3 className="font-semibold">
                  Identificação
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Informe a descrição,
                  o CFOP e a finalidade
                  desta operação.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`descricao-natureza-${
                    natureza?.id ??
                    "nova"
                  }`}
                  className="text-sm font-medium"
                >
                  Descrição
                </label>

                <Input
                  id={`descricao-natureza-${
                    natureza?.id ??
                    "nova"
                  }`}
                  className="h-11"
                  placeholder="Ex.: Venda de mercadoria"
                  value={
                    form.descricao
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "descricao",
                      event.target.value
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`cfop-natureza-${
                    natureza?.id ??
                    "nova"
                  }`}
                  className="text-sm font-medium"
                >
                  CFOP
                </label>

                <Input
                  id={`cfop-natureza-${
                    natureza?.id ??
                    "nova"
                  }`}
                  className="h-11"
                  placeholder="5102"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.cfop}
                  onChange={(event) =>
                    atualizarCampo(
                      "cfop",
                      event.target.value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(0, 4)
                    )
                  }
                  disabled={carregando}
                  required
                />

                <p className="text-xs text-muted-foreground">
                  Informe os quatro números
                  do código fiscal.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`finalidade-natureza-${
                    natureza?.id ??
                    "nova"
                  }`}
                  className="text-sm font-medium"
                >
                  Finalidade da NF-e
                </label>

                <select
                  id={`finalidade-natureza-${
                    natureza?.id ??
                    "nova"
                  }`}
                  value={
                    form.finalidadeNfe
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "finalidadeNfe",
                      event.target
                        .value as FinalidadeNfe
                    )
                  }
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
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
                        {
                          finalidade.label
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* Regras */}

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings2 size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Regras da operação
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Defina as condições
                  aplicadas por padrão.
                </p>
              </div>
            </div>

            <div className="divide-y rounded-xl border bg-background">
              <OpcaoCheckbox
                titulo="Consumidor final"
                descricao="Indica que a operação é destinada a consumidor final."
                checked={
                  form.consumidorFinal
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "consumidorFinal",
                    valor
                  )
                }
                disabled={carregando}
              />

              <OpcaoCheckbox
                titulo="Destinatário contribuinte de ICMS"
                descricao="Exige inscrição estadual para o destinatário da operação."
                checked={
                  form.contribuinteIcms
                }
                onChange={(valor) =>
                  atualizarCampo(
                    "contribuinteIcms",
                    valor
                  )
                }
                disabled={carregando}
              />

              <OpcaoCheckbox
                titulo="Natureza ativa"
                descricao="Permite utilizar esta natureza em novas notas fiscais."
                checked={form.ativo}
                onChange={(valor) =>
                  atualizarCampo(
                    "ativo",
                    valor
                  )
                }
                disabled={carregando}
              />
            </div>
          </section>

          {/* Erro */}

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {erro}
            </div>
          )}

          <DialogFooter className="border-t pt-5 sm:items-center sm:justify-between">
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground">
                {editando
                  ? "Revise as informações antes de salvar."
                  : "Preencha os dados para cadastrar a natureza."}
              </p>
            </div>

            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-xl px-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() =>
                  setAberto(false)
                }
                disabled={carregando}
              >
                <X size={17} />

                Cancelar
              </Button>

              <Button
                type="submit"
                className="h-11 rounded-xl px-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:min-w-48"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    {editando
                      ? "Salvar alterações"
                      : "Cadastrar natureza"}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type OpcaoCheckboxProps = {
  titulo: string;
  descricao: string;
  checked: boolean;

  onChange: (
    valor: boolean
  ) => void;

  disabled?: boolean;
};

function OpcaoCheckbox({
  titulo,
  descricao,
  checked,
  onChange,
  disabled = false,
}: OpcaoCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-muted/30">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />

      <span className="min-w-0">
        <span className="block text-sm font-medium">
          {titulo}
        </span>

        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {descricao}
        </span>
      </span>
    </label>
  );
}
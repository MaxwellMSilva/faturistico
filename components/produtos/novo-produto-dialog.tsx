"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { createProduto } from "@/actions/produtos/create-produto";

import {
  ProdutoIbsCbsFields,
} from "@/components/produtos/produto-ibs-cbs-fields";

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

type Props = {
  empresaId: string;
};

type TipoProduto =
  | "PRODUTO"
  | "SERVICO";

const estadoInicial = {
  codigo: "",
  descricao: "",

  tipo:
    "PRODUTO" as TipoProduto,

  unidade: "UN",

  ean: "",
  ncm: "",
  cest: "",
  cfopPadrao: "",

  valorUnitario: "",

  origemMercadoria: "0",

  cstIcms: "",
  csosnIcms: "",

  modalidadeBcIcms: "3",
  reducaoBcIcms: "0",
  aliquotaIcms: "0",

  cstPis: "",
  aliquotaPis: "0",

  cstCofins: "",
  aliquotaCofins: "0",

  cstIpi: "",

  codigoEnquadramentoIpi:
    "999",

  aliquotaIpi: "0",

  // IBS e CBS

  cstIbsCbs: "",

  classificacaoTributariaIbsCbs:
    "",

  aliquotaIbsUf: "0",
  aliquotaIbsMun: "0",
  aliquotaCbs: "0",
};

function numeroDecimal(
  valor: string
) {
  const texto =
    valor.trim();

  if (!texto) {
    return 0;
  }

  return Number(
    texto
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

export function NovoProdutoDialog({
  empresaId,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  const [form, setForm] =
    useState({
      ...estadoInicial,
    });

  function atualizarCampo(
    campo: keyof typeof estadoInicial,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function limparFormulario() {
    setForm({
      ...estadoInicial,
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const valorUnitario =
      numeroDecimal(
        form.valorUnitario
      );

    if (
      !Number.isFinite(
        valorUnitario
      ) ||
      valorUnitario < 0
    ) {
      alert(
        "Informe um valor unitário válido."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await createProduto({
          empresaId,

          codigo:
            form.codigo,

          descricao:
            form.descricao,

          tipo:
            form.tipo,

          unidade:
            form.unidade,

          ean:
            form.ean,

          ncm:
            form.ncm,

          cest:
            form.cest,

          cfopPadrao:
            form.cfopPadrao,

          valorUnitario,

          origemMercadoria:
            Number(
              form.origemMercadoria
            ),

          // ICMS

          cstIcms:
            form.cstIcms,

          csosnIcms:
            form.csosnIcms,

          modalidadeBcIcms:
            Number(
              form.modalidadeBcIcms
            ),

          reducaoBcIcms:
            numeroDecimal(
              form.reducaoBcIcms
            ),

          aliquotaIcms:
            numeroDecimal(
              form.aliquotaIcms
            ),

          // PIS

          cstPis:
            form.cstPis,

          aliquotaPis:
            numeroDecimal(
              form.aliquotaPis
            ),

          // COFINS

          cstCofins:
            form.cstCofins,

          aliquotaCofins:
            numeroDecimal(
              form.aliquotaCofins
            ),

          // IPI

          cstIpi:
            form.cstIpi,

          codigoEnquadramentoIpi:
            form
              .codigoEnquadramentoIpi,

          aliquotaIpi:
            numeroDecimal(
              form.aliquotaIpi
            ),

          // IBS e CBS

          cstIbsCbs:
            form.cstIbsCbs,

          classificacaoTributariaIbsCbs:
            form
              .classificacaoTributariaIbsCbs,

          aliquotaIbsUf:
            numeroDecimal(
              form.aliquotaIbsUf
            ),

          aliquotaIbsMun:
            numeroDecimal(
              form.aliquotaIbsMun
            ),

          aliquotaCbs:
            numeroDecimal(
              form.aliquotaCbs
            ),
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        "Produto cadastrado com sucesso."
      );

      limparFormulario();
      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível cadastrar o produto."
      );
    } finally {
      setCarregando(false);
    }
  }

  const produtoFiscal =
    form.tipo === "PRODUTO";

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        setAberto(valor);

        if (!valor) {
          limparFormulario();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">
          <Plus size={17} />

          Novo Produto
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Novo Produto
          </DialogTitle>

          <DialogDescription>
            Cadastre os dados comerciais
            e fiscais do produto.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Dados básicos */}

          <section className="space-y-4">
            <h3 className="font-semibold">
              Dados básicos
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Código"
                value={form.codigo}
                onChange={(event) =>
                  atualizarCampo(
                    "codigo",
                    event.target.value
                  )
                }
                disabled={carregando}
                required
              />

              <select
                value={form.tipo}
                onChange={(event) =>
                  atualizarCampo(
                    "tipo",
                    event.target.value
                  )
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
                disabled={carregando}
              >
                <option value="PRODUTO">
                  Produto
                </option>

                <option value="SERVICO">
                  Serviço
                </option>
              </select>

              <Input
                placeholder="Descrição"
                value={form.descricao}
                onChange={(event) =>
                  atualizarCampo(
                    "descricao",
                    event.target.value
                  )
                }
                className="md:col-span-2"
                disabled={carregando}
                required
              />

              <Input
                placeholder="Unidade"
                value={form.unidade}
                onChange={(event) =>
                  atualizarCampo(
                    "unidade",
                    event.target.value
                      .toUpperCase()
                  )
                }
                disabled={carregando}
                required
              />

              <Input
                placeholder="Valor unitário"
                inputMode="decimal"
                value={
                  form.valorUnitario
                }
                onChange={(event) =>
                  atualizarCampo(
                    "valorUnitario",
                    event.target.value
                  )
                }
                disabled={carregando}
                required
              />
            </div>
          </section>

          {produtoFiscal && (
            <>
              {/* demais seções fiscais */}

              <ProdutoIbsCbsFields
                form={{
                  cstIbsCbs:
                    form.cstIbsCbs,

                  classificacaoTributariaIbsCbs:
                    form
                      .classificacaoTributariaIbsCbs,

                  aliquotaIbsUf:
                    form.aliquotaIbsUf,

                  aliquotaIbsMun:
                    form.aliquotaIbsMun,

                  aliquotaCbs:
                    form.aliquotaCbs,
                }}
                atualizarCampo={(
                  campo,
                  valor
                ) =>
                  atualizarCampo(
                    campo,
                    valor
                  )
                }
                disabled={carregando}
              />
            </>
          )}

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
                ? "Cadastrando..."
                : "Cadastrar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
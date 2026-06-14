"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Pencil } from "lucide-react";

import { updateProduto } from "@/actions/produtos/update-produto";

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

type TipoProduto =
  | "PRODUTO"
  | "SERVICO";

type Produto = {
  id: string;

  codigo: string;
  descricao: string;

  tipo: TipoProduto;

  unidade: string;

  ean: string | null;
  ncm: string | null;
  cest: string | null;
  cfopPadrao: string | null;

  valorUnitario: number;

  origemMercadoria:
    | number
    | null;

  cstIcms: string | null;
  csosnIcms: string | null;

  modalidadeBcIcms:
    | number
    | null;

  reducaoBcIcms: number;
  aliquotaIcms: number;

  cstPis: string | null;
  aliquotaPis: number;

  cstCofins: string | null;
  aliquotaCofins: number;

  cstIpi: string | null;

  codigoEnquadramentoIpi:
    | string
    | null;

  aliquotaIpi: number;

  cstIbsCbs: string | null;

  classificacaoTributariaIbsCbs:
    | string
    | null;

  aliquotaIbsUf: number;
  aliquotaIbsMun: number;
  aliquotaCbs: number;
};

type Props = {
  empresaId: string;
  produto: Produto;
};

function numeroDecimal(
  valor: string
) {
  const texto = valor.trim();

  if (!texto) {
    return 0;
  }

  /*
   * Aceita:
   * 12,50
   * 12.50
   * 1.250,50
   */
  if (texto.includes(",")) {
    return Number(
      texto
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  return Number(texto);
}

function valorParaCampo(
  valor:
    | number
    | null
    | undefined
) {
  return String(valor ?? 0);
}

export function ProdutoEditButton({
  empresaId,
  produto,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [carregando, setCarregando] =
    useState(false);

  function criarEstadoInicial() {
    return {
      codigo:
        produto.codigo,

      descricao:
        produto.descricao,

      tipo:
        produto.tipo,

      unidade:
        produto.unidade,

      ean:
        produto.ean ?? "",

      ncm:
        produto.ncm ?? "",

      cest:
        produto.cest ?? "",

      cfopPadrao:
        produto.cfopPadrao ?? "",

      valorUnitario:
        valorParaCampo(
          produto.valorUnitario
        ),

      origemMercadoria:
        String(
          produto.origemMercadoria ??
          0
        ),

      cstIcms:
        produto.cstIcms ?? "",

      csosnIcms:
        produto.csosnIcms ?? "",

      modalidadeBcIcms:
        String(
          produto.modalidadeBcIcms ??
          3
        ),

      reducaoBcIcms:
        valorParaCampo(
          produto.reducaoBcIcms
        ),

      aliquotaIcms:
        valorParaCampo(
          produto.aliquotaIcms
        ),

      cstPis:
        produto.cstPis ?? "",

      aliquotaPis:
        valorParaCampo(
          produto.aliquotaPis
        ),

      cstCofins:
        produto.cstCofins ?? "",

      aliquotaCofins:
        valorParaCampo(
          produto.aliquotaCofins
        ),

      cstIpi:
        produto.cstIpi ?? "",

      codigoEnquadramentoIpi:
        produto
          .codigoEnquadramentoIpi ??
        "999",

      aliquotaIpi:
        valorParaCampo(
          produto.aliquotaIpi
        ),

      cstIbsCbs:
        produto.cstIbsCbs ?? "",

      classificacaoTributariaIbsCbs:
        produto
          .classificacaoTributariaIbsCbs ??
        "",

      aliquotaIbsUf:
        valorParaCampo(
          produto.aliquotaIbsUf
        ),

      aliquotaIbsMun:
        valorParaCampo(
          produto.aliquotaIbsMun
        ),

      aliquotaCbs:
        valorParaCampo(
          produto.aliquotaCbs
        ),
    };
  }

  type FormState =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [form, setForm] =
    useState<FormState>(
      criarEstadoInicial
    );

  function atualizarCampo<
    Campo extends keyof FormState,
  >(
    campo: Campo,
    valor: FormState[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
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
        await updateProduto({
          id:
            produto.id,

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
        "Produto atualizado com sucesso."
      );

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível atualizar o produto."
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
          variant="outline"
          size="sm"
        >
          <Pencil size={16} />

          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Editar Produto
          </DialogTitle>

          <DialogDescription>
            Atualize os dados comerciais
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
                    event.target
                      .value as TipoProduto
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
              {/* Classificação fiscal */}

              <section className="space-y-4">
                <h3 className="font-semibold">
                  Classificação fiscal
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="EAN / GTIN"
                    inputMode="numeric"
                    value={form.ean}
                    onChange={(event) =>
                      atualizarCampo(
                        "ean",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="NCM"
                    inputMode="numeric"
                    maxLength={8}
                    value={form.ncm}
                    onChange={(event) =>
                      atualizarCampo(
                        "ncm",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 8)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="CEST"
                    inputMode="numeric"
                    maxLength={7}
                    value={form.cest}
                    onChange={(event) =>
                      atualizarCampo(
                        "cest",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 7)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="CFOP padrão"
                    inputMode="numeric"
                    maxLength={4}
                    value={
                      form.cfopPadrao
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "cfopPadrao",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 4)
                      )
                    }
                    disabled={carregando}
                  />

                  <select
                    value={
                      form.origemMercadoria
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "origemMercadoria",
                        event.target.value
                      )
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm md:col-span-2"
                    disabled={carregando}
                  >
                    <option value="0">
                      0 - Nacional
                    </option>

                    <option value="1">
                      1 - Estrangeira, importação direta
                    </option>

                    <option value="2">
                      2 - Estrangeira, adquirida no mercado interno
                    </option>

                    <option value="3">
                      3 - Nacional, conteúdo de importação superior a 40%
                    </option>

                    <option value="4">
                      4 - Nacional, processos produtivos básicos
                    </option>

                    <option value="5">
                      5 - Nacional, conteúdo de importação até 40%
                    </option>

                    <option value="6">
                      6 - Estrangeira, importação direta sem similar nacional
                    </option>

                    <option value="7">
                      7 - Estrangeira, mercado interno sem similar nacional
                    </option>

                    <option value="8">
                      8 - Nacional, conteúdo de importação superior a 70%
                    </option>
                  </select>
                </div>
              </section>

              {/* ICMS */}

              <section className="space-y-4">
                <h3 className="font-semibold">
                  ICMS
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="CST ICMS"
                    inputMode="numeric"
                    maxLength={2}
                    value={
                      form.cstIcms
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "cstIcms",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 2)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="CSOSN"
                    inputMode="numeric"
                    maxLength={3}
                    value={
                      form.csosnIcms
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "csosnIcms",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 3)
                      )
                    }
                    disabled={carregando}
                  />

                  <select
                    value={
                      form.modalidadeBcIcms
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "modalidadeBcIcms",
                        event.target.value
                      )
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    disabled={carregando}
                  >
                    <option value="0">
                      0 - Margem Valor Agregado
                    </option>

                    <option value="1">
                      1 - Pauta
                    </option>

                    <option value="2">
                      2 - Preço tabelado
                    </option>

                    <option value="3">
                      3 - Valor da operação
                    </option>
                  </select>

                  <Input
                    placeholder="Redução da base ICMS (%)"
                    inputMode="decimal"
                    value={
                      form.reducaoBcIcms
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "reducaoBcIcms",
                        event.target.value
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="Alíquota ICMS (%)"
                    inputMode="decimal"
                    value={
                      form.aliquotaIcms
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "aliquotaIcms",
                        event.target.value
                      )
                    }
                    disabled={carregando}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Para Simples Nacional,
                  preencha o CSOSN. Para
                  Regime Normal, preencha o
                  CST ICMS.
                </p>
              </section>

              {/* PIS e COFINS */}

              <section className="space-y-4">
                <h3 className="font-semibold">
                  PIS e COFINS
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="CST PIS"
                    inputMode="numeric"
                    maxLength={2}
                    value={form.cstPis}
                    onChange={(event) =>
                      atualizarCampo(
                        "cstPis",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 2)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="Alíquota PIS (%)"
                    inputMode="decimal"
                    value={
                      form.aliquotaPis
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "aliquotaPis",
                        event.target.value
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="CST COFINS"
                    inputMode="numeric"
                    maxLength={2}
                    value={
                      form.cstCofins
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "cstCofins",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 2)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="Alíquota COFINS (%)"
                    inputMode="decimal"
                    value={
                      form.aliquotaCofins
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "aliquotaCofins",
                        event.target.value
                      )
                    }
                    disabled={carregando}
                  />
                </div>
              </section>

              {/* IPI */}

              <section className="space-y-4">
                <h3 className="font-semibold">
                  IPI
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    placeholder="CST IPI"
                    inputMode="numeric"
                    maxLength={2}
                    value={form.cstIpi}
                    onChange={(event) =>
                      atualizarCampo(
                        "cstIpi",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 2)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="Enquadramento IPI"
                    inputMode="numeric"
                    maxLength={3}
                    value={
                      form
                        .codigoEnquadramentoIpi
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "codigoEnquadramentoIpi",
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(0, 3)
                      )
                    }
                    disabled={carregando}
                  />

                  <Input
                    placeholder="Alíquota IPI (%)"
                    inputMode="decimal"
                    value={
                      form.aliquotaIpi
                    }
                    onChange={(event) =>
                      atualizarCampo(
                        "aliquotaIpi",
                        event.target.value
                      )
                    }
                    disabled={carregando}
                  />
                </div>
              </section>

              {/* IBS e CBS */}

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
                ? "Salvando..."
                : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
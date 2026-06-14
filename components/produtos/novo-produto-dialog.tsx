"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BadgeDollarSign,
  Boxes,
  FileCheck2,
  Landmark,
  LoaderCircle,
  PackagePlus,
  Percent,
  Plus,
  Save,
} from "lucide-react";

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

  cstIbsCbs: "",

  classificacaoTributariaIbsCbs:
    "",

  aliquotaIbsUf: "0",
  aliquotaIbsMun: "0",
  aliquotaCbs: "0",
};

type FormProduto =
  typeof estadoInicial;

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

function numeroDecimal(
  valor: string
) {
  const texto = valor.trim();

  if (!texto) {
    return 0;
  }

  if (texto.includes(",")) {
    return Number(
      texto
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  return Number(texto);
}

export function NovoProdutoDialog({
  empresaId,
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

  const [form, setForm] =
    useState<FormProduto>({
      ...estadoInicial,
    });

  function atualizarCampo(
    campo: keyof FormProduto,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    if (erro) {
      setErro("");
    }
  }

  function alterarTipo(
    tipo: TipoProduto
  ) {
    setForm((anterior) => ({
      ...anterior,
      tipo,
    }));

    setErro("");
  }

  function limparFormulario() {
    setForm({
      ...estadoInicial,
    });

    setErro("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const codigo =
      form.codigo.trim();

    const descricao =
      form.descricao.trim();

    const unidade =
      form.unidade
        .trim()
        .toUpperCase();

    const valorUnitario =
      numeroDecimal(
        form.valorUnitario
      );

    const ncm =
      somenteNumeros(form.ncm);

    const cest =
      somenteNumeros(form.cest);

    const cfop =
      somenteNumeros(
        form.cfopPadrao
      );

    if (!codigo) {
      setErro(
        "Informe o código do produto."
      );

      return;
    }

    if (!descricao) {
      setErro(
        "Informe a descrição do produto."
      );

      return;
    }

    if (!unidade) {
      setErro(
        "Informe a unidade do produto."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorUnitario
      ) ||
      valorUnitario < 0
    ) {
      setErro(
        "Informe um valor unitário válido."
      );

      return;
    }

    if (
      form.tipo === "PRODUTO" &&
      ncm.length !== 8
    ) {
      setErro(
        "O NCM deve possuir 8 números."
      );

      return;
    }

    if (
      cest &&
      cest.length !== 7
    ) {
      setErro(
        "O CEST deve possuir 7 números."
      );

      return;
    }

    if (
      cfop &&
      cfop.length !== 4
    ) {
      setErro(
        "O CFOP deve possuir 4 números."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await createProduto({
          empresaId,

          codigo,
          descricao,

          tipo:
            form.tipo,

          unidade,

          ean:
            somenteNumeros(
              form.ean
            ),

          ncm,
          cest,
          cfopPadrao: cfop,

          valorUnitario,

          origemMercadoria:
            Number(
              form.origemMercadoria
            ),

          cstIcms:
            somenteNumeros(
              form.cstIcms
            ),

          csosnIcms:
            somenteNumeros(
              form.csosnIcms
            ),

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

          cstPis:
            somenteNumeros(
              form.cstPis
            ),

          aliquotaPis:
            numeroDecimal(
              form.aliquotaPis
            ),

          cstCofins:
            somenteNumeros(
              form.cstCofins
            ),

          aliquotaCofins:
            numeroDecimal(
              form.aliquotaCofins
            ),

          cstIpi:
            somenteNumeros(
              form.cstIpi
            ),

          codigoEnquadramentoIpi:
            somenteNumeros(
              form
                .codigoEnquadramentoIpi
            ),

          aliquotaIpi:
            numeroDecimal(
              form.aliquotaIpi
            ),

          cstIbsCbs:
            somenteNumeros(
              form.cstIbsCbs
            ),

          classificacaoTributariaIbsCbs:
            somenteNumeros(
              form
                .classificacaoTributariaIbsCbs
            ),

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
        setErro(
          resultado.message
        );

        return;
      }

      limparFormulario();
      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao cadastrar produto:",
        error
      );

      setErro(
        "Não foi possível cadastrar o produto. Tente novamente."
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
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (!valor) {
          limparFormulario();
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            className="h-11"
          />
        }
      >
        <Plus size={17} />

        Novo produto
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Novo produto
          </DialogTitle>

          <DialogDescription>
            Cadastre os dados comerciais
            e tributários do produto ou
            serviço.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Dados básicos */}

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PackagePlus size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Dados básicos
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Identificação, unidade e
                  valor do cadastro.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="codigoProduto"
                  className="text-sm font-medium"
                >
                  Código
                </label>

                <Input
                  id="codigoProduto"
                  className="h-11"
                  placeholder="Ex.: PROD001"
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
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="tipoProduto"
                  className="text-sm font-medium"
                >
                  Tipo
                </label>

                <select
                  id="tipoProduto"
                  value={form.tipo}
                  onChange={(event) =>
                    alterarTipo(
                      event.target
                        .value as TipoProduto
                    )
                  }
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={carregando}
                >
                  <option value="PRODUTO">
                    Produto
                  </option>

                  <option value="SERVICO">
                    Serviço
                  </option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="descricaoProduto"
                  className="text-sm font-medium"
                >
                  Descrição
                </label>

                <Input
                  id="descricaoProduto"
                  className="h-11"
                  placeholder="Descrição do produto ou serviço"
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
                  htmlFor="unidadeProduto"
                  className="text-sm font-medium"
                >
                  Unidade
                </label>

                <Input
                  id="unidadeProduto"
                  className="h-11"
                  placeholder="UN"
                  value={form.unidade}
                  onChange={(event) =>
                    atualizarCampo(
                      "unidade",
                      event.target.value
                        .replace(
                          /[^a-zA-Z0-9]/g,
                          ""
                        )
                        .slice(0, 6)
                        .toUpperCase()
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="valorUnitarioProduto"
                  className="text-sm font-medium"
                >
                  Valor unitário
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>

                  <Input
                    id="valorUnitarioProduto"
                    className="h-11 pl-10"
                    placeholder="0,00"
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
              </div>
            </div>
          </section>

          {!produtoFiscal && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              Os campos fiscais de mercadoria
              não são exibidos para serviços.
              O módulo de NFS-e será tratado
              separadamente.
            </div>
          )}

          {produtoFiscal && (
            <>
              {/* Classificação fiscal */}

              <section className="rounded-xl border bg-muted/10 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileCheck2 size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Classificação fiscal
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Códigos fiscais,
                      classificação e origem
                      da mercadoria.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="eanProduto"
                      className="text-sm font-medium"
                    >
                      EAN / GTIN
                    </label>

                    <Input
                      id="eanProduto"
                      className="h-11"
                      placeholder="Código de barras"
                      inputMode="numeric"
                      value={form.ean}
                      onChange={(event) =>
                        atualizarCampo(
                          "ean",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 14)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="ncmProduto"
                      className="text-sm font-medium"
                    >
                      NCM
                    </label>

                    <Input
                      id="ncmProduto"
                      className="h-11"
                      placeholder="00000000"
                      inputMode="numeric"
                      maxLength={8}
                      value={form.ncm}
                      onChange={(event) =>
                        atualizarCampo(
                          "ncm",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 8)
                        )
                      }
                      disabled={carregando}
                      required
                    />

                    <p className="text-xs text-muted-foreground">
                      Informe os 8 números da
                      classificação fiscal.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="cestProduto"
                      className="text-sm font-medium"
                    >
                      CEST
                    </label>

                    <Input
                      id="cestProduto"
                      className="h-11"
                      placeholder="0000000"
                      inputMode="numeric"
                      maxLength={7}
                      value={form.cest}
                      onChange={(event) =>
                        atualizarCampo(
                          "cest",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 7)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="cfopProduto"
                      className="text-sm font-medium"
                    >
                      CFOP padrão
                    </label>

                    <Input
                      id="cfopProduto"
                      className="h-11"
                      placeholder="5102"
                      inputMode="numeric"
                      maxLength={4}
                      value={
                        form.cfopPadrao
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "cfopPadrao",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 4)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="origemMercadoria"
                      className="text-sm font-medium"
                    >
                      Origem da mercadoria
                    </label>

                    <select
                      id="origemMercadoria"
                      value={
                        form.origemMercadoria
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "origemMercadoria",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                      disabled={carregando}
                    >
                      <option value="0">
                        0 - Nacional
                      </option>

                      <option value="1">
                        1 - Estrangeira,
                        importação direta
                      </option>

                      <option value="2">
                        2 - Estrangeira,
                        adquirida no mercado
                        interno
                      </option>

                      <option value="3">
                        3 - Nacional, conteúdo
                        de importação superior
                        a 40%
                      </option>

                      <option value="4">
                        4 - Nacional, processos
                        produtivos básicos
                      </option>

                      <option value="5">
                        5 - Nacional, conteúdo
                        de importação até 40%
                      </option>

                      <option value="6">
                        6 - Estrangeira,
                        importação direta sem
                        similar nacional
                      </option>

                      <option value="7">
                        7 - Estrangeira,
                        mercado interno sem
                        similar nacional
                      </option>

                      <option value="8">
                        8 - Nacional, conteúdo
                        de importação superior
                        a 70%
                      </option>
                    </select>
                  </div>
                </div>
              </section>

              {/* ICMS */}

              <section className="rounded-xl border bg-muted/10 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Landmark size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      ICMS
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Use CST para Regime
                      Normal ou CSOSN para
                      Simples Nacional.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="cstIcms"
                      className="text-sm font-medium"
                    >
                      CST ICMS
                    </label>

                    <Input
                      id="cstIcms"
                      className="h-11"
                      placeholder="00"
                      inputMode="numeric"
                      maxLength={2}
                      value={form.cstIcms}
                      onChange={(event) =>
                        atualizarCampo(
                          "cstIcms",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 2)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="csosnIcms"
                      className="text-sm font-medium"
                    >
                      CSOSN
                    </label>

                    <Input
                      id="csosnIcms"
                      className="h-11"
                      placeholder="102"
                      inputMode="numeric"
                      maxLength={3}
                      value={
                        form.csosnIcms
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "csosnIcms",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 3)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="modalidadeBcIcms"
                      className="text-sm font-medium"
                    >
                      Modalidade da base
                    </label>

                    <select
                      id="modalidadeBcIcms"
                      value={
                        form
                          .modalidadeBcIcms
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "modalidadeBcIcms",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                      disabled={carregando}
                    >
                      <option value="0">
                        0 - Margem de valor
                        agregado
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
                  </div>

                  <CampoPercentual
                    id="reducaoBcIcms"
                    label="Redução da base"
                    value={
                      form.reducaoBcIcms
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "reducaoBcIcms",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <div className="md:col-span-2">
                    <CampoPercentual
                      id="aliquotaIcms"
                      label="Alíquota do ICMS"
                      value={
                        form.aliquotaIcms
                      }
                      onChange={(valor) =>
                        atualizarCampo(
                          "aliquotaIcms",
                          valor
                        )
                      }
                      disabled={carregando}
                    />
                  </div>
                </div>
              </section>

              {/* PIS e COFINS */}

              <section className="rounded-xl border bg-muted/10 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Percent size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      PIS e COFINS
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Códigos de situação
                      tributária e respectivas
                      alíquotas.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="cstPis"
                      className="text-sm font-medium"
                    >
                      CST PIS
                    </label>

                    <Input
                      id="cstPis"
                      className="h-11"
                      placeholder="07"
                      inputMode="numeric"
                      maxLength={2}
                      value={form.cstPis}
                      onChange={(event) =>
                        atualizarCampo(
                          "cstPis",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 2)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <CampoPercentual
                    id="aliquotaPis"
                    label="Alíquota do PIS"
                    value={
                      form.aliquotaPis
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "aliquotaPis",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor="cstCofins"
                      className="text-sm font-medium"
                    >
                      CST COFINS
                    </label>

                    <Input
                      id="cstCofins"
                      className="h-11"
                      placeholder="07"
                      inputMode="numeric"
                      maxLength={2}
                      value={
                        form.cstCofins
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "cstCofins",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 2)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <CampoPercentual
                    id="aliquotaCofins"
                    label="Alíquota da COFINS"
                    value={
                      form
                        .aliquotaCofins
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "aliquotaCofins",
                        valor
                      )
                    }
                    disabled={carregando}
                  />
                </div>
              </section>

              {/* IPI */}

              <section className="rounded-xl border bg-muted/10 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BadgeDollarSign
                      size={20}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      IPI
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Preencha somente quando
                      houver incidência de IPI.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="cstIpi"
                      className="text-sm font-medium"
                    >
                      CST IPI
                    </label>

                    <Input
                      id="cstIpi"
                      className="h-11"
                      placeholder="00"
                      inputMode="numeric"
                      maxLength={2}
                      value={form.cstIpi}
                      onChange={(event) =>
                        atualizarCampo(
                          "cstIpi",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 2)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="enquadramentoIpi"
                      className="text-sm font-medium"
                    >
                      Enquadramento
                    </label>

                    <Input
                      id="enquadramentoIpi"
                      className="h-11"
                      placeholder="999"
                      inputMode="numeric"
                      maxLength={3}
                      value={
                        form
                          .codigoEnquadramentoIpi
                      }
                      onChange={(event) =>
                        atualizarCampo(
                          "codigoEnquadramentoIpi",
                          somenteNumeros(
                            event.target
                              .value
                          ).slice(0, 3)
                        )
                      }
                      disabled={carregando}
                    />
                  </div>

                  <CampoPercentual
                    id="aliquotaIpi"
                    label="Alíquota do IPI"
                    value={
                      form.aliquotaIpi
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "aliquotaIpi",
                        valor
                      )
                    }
                    disabled={carregando}
                  />
                </div>
              </section>

              {/* IBS e CBS */}

              <section className="rounded-xl border bg-muted/10 p-5">
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
                      form
                        .aliquotaIbsMun,

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
              </section>
            </>
          )}

          {/* Mensagem de erro */}

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {erro}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-11 sm:min-w-44"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Cadastrando...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Cadastrar produto
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CampoPercentualProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
};

function CampoPercentual({
  id,
  label,
  value,
  onChange,
  disabled = false,
}: CampoPercentualProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          className="h-11 pr-10"
          placeholder="0,00"
          inputMode="decimal"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          disabled={disabled}
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}
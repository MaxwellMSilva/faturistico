"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  BadgeDollarSign,
  FileCheck2,
  Landmark,
  LoaderCircle,
  Package,
  Pencil,
  Percent,
  Save,
} from "lucide-react";

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

function valorParaCampo(
  valor:
    | number
    | null
    | undefined
) {
  return String(
    valor ?? 0
  ).replace(".", ",");
}

export function ProdutoEditButton({
  empresaId,
  produto,
}: Props) {
  const router = useRouter();

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

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

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
        await updateProduto({
          id:
            produto.id,

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

          cfopPadrao:
            cfop,

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

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar produto:",
        error
      );

      setErro(
        "Não foi possível atualizar o produto. Tente novamente."
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
            variant="outline"
            size="sm"
          />
        }
      >
        <Pencil size={16} />

        Editar
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Editar produto
          </DialogTitle>

          <DialogDescription>
            Atualize os dados comerciais e
            tributários do produto ou serviço.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Dados básicos */}

          <section className="rounded-xl border bg-muted/10 p-5">
            <CabecalhoSecao
              icone={Package}
              titulo="Dados básicos"
              descricao="Identificação, unidade e valor do cadastro."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <CampoTexto
                id={`codigo-${produto.id}`}
                label="Código"
                placeholder="Ex.: PROD001"
                value={form.codigo}
                onChange={(valor) =>
                  atualizarCampo(
                    "codigo",
                    valor
                  )
                }
                disabled={carregando}
                required
              />

              <div className="space-y-2">
                <label
                  htmlFor={`tipo-${produto.id}`}
                  className="text-sm font-medium"
                >
                  Tipo
                </label>

                <select
                  id={`tipo-${produto.id}`}
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

              <div className="md:col-span-2">
                <CampoTexto
                  id={`descricao-${produto.id}`}
                  label="Descrição"
                  placeholder="Descrição do produto ou serviço"
                  value={form.descricao}
                  onChange={(valor) =>
                    atualizarCampo(
                      "descricao",
                      valor
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <CampoTexto
                id={`unidade-${produto.id}`}
                label="Unidade"
                placeholder="UN"
                value={form.unidade}
                onChange={(valor) =>
                  atualizarCampo(
                    "unidade",
                    valor
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

              <div className="space-y-2">
                <label
                  htmlFor={`valor-${produto.id}`}
                  className="text-sm font-medium"
                >
                  Valor unitário
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>

                  <Input
                    id={`valor-${produto.id}`}
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
              {/* Classificação */}

              <section className="rounded-xl border bg-muted/10 p-5">
                <CabecalhoSecao
                  icone={FileCheck2}
                  titulo="Classificação fiscal"
                  descricao="Códigos fiscais, classificação e origem da mercadoria."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <CampoNumerico
                    id={`ean-${produto.id}`}
                    label="EAN / GTIN"
                    placeholder="Código de barras"
                    limite={14}
                    value={form.ean}
                    onChange={(valor) =>
                      atualizarCampo(
                        "ean",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoNumerico
                    id={`ncm-${produto.id}`}
                    label="NCM"
                    placeholder="00000000"
                    limite={8}
                    value={form.ncm}
                    onChange={(valor) =>
                      atualizarCampo(
                        "ncm",
                        valor
                      )
                    }
                    disabled={carregando}
                    required
                    ajuda="Informe os 8 números da classificação fiscal."
                  />

                  <CampoNumerico
                    id={`cest-${produto.id}`}
                    label="CEST"
                    placeholder="0000000"
                    limite={7}
                    value={form.cest}
                    onChange={(valor) =>
                      atualizarCampo(
                        "cest",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoNumerico
                    id={`cfop-${produto.id}`}
                    label="CFOP padrão"
                    placeholder="5102"
                    limite={4}
                    value={
                      form.cfopPadrao
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "cfopPadrao",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor={`origem-${produto.id}`}
                      className="text-sm font-medium"
                    >
                      Origem da mercadoria
                    </label>

                    <select
                      id={`origem-${produto.id}`}
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
                <CabecalhoSecao
                  icone={Landmark}
                  titulo="ICMS"
                  descricao="Use CST para Regime Normal ou CSOSN para Simples Nacional."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <CampoNumerico
                    id={`cst-icms-${produto.id}`}
                    label="CST ICMS"
                    placeholder="00"
                    limite={2}
                    value={form.cstIcms}
                    onChange={(valor) =>
                      atualizarCampo(
                        "cstIcms",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoNumerico
                    id={`csosn-${produto.id}`}
                    label="CSOSN"
                    placeholder="102"
                    limite={3}
                    value={
                      form.csosnIcms
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "csosnIcms",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <div className="space-y-2">
                    <label
                      htmlFor={`modalidade-${produto.id}`}
                      className="text-sm font-medium"
                    >
                      Modalidade da base
                    </label>

                    <select
                      id={`modalidade-${produto.id}`}
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
                    id={`reducao-${produto.id}`}
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
                      id={`aliquota-icms-${produto.id}`}
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
                <CabecalhoSecao
                  icone={Percent}
                  titulo="PIS e COFINS"
                  descricao="Códigos de situação tributária e respectivas alíquotas."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <CampoNumerico
                    id={`cst-pis-${produto.id}`}
                    label="CST PIS"
                    placeholder="07"
                    limite={2}
                    value={form.cstPis}
                    onChange={(valor) =>
                      atualizarCampo(
                        "cstPis",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoPercentual
                    id={`aliquota-pis-${produto.id}`}
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

                  <CampoNumerico
                    id={`cst-cofins-${produto.id}`}
                    label="CST COFINS"
                    placeholder="07"
                    limite={2}
                    value={
                      form.cstCofins
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "cstCofins",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoPercentual
                    id={`aliquota-cofins-${produto.id}`}
                    label="Alíquota da COFINS"
                    value={
                      form.aliquotaCofins
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
                <CabecalhoSecao
                  icone={BadgeDollarSign}
                  titulo="IPI"
                  descricao="Preencha somente quando houver incidência de IPI."
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <CampoNumerico
                    id={`cst-ipi-${produto.id}`}
                    label="CST IPI"
                    placeholder="00"
                    limite={2}
                    value={form.cstIpi}
                    onChange={(valor) =>
                      atualizarCampo(
                        "cstIpi",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoNumerico
                    id={`enquadramento-${produto.id}`}
                    label="Enquadramento"
                    placeholder="999"
                    limite={3}
                    value={
                      form
                        .codigoEnquadramentoIpi
                    }
                    onChange={(valor) =>
                      atualizarCampo(
                        "codigoEnquadramentoIpi",
                        valor
                      )
                    }
                    disabled={carregando}
                  />

                  <CampoPercentual
                    id={`aliquota-ipi-${produto.id}`}
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

                  Salvando...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type CabecalhoSecaoProps = {
  icone: typeof Package;
  titulo: string;
  descricao: string;
};

function CabecalhoSecao({
  icone: Icone,
  titulo,
  descricao,
}: CabecalhoSecaoProps) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icone size={20} />
      </div>

      <div>
        <h3 className="font-semibold">
          {titulo}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {descricao}
        </p>
      </div>
    </div>
  );
}

type CampoTextoProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  required?: boolean;
};

function CampoTexto({
  id,
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
}: CampoTextoProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <Input
        id={id}
        className="h-11"
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

type CampoNumericoProps = {
  id: string;
  label: string;
  placeholder: string;
  limite: number;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  required?: boolean;
  ajuda?: string;
};

function CampoNumerico({
  id,
  label,
  placeholder,
  limite,
  value,
  onChange,
  disabled = false,
  required = false,
  ajuda,
}: CampoNumericoProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <Input
        id={id}
        className="h-11"
        placeholder={placeholder}
        inputMode="numeric"
        maxLength={limite}
        value={value}
        onChange={(event) =>
          onChange(
            somenteNumeros(
              event.target.value
            ).slice(0, limite)
          )
        }
        disabled={disabled}
        required={required}
      />

      {ajuda && (
        <p className="text-xs text-muted-foreground">
          {ajuda}
        </p>
      )}
    </div>
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
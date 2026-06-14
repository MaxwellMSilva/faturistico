"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  LoaderCircle,
  Package,
  PackagePlus,
  Plus,
  ReceiptText,
  Trash2,
  UserRound,
} from "lucide-react";

import { addItemNfe } from "@/actions/nfe/add-item-nfe";
import { deleteItemNfe } from "@/actions/nfe/delete-item-nfe";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

import { NfeDadosAdicionaisForm } from "@/components/nfe/nfe-dados-adicionais-form";
import { NfeResumoTributos } from "@/components/nfe/nfe-resumo-tributos";
import { ValidarNfeButton } from "@/components/nfe/validar-nfe-button";
import { NfeItemEditDialog } from "@/components/nfe/nfe-item-edit-dialog";

type Produto = {
  id: string;
  codigo: string;
  descricao: string;

  tipo:
    | "PRODUTO"
    | "SERVICO";

  unidade: string;

  ncm: string | null;
  cfopPadrao: string | null;

  valorUnitario: number;
};

type Item = {
  id: string;
  produtoId: string;

  codigoProduto: string;
  descricao: string;
  unidade: string;

  ean: string | null;
  ncm: string | null;
  cest: string | null;
  cfop: string | null;

  quantidade: number;

  valorUnitario: number;
  valorBruto: number;
  valorDesconto: number;
  valorTotal: number;

  origemMercadoria: number;

  cstIcms: string | null;
  csosnIcms: string | null;

  baseCalculoIcms: number;
  aliquotaIcms: number;
  valorIcms: number;

  cstPis: string | null;
  baseCalculoPis: number;
  aliquotaPis: number;
  valorPis: number;

  cstCofins: string | null;
  baseCalculoCofins: number;
  aliquotaCofins: number;
  valorCofins: number;

  cstIpi: string | null;

  codigoEnquadramentoIpi:
    | string
    | null;

  baseCalculoIpi: number;
  aliquotaIpi: number;
  valorIpi: number;
};

type Nota = {
  id: string;

  numero: number;
  serie: number;

  status: string;

  dataEmissao: string;

  cliente: {
    id: string;
    nome: string;
    cpfCnpj: string;
  };

  naturezaOperacao: {
    id: string;
    descricao: string;
    cfop: string;
  } | null;

  informacoesComplementares:
    | string
    | null;

  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  valorOutros: number;

  valorBaseIcms: number;
  valorIcms: number;
  valorPis: number;
  valorCofins: number;
  valorIpi: number;

  valorBaseIbsCbs: number;
  valorIbsUf: number;
  valorIbsMun: number;
  valorIbs: number;
  valorCbs: number;

  valorTotal: number;

  itens: Item[];
};

type Props = {
  empresaId: string;
  nota: Nota;
  produtos: Produto[];
};

const statusLabel: Record<
  string,
  string
> = {
  RASCUNHO: "Rascunho",
  VALIDANDO: "Validando",
  AUTORIZADA: "Autorizada",
  REJEITADA: "Rejeitada",
  CANCELADA: "Cancelada",
};

const statusClasses: Record<
  string,
  string
> = {
  RASCUNHO:
    "bg-muted text-muted-foreground",

  VALIDANDO:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400",

  AUTORIZADA:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",

  REJEITADA:
    "bg-destructive/10 text-destructive",

  CANCELADA:
    "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
};

function somenteNumeros(
  valor?: string | null
) {
  return (
    valor?.replace(/\D/g, "") ??
    ""
  );
}

function formatarDocumento(
  documento: string
) {
  const numeros =
    somenteNumeros(documento);

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
  }

  if (numeros.length === 14) {
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  return documento;
}

function formatarMoeda(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(valor);
}

function formatarQuantidade(
  valor: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }
  ).format(valor);
}

function formatarData(
  valor: string
) {
  const data = new Date(valor);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return "Data inválida";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(data);
}

function converterNumero(
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

function formatarNumeroNota(
  numero: number
) {
  return String(numero).padStart(
    9,
    "0"
  );
}

export function NfeRascunhoForm({
  empresaId,
  nota,
  produtos,
}: Props) {
  const router = useRouter();

  const [produtoId, setProdutoId] =
    useState("");

  const [quantidade, setQuantidade] =
    useState("1");

  const [
    valorUnitario,
    setValorUnitario,
  ] = useState("");

  const [
    valorDesconto,
    setValorDesconto,
  ] = useState("0");

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    erroAdicionar,
    setErroAdicionar,
  ] = useState("");

  const podeEditar =
    nota.status === "RASCUNHO";

  const produtoSelecionado =
    produtos.find(
      (produto) =>
        produto.id === produtoId
    );

  function selecionarProduto(
    id: string
  ) {
    setProdutoId(id);
    setErroAdicionar("");

    const produto =
      produtos.find(
        (item) => item.id === id
      );

    setValorUnitario(
      produto
        ? String(
            produto.valorUnitario
          ).replace(".", ",")
        : ""
    );
  }

  async function handleAdicionar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErroAdicionar("");

    if (!produtoId) {
      setErroAdicionar(
        "Selecione um produto."
      );

      return;
    }

    const quantidadeNumero =
      converterNumero(quantidade);

    const valorUnitarioNumero =
      converterNumero(
        valorUnitario
      );

    const valorDescontoNumero =
      converterNumero(
        valorDesconto || "0"
      );

    if (
      !Number.isFinite(
        quantidadeNumero
      ) ||
      quantidadeNumero <= 0
    ) {
      setErroAdicionar(
        "Informe uma quantidade válida."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorUnitarioNumero
      ) ||
      valorUnitarioNumero < 0
    ) {
      setErroAdicionar(
        "Informe um valor unitário válido."
      );

      return;
    }

    if (
      !Number.isFinite(
        valorDescontoNumero
      ) ||
      valorDescontoNumero < 0
    ) {
      setErroAdicionar(
        "Informe um desconto válido."
      );

      return;
    }

    const valorBruto =
      quantidadeNumero *
      valorUnitarioNumero;

    if (
      valorDescontoNumero >
      valorBruto
    ) {
      setErroAdicionar(
        "O desconto não pode ser maior que o valor bruto do item."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await addItemNfe({
          empresaId,

          notaFiscalId:
            nota.id,

          produtoId,

          quantidade:
            quantidadeNumero,

          valorUnitario:
            valorUnitarioNumero,

          valorDesconto:
            valorDescontoNumero,
        });

      if (!resultado.success) {
        setErroAdicionar(
          resultado.message
        );

        return;
      }

      setProdutoId("");
      setQuantidade("1");
      setValorUnitario("");
      setValorDesconto("0");

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao adicionar item:",
        error
      );

      setErroAdicionar(
        "Não foi possível adicionar o item. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Voltar */}

      <Button
        nativeButton={false}
        render={
          <Link
            href={`/empresa/${empresaId}/nfe`}
          />
        }
        variant="outline"
        className="h-10"
      >
        <ArrowLeft size={17} />

        Voltar para NF-e
      </Button>

      {/* Cabeçalho */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-primary">
                  Nota fiscal eletrônica
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  NF-e nº{" "}
                  {formatarNumeroNota(
                    nota.numero
                  )}
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                  Série {nota.serie}
                </p>
              </div>
            </div>

            <StatusBadge
              status={nota.status}
            />
          </div>

          <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2 xl:grid-cols-4">
            <InformacaoCabecalho
              icone={UserRound}
              titulo="Cliente"
              valor={nota.cliente.nome}
              complemento={formatarDocumento(
                nota.cliente.cpfCnpj
              )}
            />

            <InformacaoCabecalho
              icone={ClipboardList}
              titulo="Natureza de operação"
              valor={
                nota.naturezaOperacao
                  ?.descricao ??
                "Não informada"
              }
              complemento={
                nota.naturezaOperacao
                  ? `CFOP ${nota.naturezaOperacao.cfop}`
                  : undefined
              }
            />

            <InformacaoCabecalho
              icone={CalendarDays}
              titulo="Data de emissão"
              valor={formatarData(
                nota.dataEmissao
              )}
            />

            <InformacaoCabecalho
              icone={Package}
              titulo="Itens"
              valor={
                nota.itens.length === 1
                  ? "1 item"
                  : `${nota.itens.length} itens`
              }
            />
          </div>
        </div>
      </section>

      {/* Adicionar item */}

      {podeEditar && (
        <form
          onSubmit={handleAdicionar}
          className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackagePlus size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Adicionar item
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Selecione um produto e
                informe a quantidade,
                o valor e o desconto.
              </p>
            </div>
          </div>

          {produtos.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/10 px-5 py-6 text-center">
              <Package
                size={26}
                className="mx-auto text-muted-foreground"
              />

              <p className="mt-3 text-sm font-medium">
                Nenhum produto disponível
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre um produto ativo
                antes de adicionar itens
                à NF-e.
              </p>

              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/empresa/${empresaId}/produtos`}
                  />
                }
                variant="outline"
                className="mt-4"
              >
                Ir para produtos
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-12">
                <div className="space-y-2 lg:col-span-6">
                  <label
                    htmlFor="produtoNfe"
                    className="text-sm font-medium"
                  >
                    Produto
                  </label>

                  <select
                    id="produtoNfe"
                    value={produtoId}
                    onChange={(event) =>
                      selecionarProduto(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                    disabled={carregando}
                    required
                  >
                    <option value="">
                      Selecione o produto
                    </option>

                    {produtos.map(
                      (produto) => (
                        <option
                          key={produto.id}
                          value={produto.id}
                        >
                          {produto.codigo} —{" "}
                          {produto.descricao}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <CampoDecimal
                  id="quantidadeItem"
                  label="Quantidade"
                  value={quantidade}
                  onChange={(valor) => {
                    setQuantidade(valor);
                    setErroAdicionar("");
                  }}
                  disabled={carregando}
                  className="lg:col-span-2"
                  required
                />

                <CampoMoeda
                  id="valorUnitarioItem"
                  label="Valor unitário"
                  value={valorUnitario}
                  onChange={(valor) => {
                    setValorUnitario(
                      valor
                    );

                    setErroAdicionar("");
                  }}
                  disabled={carregando}
                  className="lg:col-span-2"
                  required
                />

                <CampoMoeda
                  id="descontoItem"
                  label="Desconto"
                  value={valorDesconto}
                  onChange={(valor) => {
                    setValorDesconto(valor);
                    setErroAdicionar("");
                  }}
                  disabled={carregando}
                  className="lg:col-span-2"
                />
              </div>

              {produtoSelecionado && (
                <div className="mt-5 grid gap-3 rounded-xl border bg-muted/10 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Produto selecionado
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        produtoSelecionado.descricao
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Unidade
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {
                        produtoSelecionado.unidade
                      }
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Valor cadastrado
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatarMoeda(
                        produtoSelecionado.valorUnitario
                      )}
                    </p>
                  </div>
                </div>
              )}

              {erroAdicionar && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>{erroAdicionar}</p>
                </div>
              )}

              <div className="mt-5 flex justify-end border-t pt-5">
                <Button
                  type="submit"
                  className="h-11 min-w-44"
                  disabled={carregando}
                >
                  {carregando ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />

                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Adicionar item
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Itens */}

      <section className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ReceiptText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Itens da NF-e
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Produtos, quantidades,
              valores e códigos fiscais
              utilizados nesta nota.
            </p>
          </div>
        </div>

        {nota.itens.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border bg-card px-6 py-10 text-center shadow-sm">
            <Package
              size={30}
              className="text-muted-foreground"
            />

            <h3 className="mt-4 font-semibold">
              Nenhum item adicionado
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Adicione ao menos um produto
              antes de validar esta NF-e.
            </p>
          </div>
        ) : (
          <>
            {/* Celular */}

            <div className="grid gap-4 md:hidden">
              {nota.itens.map(
                (item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {item.descricao}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Código{" "}
                          {item.codigoProduto}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-3 border-t pt-4 text-sm">
                      <LinhaInformacao
                        titulo="NCM"
                        valor={
                          item.ncm ||
                          "Não informado"
                        }
                      />

                      <LinhaInformacao
                        titulo="CFOP"
                        valor={
                          item.cfop ||
                          "Não informado"
                        }
                      />

                      <LinhaInformacao
                        titulo="Quantidade"
                        valor={`${formatarQuantidade(
                          item.quantidade
                        )} ${item.unidade}`}
                      />

                      <LinhaInformacao
                        titulo="Valor unitário"
                        valor={formatarMoeda(
                          item.valorUnitario
                        )}
                      />

                      <LinhaInformacao
                        titulo="Desconto"
                        valor={formatarMoeda(
                          item.valorDesconto
                        )}
                      />

                      <LinhaInformacao
                        titulo="Total"
                        valor={formatarMoeda(
                          item.valorTotal
                        )}
                        destaque
                      />
                    </dl>

                    {podeEditar && (
                      <div className="mt-5 flex justify-end gap-2 border-t pt-4">
                        <NfeItemEditDialog
                          empresaId={empresaId}
                          notaFiscalId={
                            nota.id
                          }
                          item={{
                            id: item.id,

                            codigoProduto:
                              item.codigoProduto,

                            descricao:
                              item.descricao,

                            unidade:
                              item.unidade,

                            quantidade:
                              item.quantidade,

                            valorUnitario:
                              item.valorUnitario,

                            valorDesconto:
                              item.valorDesconto,

                            valorTotal:
                              item.valorTotal,
                          }}
                        />

                        <RemoverItemButton
                          empresaId={
                            empresaId
                          }
                          notaFiscalId={
                            nota.id
                          }
                          itemId={item.id}
                          descricao={
                            item.descricao
                          }
                        />
                      </div>
                    )}
                  </article>
                )
              )}
            </div>

            {/* Computador */}

            <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-medium">
                        Produto
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium">
                        NCM
                      </th>

                      <th className="px-5 py-4 text-left text-sm font-medium">
                        CFOP
                      </th>

                      <th className="px-5 py-4 text-right text-sm font-medium">
                        Quantidade
                      </th>

                      <th className="px-5 py-4 text-right text-sm font-medium">
                        Valor unitário
                      </th>

                      <th className="px-5 py-4 text-right text-sm font-medium">
                        Desconto
                      </th>

                      <th className="px-5 py-4 text-right text-sm font-medium">
                        Total
                      </th>

                      <th className="px-5 py-4 text-right text-sm font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {nota.itens.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-t transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Package
                                  size={19}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-72 truncate font-medium">
                                  {
                                    item.descricao
                                  }
                                </p>

                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  Código{" "}
                                  {
                                    item.codigoProduto
                                  }{" "}
                                  •{" "}
                                  {
                                    item.unidade
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {item.ncm || "-"}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {item.cfop || "-"}
                          </td>

                          <td className="px-5 py-4 text-right text-sm">
                            {formatarQuantidade(
                              item.quantidade
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm">
                            {formatarMoeda(
                              item.valorUnitario
                            )}
                          </td>

                          <td className="px-5 py-4 text-right text-sm">
                            {formatarMoeda(
                              item.valorDesconto
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-medium">
                            {formatarMoeda(
                              item.valorTotal
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {podeEditar && (
                              <div className="flex justify-end gap-2">
                                <NfeItemEditDialog
                                  empresaId={
                                    empresaId
                                  }
                                  notaFiscalId={
                                    nota.id
                                  }
                                  item={{
                                    id:
                                      item.id,

                                    codigoProduto:
                                      item.codigoProduto,

                                    descricao:
                                      item.descricao,

                                    unidade:
                                      item.unidade,

                                    quantidade:
                                      item.quantidade,

                                    valorUnitario:
                                      item.valorUnitario,

                                    valorDesconto:
                                      item.valorDesconto,

                                    valorTotal:
                                      item.valorTotal,
                                  }}
                                />

                                <RemoverItemButton
                                  empresaId={
                                    empresaId
                                  }
                                  notaFiscalId={
                                    nota.id
                                  }
                                  itemId={
                                    item.id
                                  }
                                  descricao={
                                    item.descricao
                                  }
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Dados adicionais */}

      <NfeDadosAdicionaisForm
        empresaId={empresaId}
        notaFiscalId={nota.id}
        valorFrete={nota.valorFrete}
        valorOutros={nota.valorOutros}
        informacoesComplementares={
          nota.informacoesComplementares
        }
        podeEditar={podeEditar}
      />

      {/* Tributos */}

      <NfeResumoTributos
        valorBaseIcms={
          nota.valorBaseIcms
        }
        valorIcms={nota.valorIcms}
        valorPis={nota.valorPis}
        valorCofins={
          nota.valorCofins
        }
        valorIpi={nota.valorIpi}
        valorBaseIbsCbs={
          nota.valorBaseIbsCbs
        }
        valorIbsUf={
          nota.valorIbsUf
        }
        valorIbsMun={
          nota.valorIbsMun
        }
        valorIbs={nota.valorIbs}
        valorCbs={nota.valorCbs}
      />

      {/* Totais */}

      <section className="ml-auto w-full max-w-lg rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ReceiptText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Totais da NF-e
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Resumo financeiro do
              documento.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <LinhaTotal
            titulo="Produtos"
            valor={nota.valorProdutos}
          />

          <LinhaTotal
            titulo="Descontos"
            valor={
              nota.valorDesconto
            }
            negativo
          />

          <LinhaTotal
            titulo="Frete"
            valor={nota.valorFrete}
          />

          <LinhaTotal
            titulo="Outras despesas"
            valor={nota.valorOutros}
          />

          <LinhaTotal
            titulo="IPI"
            valor={nota.valorIpi}
          />

          <div className="flex items-center justify-between border-t pt-4 text-lg font-bold">
            <span>Total da NF-e</span>

            <span className="text-primary">
              {formatarMoeda(
                nota.valorTotal
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Validação */}

      {podeEditar && (
        <section className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold">
              Validação da NF-e
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Verifique os dados fiscais
              antes de preparar o documento
              para transmissão.
            </p>
          </div>

          <ValidarNfeButton
            empresaId={empresaId}
            notaFiscalId={nota.id}
            disabled={
              nota.itens.length === 0
            }
          />
        </section>
      )}
    </div>
  );
}

type InformacaoCabecalhoProps = {
  icone: typeof FileText;
  titulo: string;
  valor: string;
  complemento?: string;
};

function InformacaoCabecalho({
  icone: Icone,
  titulo,
  valor,
  complemento,
}: InformacaoCabecalhoProps) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icone size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {titulo}
        </p>

        <p className="mt-1 truncate text-sm font-medium">
          {valor}
        </p>

        {complemento && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {complemento}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={[
        "inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
        statusClasses[status] ??
          "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {statusLabel[status] ??
        status}
    </span>
  );
}

type CampoDecimalProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  required?: boolean;
  className?: string;
};

function CampoDecimal({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: CampoDecimalProps) {
  return (
    <div
      className={`space-y-2 ${
        className ?? ""
      }`}
    >
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <Input
        id={id}
        className="h-11"
        placeholder="0"
        inputMode="decimal"
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

type CampoMoedaProps = {
  id: string;
  label: string;
  value: string;

  onChange: (
    valor: string
  ) => void;

  disabled?: boolean;
  required?: boolean;
  className?: string;
};

function CampoMoeda({
  id,
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: CampoMoedaProps) {
  return (
    <div
      className={`space-y-2 ${
        className ?? ""
      }`}
    >
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          R$
        </span>

        <Input
          id={id}
          className="h-11 pl-10"
          placeholder="0,00"
          inputMode="decimal"
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
    </div>
  );
}

type LinhaInformacaoProps = {
  titulo: string;
  valor: string;
  destaque?: boolean;
};

function LinhaInformacao({
  titulo,
  valor,
  destaque = false,
}: LinhaInformacaoProps) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">
        {titulo}
      </dt>

      <dd
        className={[
          "text-right",
          destaque
            ? "font-semibold"
            : "font-medium",
        ].join(" ")}
      >
        {valor}
      </dd>
    </div>
  );
}

type LinhaTotalProps = {
  titulo: string;
  valor: number;
  negativo?: boolean;
};

function LinhaTotal({
  titulo,
  valor,
  negativo = false,
}: LinhaTotalProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {titulo}
      </span>

      <span className="font-medium">
        {negativo && valor > 0
          ? "- "
          : ""}
        {formatarMoeda(valor)}
      </span>
    </div>
  );
}

type RemoverItemButtonProps = {
  empresaId: string;
  notaFiscalId: string;

  itemId: string;
  descricao: string;
};

function RemoverItemButton({
  empresaId,
  notaFiscalId,
  itemId,
  descricao,
}: RemoverItemButtonProps) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  async function removerItem() {
    setErro("");

    try {
      setCarregando(true);

      const resultado =
        await deleteItemNfe({
          empresaId,
          notaFiscalId,
          itemId,
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
        "Erro ao remover item:",
        error
      );

      setErro(
        "Não foi possível remover o item. Tente novamente."
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
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <Trash2 size={16} />

        Remover
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle size={23} />
          </div>

          <AlertDialogTitle>
            Remover item da NF-e
          </AlertDialogTitle>

          <AlertDialogDescription>
            Você está prestes a remover o
            item{" "}
            <strong className="font-semibold text-foreground">
              {descricao}
            </strong>{" "}
            desta nota fiscal.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">
            Os totais serão recalculados.
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            O item será removido e os
            valores de produtos, descontos
            e tributos da NF-e serão
            atualizados.
          </p>
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

              void removerItem();
            }}
            disabled={carregando}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {carregando ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Removendo...
              </>
            ) : (
              <>
                <Trash2 size={16} />

                Confirmar remoção
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
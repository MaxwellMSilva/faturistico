"use client";

import Link from "next/link";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Save,
  Settings,
  UserRound,
} from "lucide-react";

import { createRascunhoNfe } from "@/actions/nfe/create-rascunho-nfe";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Cliente = {
  id: string;
  nome: string;
  cpfCnpj: string;
};

type Natureza = {
  id: string;
  descricao: string;
  cfop: string;
};

type Props = {
  empresaId: string;
  clientes: Cliente[];
  naturezas: Natureza[];
  serieNfe: number;
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

export function NovaNfeDialog({
  empresaId,
  clientes,
  naturezas,
  serieNfe,
}: Props) {
  const router = useRouter();

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    clienteId,
    setClienteId,
  ] = useState("");

  const [
    naturezaOperacaoId,
    setNaturezaOperacaoId,
  ] = useState("");

  const [
    informacoesComplementares,
    setInformacoesComplementares,
  ] = useState("");

  const [erro, setErro] =
    useState("");

  function limparMensagens() {
    setErro("");
  }

  function limparFormulario() {
    setClienteId("");
    setNaturezaOperacaoId("");
    setInformacoesComplementares("");
    setErro("");
  }

  const temClientes =
    clientes.length > 0;

  const temNaturezas =
    naturezas.length > 0;

  const serieValida =
    Number.isInteger(serieNfe) &&
    serieNfe > 0;

  const configuracaoCompleta =
    temClientes &&
    temNaturezas &&
    serieValida;

  const clienteSelecionado =
    clientes.find(
      (cliente) =>
        cliente.id === clienteId
    );

  const naturezaSelecionada =
    naturezas.find(
      (natureza) =>
        natureza.id ===
        naturezaOperacaoId
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    limparMensagens();

    if (!configuracaoCompleta) {
      setErro(
        "Resolva as pendências indicadas antes de criar a NF-e."
      );

      return;
    }

    if (!clienteId) {
      setErro(
        "Selecione o cliente destinatário."
      );

      return;
    }

    if (!naturezaOperacaoId) {
      setErro(
        "Selecione a natureza de operação."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await createRascunhoNfe({
          empresaId,

          clienteId,

          naturezaOperacaoId,

          informacoesComplementares:
            informacoesComplementares.trim(),
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      limparFormulario();
      setAberto(false);

      router.push(
        `/empresa/${empresaId}/nfe/${resultado.notaFiscalId}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao criar rascunho da NF-e:",
        error
      );

      setErro(
        "Não foi possível criar o rascunho da NF-e. Tente novamente."
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

        Nova NF-e
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Nova NF-e
          </DialogTitle>

          <DialogDescription>
            Crie o rascunho do documento.
            Depois, você poderá adicionar
            produtos, calcular tributos e
            validar os dados fiscais.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Situação do cadastro */}

          <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Preparação do documento
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Confira os cadastros
                  necessários para iniciar
                  a NF-e.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatusCadastro
                titulo="Cliente"
                descricao={
                  temClientes
                    ? `${clientes.length} disponível(is)`
                    : "Nenhum cadastrado"
                }
                concluido={temClientes}
                icone={UserRound}
              />

              <StatusCadastro
                titulo="Natureza"
                descricao={
                  temNaturezas
                    ? `${naturezas.length} disponível(is)`
                    : "Nenhuma cadastrada"
                }
                concluido={
                  temNaturezas
                }
                icone={ClipboardList}
              />

              <StatusCadastro
                titulo="Série da NF-e"
                descricao={
                  serieValida
                    ? `Série ${serieNfe}`
                    : "Não configurada"
                }
                concluido={serieValida}
                icone={Settings}
              />
            </div>
          </section>

          {/* Pendências */}

          {!configuracaoCompleta && (
            <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-amber-700 dark:text-amber-400">
                    Existem pendências
                    para criar a NF-e
                  </p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Conclua os cadastros
                    abaixo e depois retorne
                    para criar o rascunho.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {!temClientes && (
                      <Button
                        nativeButton={
                          false
                        }
                        render={
                          <Link
                            href={`/empresa/${empresaId}/clientes`}
                          />
                        }
                        type="button"
                        variant="outline"
                        size="sm"
                      >
                        <UserRound
                          size={15}
                        />

                        Cadastrar cliente
                      </Button>
                    )}

                    {!temNaturezas && (
                      <Button
                        nativeButton={
                          false
                        }
                        render={
                          <Link
                            href={`/empresa/${empresaId}/naturezas-operacao`}
                          />
                        }
                        type="button"
                        variant="outline"
                        size="sm"
                      >
                        <ClipboardList
                          size={15}
                        />

                        Cadastrar natureza
                      </Button>
                    )}

                    {!serieValida && (
                      <Button
                        nativeButton={
                          false
                        }
                        render={
                          <Link
                            href={`/empresa/${empresaId}/configuracoes`}
                          />
                        }
                        type="button"
                        variant="outline"
                        size="sm"
                      >
                        <Settings
                          size={15}
                        />

                        Configurar série
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Dados da NF-e */}

          <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Dados iniciais
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Selecione o destinatário
                  e a operação fiscal do
                  documento.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="clienteNovaNfe"
                  className="text-sm font-medium"
                >
                  Cliente destinatário
                </label>

                <select
                  id="clienteNovaNfe"
                  value={clienteId}
                  onChange={(event) => {
                    setClienteId(
                      event.target.value
                    );

                    limparMensagens();
                  }}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={
                    carregando ||
                    !temClientes
                  }
                  required
                >
                  <option value="">
                    Selecione o cliente
                  </option>

                  {clientes.map(
                    (cliente) => (
                      <option
                        key={cliente.id}
                        value={cliente.id}
                      >
                        {cliente.nome} —{" "}
                        {formatarDocumento(
                          cliente.cpfCnpj
                        )}
                      </option>
                    )
                  )}
                </select>

                <p className="text-xs text-muted-foreground">
                  O endereço e os dados
                  fiscais serão obtidos do
                  cadastro do cliente.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="naturezaNovaNfe"
                  className="text-sm font-medium"
                >
                  Natureza de operação
                </label>

                <select
                  id="naturezaNovaNfe"
                  value={
                    naturezaOperacaoId
                  }
                  onChange={(event) => {
                    setNaturezaOperacaoId(
                      event.target.value
                    );

                    limparMensagens();
                  }}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={
                    carregando ||
                    !temNaturezas
                  }
                  required
                >
                  <option value="">
                    Selecione a natureza
                  </option>

                  {naturezas.map(
                    (natureza) => (
                      <option
                        key={
                          natureza.id
                        }
                        value={
                          natureza.id
                        }
                      >
                        {
                          natureza.descricao
                        }{" "}
                        — CFOP{" "}
                        {natureza.cfop}
                      </option>
                    )
                  )}
                </select>

                <p className="text-xs text-muted-foreground">
                  A natureza define a
                  finalidade e o CFOP padrão
                  da operação.
                </p>
              </div>
            </div>

            {(clienteSelecionado ||
              naturezaSelecionada) && (
              <div className="mt-5 grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2">
                <ResumoSelecao
                  titulo="Destinatário"
                  valor={
                    clienteSelecionado
                      ?.nome ??
                    "Não selecionado"
                  }
                  complemento={
                    clienteSelecionado
                      ? formatarDocumento(
                          clienteSelecionado
                            .cpfCnpj
                        )
                      : undefined
                  }
                />

                <ResumoSelecao
                  titulo="Operação"
                  valor={
                    naturezaSelecionada
                      ?.descricao ??
                    "Não selecionada"
                  }
                  complemento={
                    naturezaSelecionada
                      ? `CFOP ${naturezaSelecionada.cfop}`
                      : undefined
                  }
                />
              </div>
            )}
          </section>

          {/* Informações complementares */}

          <section className="rounded-xl border bg-muted/10 p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquareText
                  size={17}
                />
              </div>

              <div>
                <h3 className="font-semibold">
                  Informações complementares
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Campo opcional para
                  observações fiscais ou
                  comerciais.
                </p>
              </div>
            </div>

            <label
              htmlFor="informacoesNovaNfe"
              className="sr-only"
            >
              Informações complementares
            </label>

            <textarea
              id="informacoesNovaNfe"
              placeholder="Ex.: número do pedido, informações de entrega, dados bancários ou observações fiscais..."
              value={
                informacoesComplementares
              }
              onChange={(event) => {
                setInformacoesComplementares(
                  event.target.value
                );

                limparMensagens();
              }}
              className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={carregando}
            />
          </section>

          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{erro}</p>
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
              disabled={
                carregando ||
                !configuracaoCompleta
              }
            >
              {carregando ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Criando...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Criar rascunho
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type StatusCadastroProps = {
  titulo: string;
  descricao: string;
  concluido: boolean;

  icone: typeof UserRound;
};

function StatusCadastro({
  titulo,
  descricao,
  concluido,
  icone: Icone,
}: StatusCadastroProps) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-start gap-3">
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            concluido
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          ].join(" ")}
        >
          {concluido ? (
            <CheckCircle2
              size={17}
            />
          ) : (
            <Icone size={17} />
          )}
        </div>

        <div>
          <p className="text-sm font-medium">
            {titulo}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {descricao}
          </p>
        </div>
      </div>
    </div>
  );
}

type ResumoSelecaoProps = {
  titulo: string;
  valor: string;
  complemento?: string;
};

function ResumoSelecao({
  titulo,
  valor,
  complemento,
}: ResumoSelecaoProps) {
  return (
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
  );
}
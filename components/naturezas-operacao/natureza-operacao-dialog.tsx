"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Plus, Save, X } from "lucide-react";

import { createNaturezaOperacao } from "@/actions/naturezas-operacao/create-natureza-operacao";
import { getNaturezaOperacao } from "@/actions/naturezas-operacao/get-natureza-operacao";
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
import {
  cfopValido,
  normalizarCfop,
  obterDestinoOperacaoCfop,
  obterTipoOperacaoCfop,
} from "@/lib/fiscal/cfop";

type FinalidadeNfe = "NORMAL" | "COMPLEMENTAR" | "AJUSTE" | "DEVOLUCAO";
type IndicadorPresenca =
  | "NAO_SE_APLICA"
  | "PRESENCIAL"
  | "INTERNET"
  | "TELEATENDIMENTO"
  | "ENTREGA_DOMICILIO"
  | "FORA_ESTABELECIMENTO"
  | "OUTROS";
type IndicadorIeDestinatario =
  | "CONTRIBUINTE"
  | "CONTRIBUINTE_ISENTO"
  | "NAO_CONTRIBUINTE";

type Natureza = {
  id: string;
  descricao: string;
  cfop: string;
  finalidadeNfe: FinalidadeNfe;
  consumidorFinal: boolean;
  contribuinteIcms?: boolean;
  ativo: boolean;
};

type Props = { empresaId: string; natureza?: Natureza };

type FormNatureza = {
  descricao: string;
  codigoInterno: string;
  cfop: string;
  finalidadeNfe: FinalidadeNfe;
  consumidorFinal: boolean;
  indicadorPresenca: IndicadorPresenca;
  indicadorIeDestinatario: IndicadorIeDestinatario;
  possuiIntermediador: boolean;
  informacoesComplementaresPadrao: string;
  ativo: boolean;
};

const estadoVazio: FormNatureza = {
  descricao: "",
  codigoInterno: "",
  cfop: "",
  finalidadeNfe: "NORMAL",
  consumidorFinal: false,
  indicadorPresenca: "NAO_SE_APLICA",
  indicadorIeDestinatario: "CONTRIBUINTE",
  possuiIntermediador: false,
  informacoesComplementaresPadrao: "",
  ativo: true,
};

const finalidades = [
  ["NORMAL", "NF-e normal"],
  ["COMPLEMENTAR", "NF-e complementar"],
  ["AJUSTE", "NF-e de ajuste"],
  ["DEVOLUCAO", "NF-e de devolução"],
] as const;

const presencas = [
  ["NAO_SE_APLICA", "Não se aplica"],
  ["PRESENCIAL", "Operação presencial"],
  ["INTERNET", "Operação pela internet"],
  ["TELEATENDIMENTO", "Teleatendimento"],
  ["ENTREGA_DOMICILIO", "Entrega em domicílio"],
  ["FORA_ESTABELECIMENTO", "Fora do estabelecimento"],
  ["OUTROS", "Outros"],
] as const;

const indicadoresIe = [
  ["CONTRIBUINTE", "Contribuinte de ICMS"],
  ["CONTRIBUINTE_ISENTO", "Contribuinte isento de IE"],
  ["NAO_CONTRIBUINTE", "Não contribuinte"],
] as const;

export function NaturezaOperacaoDialog({ empresaId, natureza }: Props) {
  const router = useRouter();
  const editando = Boolean(natureza);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState<FormNatureza>(estadoVazio);

  function atualizar<K extends keyof FormNatureza>(campo: K, valor: FormNatureza[K]) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
    setErro("");
  }

  useEffect(() => {
    if (!aberto) return;

    if (!natureza) {
      setForm(estadoVazio);
      setErro("");
      return;
    }

    let ativo = true;

    async function carregar() {
      try {
        setCarregando(true);
        setErro("");
        const dados = await getNaturezaOperacao(empresaId, natureza!.id);

        if (!ativo) return;
        if (!dados) {
          setErro("Natureza de operação não encontrada.");
          return;
        }

        setForm({
          descricao: dados.descricao,
          codigoInterno: dados.codigoInterno ?? "",
          cfop: dados.cfop,
          finalidadeNfe: dados.finalidadeNfe,
          consumidorFinal: dados.consumidorFinal,
          indicadorPresenca: dados.indicadorPresenca,
          indicadorIeDestinatario: dados.indicadorIeDestinatario,
          possuiIntermediador: dados.possuiIntermediador,
          informacoesComplementaresPadrao:
            dados.informacoesComplementaresPadrao ?? "",
          ativo: dados.ativo,
        });
      } catch (error) {
        console.error("Erro ao carregar natureza:", error);
        if (ativo) setErro("Não foi possível carregar a natureza de operação.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, [aberto, empresaId, natureza]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const descricao = form.descricao.trim();
    const cfop = normalizarCfop(form.cfop);

    if (!descricao) return setErro("Informe a descrição da natureza de operação.");
    if (descricao.length > 60) return setErro("A descrição deve possuir no máximo 60 caracteres.");
    if (!cfopValido(cfop)) return setErro("Informe um CFOP fiscal válido com 4 números.");
    if (form.possuiIntermediador && form.indicadorPresenca === "NAO_SE_APLICA") {
      return setErro("Selecione uma forma de presença quando houver intermediador.");
    }

    try {
      setSalvando(true);
      const dados = {
        empresaId,
        descricao,
        codigoInterno: form.codigoInterno,
        cfop,
        finalidadeNfe: form.finalidadeNfe,
        consumidorFinal: form.consumidorFinal,
        indicadorPresenca: form.indicadorPresenca,
        indicadorIeDestinatario: form.indicadorIeDestinatario,
        possuiIntermediador: form.possuiIntermediador,
        informacoesComplementaresPadrao: form.informacoesComplementaresPadrao,
        ativo: form.ativo,
      };

      const resultado = natureza
        ? await updateNaturezaOperacao({ id: natureza.id, ...dados })
        : await createNaturezaOperacao(dados);

      if (!resultado.success) return setErro(resultado.message);
      setAberto(false);
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar natureza:", error);
      setErro("Não foi possível salvar a natureza de operação.");
    } finally {
      setSalvando(false);
    }
  }

  const tipo = obterTipoOperacaoCfop(form.cfop);
  const destino = obterDestinoOperacaoCfop(form.cfop);
  const bloqueado = salvando || carregando;

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !salvando && setAberto(valor)}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant={editando ? "outline" : "default"}
            size={editando ? "sm" : "default"}
            className={editando ? undefined : "h-11"}
          />
        }
      >
        {editando ? <><Pencil size={16} />Editar</> : <><Plus size={17} />Nova natureza</>}
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar natureza de operação" : "Nova natureza de operação"}</DialogTitle>
          <DialogDescription>
            Configure os indicadores da operação. CST, CSOSN e alíquotas permanecem no produto e no item da NF-e.
          </DialogDescription>
        </DialogHeader>

        {carregando ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle size={18} className="animate-spin" /> Carregando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4 rounded-xl border bg-muted/10 p-5">
              <div>
                <h3 className="font-semibold">Identificação fiscal</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  O tipo e o destino são identificados automaticamente pelo CFOP.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo label="Descrição" className="md:col-span-2">
                  <Input value={form.descricao} maxLength={60} placeholder="Venda de mercadoria" disabled={bloqueado}
                    onChange={(e) => atualizar("descricao", e.target.value)} required />
                </Campo>
                <Campo label="Código interno">
                  <Input value={form.codigoInterno} maxLength={20} placeholder="VENDA-INTERNA" disabled={bloqueado}
                    onChange={(e) => atualizar("codigoInterno", e.target.value)} />
                </Campo>
                <Campo label="CFOP fiscal">
                  <Input value={form.cfop} maxLength={4} inputMode="numeric" placeholder="5102" disabled={bloqueado}
                    onChange={(e) => atualizar("cfop", normalizarCfop(e.target.value).slice(0, 4))} required />
                </Campo>
                <Campo label="Tipo da operação">
                  <Leitura valor={tipo === "ENTRADA" ? "Entrada" : tipo === "SAIDA" ? "Saída" : "Aguardando CFOP"} />
                </Campo>
                <Campo label="Destino da operação">
                  <Leitura valor={destino === "INTERNA" ? "Interna" : destino === "INTERESTADUAL" ? "Interestadual" : destino === "EXTERIOR" ? "Exterior" : "Aguardando CFOP"} />
                </Campo>
                <Campo label="Finalidade da NF-e">
                  <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={form.finalidadeNfe}
                    onChange={(e) => atualizar("finalidadeNfe", e.target.value as FinalidadeNfe)} disabled={bloqueado}>
                    {finalidades.map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
                  </select>
                </Campo>
              </div>
            </section>

            <section className="space-y-4 rounded-xl border bg-muted/10 p-5">
              <div>
                <h3 className="font-semibold">Indicadores da operação</h3>
                <p className="mt-1 text-sm text-muted-foreground">Valores padrão utilizados na NF-e.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo label="Indicador de presença">
                  <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={form.indicadorPresenca}
                    onChange={(e) => atualizar("indicadorPresenca", e.target.value as IndicadorPresenca)} disabled={bloqueado}>
                    {presencas.map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
                  </select>
                </Campo>
                <Campo label="Situação padrão do destinatário">
                  <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={form.indicadorIeDestinatario}
                    onChange={(e) => atualizar("indicadorIeDestinatario", e.target.value as IndicadorIeDestinatario)} disabled={bloqueado}>
                    {indicadoresIe.map(([valor, label]) => <option key={valor} value={valor}>{label}</option>)}
                  </select>
                </Campo>
              </div>

              <div className="divide-y rounded-xl border bg-background">
                <Opcao titulo="Consumidor final" descricao="Operação destinada a consumidor final." checked={form.consumidorFinal}
                  onChange={(v) => atualizar("consumidorFinal", v)} disabled={bloqueado} />
                <Opcao titulo="Operação com intermediador" descricao="Marketplace, plataforma ou outro intermediador." checked={form.possuiIntermediador}
                  onChange={(v) => atualizar("possuiIntermediador", v)} disabled={bloqueado} />
                <Opcao titulo="Natureza ativa" descricao="Disponível para novas notas fiscais." checked={form.ativo}
                  onChange={(v) => atualizar("ativo", v)} disabled={bloqueado} />
              </div>
            </section>

            <section className="space-y-3 rounded-xl border bg-muted/10 p-5">
              <div>
                <h3 className="font-semibold">Informações complementares padrão</h3>
                <p className="mt-1 text-sm text-muted-foreground">Incluídas automaticamente ao criar a NF-e.</p>
              </div>
              <textarea className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm" maxLength={5000}
                value={form.informacoesComplementaresPadrao} disabled={bloqueado} placeholder="Texto padrão da operação"
                onChange={(e) => atualizar("informacoesComplementaresPadrao", e.target.value)} />
              <p className="text-right text-xs text-muted-foreground">{form.informacoesComplementaresPadrao.length}/5000</p>
            </section>

            {erro && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>}

            <DialogFooter className="border-t pt-5">
              <Button type="button" variant="ghost" onClick={() => setAberto(false)} disabled={bloqueado}>
                <X size={17} />Cancelar
              </Button>
              <Button type="submit" className="h-11 min-w-48" disabled={bloqueado}>
                {salvando ? <><LoaderCircle size={17} className="animate-spin" />Salvando...</> : <><Save size={17} />{editando ? "Salvar alterações" : "Cadastrar natureza"}</>}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Campo({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={`space-y-2 ${className}`}><span className="text-sm font-medium">{label}</span>{children}</div>;
}

function Leitura({ valor }: { valor: string }) {
  return <div className="flex h-11 items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">{valor}</div>;
}

function Opcao({ titulo, descricao, checked, onChange, disabled }: {
  titulo: string; descricao: string; checked: boolean; onChange: (valor: boolean) => void; disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 p-4 hover:bg-muted/30">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled}
        className="mt-0.5 h-4 w-4 accent-primary" />
      <span><span className="block text-sm font-medium">{titulo}</span><span className="mt-1 block text-xs text-muted-foreground">{descricao}</span></span>
    </label>
  );
}

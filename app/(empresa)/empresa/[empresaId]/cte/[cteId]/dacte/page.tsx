import { notFound } from "next/navigation";
import {
  PrivilegioEmpresa,
} from "@prisma/client";

import { DactePrintButton } from "@/components/cte/dacte-print-button";
import { gerarQrCodeSvg } from "@/lib/cte/qrcode-svg";
import { validarPrivilegioEmpresa } from "@/lib/empresa/validar-privilegio-empresa";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dinheiro(valor: unknown) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(Number(valor ?? 0));
}

function numero(valor: unknown) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  ).format(Number(valor ?? 0));
}

function dataHora(data: Date | null) {
  if (!data) return "—";

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "America/Porto_Velho",
    }
  ).format(data);
}

function documento(valor: string) {
  const numeros = valor.replace(/\D/g, "");

  if (numeros.length === 14) {
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      "$1.$2.$3-$4"
    );
  }

  return valor;
}

function chaveFormatada(chave: string) {
  return chave.match(/.{1,4}/g)?.join(" ") ?? chave;
}

type Props = {
  params: Promise<{
    empresaId: string;
    cteId: string;
  }>;
};

export default async function DactePage({
  params,
}: Props) {
  const { empresaId, cteId } =
    await params;

  await validarPrivilegioEmpresa(
    empresaId,
    PrivilegioEmpresa.CTE_VISUALIZAR,
    { exigirEmpresaAtiva: false }
  );

  const cte =
    await prisma.conhecimentoTransporte.findFirst({
      where: {
        id: cteId,
        empresaId,
      },
      include: {
        empresa: true,
        participantes: true,
        documentosNfe: true,
        quantidadesCarga: true,
        componentesValor: true,
      },
    });

  if (!cte) {
    notFound();
  }

  if (
    ![
      "AUTORIZADO",
      "CANCELADO",
    ].includes(cte.status) ||
    !cte.chaveAcesso ||
    !cte.protocoloAutorizacao
  ) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-bold">
          DACTE indisponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O DACTE somente pode ser gerado depois da autorização do CT-e pela SEFAZ.
        </p>
      </main>
    );
  }

  const remetente =
    cte.participantes.find(
      (item) =>
        item.papel === "REMETENTE"
    );
  const destinatario =
    cte.participantes.find(
      (item) =>
        item.papel === "DESTINATARIO"
    );
  const expedidor =
    cte.participantes.find(
      (item) =>
        item.papel === "EXPEDIDOR"
    );
  const recebedor =
    cte.participantes.find(
      (item) =>
        item.papel === "RECEBEDOR"
    );

  const qrCode =
    cte.qrCode ??
    `https://dfe-portal.svrs.rs.gov.br/cte/qrCode?chCTe=${cte.chaveAcesso}&tpAmb=1`;

  const qrSvg =
    gerarQrCodeSvg(
      qrCode,
      3,
      4
    );

  const cancelado =
    cte.status === "CANCELADO";

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-[11px] text-black print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[210mm] justify-end print:hidden">
        <DactePrintButton />
      </div>

      <article className="relative mx-auto min-h-[287mm] max-w-[210mm] bg-white p-[8mm] shadow-xl print:min-h-0 print:max-w-none print:shadow-none">
        {cancelado && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-hidden">
            <span className="-rotate-45 whitespace-nowrap text-7xl font-black tracking-[0.2em] text-red-600/15">
              CANCELADO
            </span>
          </div>
        )}

        <header className="grid grid-cols-[1.25fr_0.8fr_0.75fr] border-2 border-black">
          <div className="border-r-2 border-black p-3">
            <p className="text-[9px] font-semibold uppercase">
              Emitente
            </p>
            <h1 className="mt-1 text-base font-black uppercase">
              {cte.empresa.razaoSocial}
            </h1>
            {cte.empresa.nomeFantasia && (
              <p className="mt-0.5 font-semibold">
                {cte.empresa.nomeFantasia}
              </p>
            )}
            <p className="mt-2 leading-4">
              {cte.empresa.logradouro}, {cte.empresa.numero}
              {cte.empresa.complemento
                ? ` - ${cte.empresa.complemento}`
                : ""}
              <br />
              {cte.empresa.bairro} — {cte.empresa.municipio}/{cte.empresa.uf}
              <br />
              CNPJ: {documento(cte.empresa.cnpj)}
              {cte.empresa.inscricaoEstadual
                ? ` · IE: ${cte.empresa.inscricaoEstadual}`
                : ""}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center border-r-2 border-black p-3 text-center">
            <p className="text-2xl font-black">
              DACTE
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase">
              Documento Auxiliar do Conhecimento de Transporte Eletrônico
            </p>
            <p className="mt-3 text-xs font-bold">
              Modelo 57 · Rodoviário
            </p>
          </div>

          <div className="p-3">
            <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <p className="mt-1 text-center text-[8px] leading-3">
              Consulte a autenticidade pelo QR Code
            </p>
          </div>
        </header>

        <section className="grid grid-cols-[0.7fr_0.55fr_1.1fr_1.1fr] border-x-2 border-b-2 border-black">
          <Celula titulo="Número">
            {cte.numero}
          </Celula>
          <Celula titulo="Série">
            {cte.serie}
          </Celula>
          <Celula titulo="Data e hora de emissão">
            {dataHora(cte.dataEmissao)}
          </Celula>
          <Celula titulo="Tipo de serviço" ultima>
            {cte.tipoServico.replaceAll("_", " ")}
          </Celula>
        </section>

        <section className="border-x-2 border-b-2 border-black p-2">
          <p className="text-[8px] font-bold uppercase">
            Chave de acesso
          </p>
          <p className="mt-1 break-all font-mono text-[13px] font-bold tracking-[0.08em]">
            {chaveFormatada(cte.chaveAcesso)}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase">
                Protocolo de autorização
              </p>
              <p className="mt-0.5 font-mono font-semibold">
                {cte.protocoloAutorizacao}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase">
                Data da autorização
              </p>
              <p className="mt-0.5 font-semibold">
                {dataHora(cte.dataAutorizacao)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 grid grid-cols-2 border-2 border-black">
          <ParticipanteDacte
            titulo="Remetente"
            participante={remetente}
          />
          <ParticipanteDacte
            titulo="Destinatário"
            participante={destinatario}
            ultima
          />
          {expedidor && (
            <ParticipanteDacte
              titulo="Expedidor"
              participante={expedidor}
            />
          )}
          {recebedor && (
            <ParticipanteDacte
              titulo="Recebedor"
              participante={recebedor}
              ultima
            />
          )}
        </section>

        <section className="mt-2 border-2 border-black">
          <div className="grid grid-cols-[0.7fr_1.3fr]">
            <Celula titulo="CFOP">
              {cte.cfop}
            </Celula>
            <Celula titulo="Natureza da prestação" ultima>
              {cte.naturezaOperacao}
            </Celula>
          </div>
          <div className="grid grid-cols-3 border-t border-black">
            <Celula titulo="Envio">
              {cte.municipioEnvio}/{cte.ufEnvio}
            </Celula>
            <Celula titulo="Início da prestação">
              {cte.municipioInicio}/{cte.ufInicio}
            </Celula>
            <Celula titulo="Término da prestação" ultima>
              {cte.municipioFim}/{cte.ufFim}
            </Celula>
          </div>
        </section>

        <section className="mt-2 grid grid-cols-[1.2fr_0.8fr] border-2 border-black">
          <div className="border-r border-black p-2">
            <p className="text-[8px] font-bold uppercase">
              Informações da carga
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              <Info label="Produto predominante" valor={cte.produtoPredominante} />
              <Info label="Valor da carga" valor={dinheiro(cte.valorCarga)} />
              <Info label="Valor para averbação" valor={cte.valorCargaAverbacao === null ? "—" : dinheiro(cte.valorCargaAverbacao)} />
              <Info label="RNTRC" valor={cte.rntrc ?? "—"} />
              {cte.quantidadesCarga.map((item) => (
                <Info
                  key={item.id}
                  label={item.tipoMedida}
                  valor={`${numero(item.quantidade)} ${item.unidade.replaceAll("_", " ")}`}
                />
              ))}
            </div>
          </div>

          <div className="p-2">
            <p className="text-[8px] font-bold uppercase">
              Valores da prestação
            </p>
            <div className="mt-2 space-y-1">
              {cte.componentesValor.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 border-b border-dotted border-slate-400 pb-0.5"
                >
                  <span>{item.nome}</span>
                  <span className="font-semibold">
                    {dinheiro(item.valor)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-black pt-1 font-bold">
                <span>Valor total</span>
                <span>{dinheiro(cte.valorPrestacao)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Valor a receber</span>
                <span>{dinheiro(cte.valorReceber)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-2 border-2 border-black p-2">
          <p className="text-[8px] font-bold uppercase">
            Impostos
          </p>
          <div className="mt-2 grid grid-cols-4 gap-3">
            <Info label="ICMS" valor={cte.grupoIcms.replaceAll("_", " ")} />
            <Info label="CST" valor={cte.cstIcms} />
            <Info label="Base ICMS" valor={cte.baseCalculoIcms === null ? "—" : dinheiro(cte.baseCalculoIcms)} />
            <Info label="Valor ICMS" valor={cte.valorIcms === null ? "—" : dinheiro(cte.valorIcms)} />
            <Info label="CST IBS/CBS" valor={cte.cstIbsCbs ?? "—"} />
            <Info label="Class. tributária" valor={cte.classificacaoTributariaIbsCbs ?? "—"} />
            <Info label="IBS" valor={cte.valorIbs === null ? "—" : dinheiro(cte.valorIbs)} />
            <Info label="CBS" valor={cte.valorCbs === null ? "—" : dinheiro(cte.valorCbs)} />
          </div>
        </section>

        <section className="mt-2 border-2 border-black p-2">
          <p className="text-[8px] font-bold uppercase">
            Documentos originários
          </p>
          <div className="mt-1 space-y-1 font-mono text-[9px]">
            {cte.documentosNfe.map((item) => (
              <p key={item.id}>
                NF-e: {chaveFormatada(item.chaveAcesso)}
              </p>
            ))}
          </div>
        </section>

        {(cte.informacoesAdicionais ||
          cte.informacoesFisco) && (
          <section className="mt-2 grid grid-cols-2 border-2 border-black">
            <div className="min-h-20 border-r border-black p-2">
              <p className="text-[8px] font-bold uppercase">
                Informações do contribuinte
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-4">
                {cte.informacoesAdicionais ?? "—"}
              </p>
            </div>
            <div className="min-h-20 p-2">
              <p className="text-[8px] font-bold uppercase">
                Informações do Fisco
              </p>
              <p className="mt-1 whitespace-pre-wrap leading-4">
                {cte.informacoesFisco ?? "—"}
              </p>
            </div>
          </section>
        )}

        {cancelado && (
          <section className="mt-2 border-2 border-red-700 p-2 text-red-800">
            <p className="font-black uppercase">
              CT-e cancelado
            </p>
            <p className="mt-1">
              Protocolo de cancelamento: {cte.protocoloCancelamento ?? "—"} · {dataHora(cte.dataCancelamento)}
            </p>
          </section>
        )}

        <footer className="mt-3 border-t border-black pt-2 text-[8px] leading-3">
          <p>
            Este documento é uma representação auxiliar do CT-e eletrônico. A validade fiscal decorre do XML autorizado pela SEFAZ.
          </p>
          <p className="mt-1 break-all">
            QR Code: {qrCode}
          </p>
        </footer>
      </article>
    </main>
  );
}

function Celula({
  titulo,
  children,
  ultima = false,
}: {
  titulo: string;
  children: React.ReactNode;
  ultima?: boolean;
}) {
  return (
    <div
      className={`p-2 ${ultima ? "" : "border-r border-black"}`}
    >
      <p className="text-[8px] font-bold uppercase">
        {titulo}
      </p>
      <div className="mt-0.5 font-semibold">
        {children}
      </div>
    </div>
  );
}

function Info({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-[8px] font-bold uppercase text-slate-600">
        {label}
      </p>
      <p className="mt-0.5 font-semibold">
        {valor}
      </p>
    </div>
  );
}

function ParticipanteDacte({
  titulo,
  participante,
  ultima = false,
}: {
  titulo: string;
  participante:
    | {
        nome: string;
        cpfCnpj: string;
        inscricaoEstadual: string | null;
        logradouro: string;
        numero: string;
        complemento: string | null;
        bairro: string;
        municipio: string;
        uf: string;
        cep: string | null;
      }
    | undefined;
  ultima?: boolean;
}) {
  return (
    <div
      className={`min-h-24 p-2 ${ultima ? "" : "border-r border-black"}`}
    >
      <p className="text-[8px] font-bold uppercase">
        {titulo}
      </p>
      {participante ? (
        <>
          <p className="mt-1 font-bold uppercase">
            {participante.nome}
          </p>
          <p className="mt-1 leading-4">
            {participante.logradouro}, {participante.numero}
            {participante.complemento
              ? ` - ${participante.complemento}`
              : ""}
            <br />
            {participante.bairro} — {participante.municipio}/{participante.uf}
            {participante.cep
              ? ` · CEP ${participante.cep}`
              : ""}
            <br />
            Documento: {documento(participante.cpfCnpj)}
            {participante.inscricaoEstadual
              ? ` · IE: ${participante.inscricaoEstadual}`
              : ""}
          </p>
        </>
      ) : (
        <p className="mt-1">—</p>
      )}
    </div>
  );
}

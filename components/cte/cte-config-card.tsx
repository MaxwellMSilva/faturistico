"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  CheckCircle2,
  LoaderCircle,
  ServerCog,
  Settings2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { consultarStatusServicoCte } from "@/actions/cte/status-servico-cte";
import { updateConfiguracaoCte } from "@/actions/cte/update-configuracao-cte";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  empresaId: string;
  configuracao: {
    ambiente: "HOMOLOGACAO" | "PRODUCAO";
    regimeTributario: string;
    serieCte: number;
    rntrc: string | null;
  } | null;
  possuiCertificado: boolean;
  certificadoExpirado: boolean;
  validadeCertificado: Date | null;
  podeEditarConfiguracao: boolean;
};

export function CteConfigCard({
  empresaId,
  configuracao,
  possuiCertificado,
  certificadoExpirado,
  validadeCertificado,
  podeEditarConfiguracao,
}: Props) {
  const router = useRouter();
  const [pendente, iniciar] =
    useTransition();
  const [editando, setEditando] =
    useState(false);
  const [serie, setSerie] = useState(
    String(configuracao?.serieCte ?? 1)
  );
  const [rntrc, setRntrc] = useState(
    configuracao?.rntrc ?? ""
  );
  const [mensagem, setMensagem] =
    useState("");
  const [erro, setErro] =
    useState("");

  function salvar() {
    setMensagem("");
    setErro("");

    iniciar(async () => {
      const resultado =
        await updateConfiguracaoCte(
          empresaId,
          {
            serieCte: Number(serie),
            rntrc,
          }
        );

      if (!resultado.success) {
        setErro(resultado.message);
        return;
      }

      setMensagem(
        "Configuração do CT-e salva."
      );
      setEditando(false);
      router.refresh();
    });
  }

  function testarSefaz() {
    setMensagem("");
    setErro("");

    iniciar(async () => {
      const resultado =
        await consultarStatusServicoCte(
          empresaId
        );

      if (!resultado.success) {
        setErro(
          resultado.codigo
            ? `${resultado.codigo} - ${resultado.message}`
            : resultado.message
        );
        return;
      }

      setMensagem(
        `${resultado.codigo ?? "107"} - ${resultado.message}`
      );
    });
  }

  const configurado = Boolean(
    configuracao?.rntrc &&
      configuracao?.serieCte
  );

  const certificadoOk =
    possuiCertificado &&
    !certificadoExpirado;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ServerCog
              size={18}
              className="text-primary"
            />
            <h2 className="font-semibold">
              Prontidão para emissão
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Ambiente, numeração, RNTRC, certificado A1 e comunicação com a SEFAZ.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {podeEditarConfiguracao &&
            configuracao && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setEditando(
                    (valor) => !valor
                  )
                }
              >
                <Settings2 />
                Série e RNTRC
              </Button>
            )}

          <Button
            type="button"
            variant="outline"
            disabled={
              pendente ||
              !configurado ||
              !certificadoOk
            }
            onClick={testarSefaz}
          >
            {pendente ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ShieldCheck />
            )}
            Testar SEFAZ
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Status
          ok={Boolean(configuracao)}
          titulo="Configuração fiscal"
          detalhe={
            configuracao
              ? configuracao.ambiente ===
                "HOMOLOGACAO"
                ? "Homologação"
                : "Produção"
              : "Não configurada"
          }
        />
        <Status
          ok={configurado}
          titulo="CT-e"
          detalhe={
            configuracao
              ? `Série ${configuracao.serieCte} · RNTRC ${configuracao.rntrc || "não informado"}`
              : "Salve a configuração fiscal geral"
          }
        />
        <Status
          ok={certificadoOk}
          titulo="Certificado A1"
          detalhe={
            !possuiCertificado
              ? "Não cadastrado"
              : certificadoExpirado
                ? "Expirado"
                : validadeCertificado
                  ? `Válido até ${new Intl.DateTimeFormat("pt-BR", {
                      timeZone:
                        "America/Porto_Velho",
                    }).format(
                      validadeCertificado
                    )}`
                  : "Ativo"
          }
        />
        <Status
          ok={
            configurado &&
            certificadoOk
          }
          titulo="Emissão"
          detalhe={
            configurado &&
            certificadoOk
              ? "Pronto para testar a SEFAZ"
              : "Existem pendências"
          }
        />
      </div>

      {!configuracao && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Salve primeiro as configurações fiscais gerais da empresa na tela Configurações.
        </div>
      )}

      {editando && configuracao && (
        <div className="mt-5 grid gap-4 rounded-xl border bg-muted/20 p-4 md:grid-cols-[180px_1fr_auto] md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Série do CT-e
            </label>
            <Input
              type="number"
              min={1}
              max={999}
              value={serie}
              onChange={(event) =>
                setSerie(event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              RNTRC
            </label>
            <Input
              value={rntrc}
              onChange={(event) =>
                setRntrc(
                  event.target.value
                )
              }
              placeholder="8 dígitos ou ISENTO"
            />
          </div>
          <Button
            type="button"
            onClick={salvar}
            disabled={pendente}
          >
            {pendente && (
              <LoaderCircle className="animate-spin" />
            )}
            Salvar
          </Button>
        </div>
      )}

      {mensagem && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}
    </section>
  );
}

function Status({
  ok,
  titulo,
  detalhe,
}: {
  ok: boolean;
  titulo: string;
  detalhe: string;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2
            size={16}
            className="text-emerald-600"
          />
        ) : (
          <TriangleAlert
            size={16}
            className="text-amber-600"
          />
        )}
        <p className="text-sm font-semibold">
          {titulo}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {detalhe}
      </p>
    </div>
  );
}

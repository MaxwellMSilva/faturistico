"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { Save } from "lucide-react";

import { updateConfiguracaoFiscal } from "@/actions/configuracao-fiscal/update-configuracao-fiscal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AmbienteFiscal =
  | "HOMOLOGACAO"
  | "PRODUCAO";

type RegimeTributario =
  | "SIMPLES_NACIONAL"
  | "SIMPLES_NACIONAL_EXCESSO_SUBLIMITE"
  | "REGIME_NORMAL";

type Configuracao = {
  ambiente: AmbienteFiscal;

  regimeTributario:
    RegimeTributario;

  serieNfe: number;
  serieNfce: number;

  idCsc: string | null;

  possuiCsc: boolean;

  possuiTokenNuvemFiscal:
    boolean;
};

type Props = {
  empresaId: string;

  configuracao:
    | Configuracao
    | null;
};

export function ConfiguracaoFiscalForm({
  empresaId,
  configuracao,
}: Props) {
  const router = useRouter();

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    ambiente,
    setAmbiente,
  ] = useState<AmbienteFiscal>(
    configuracao?.ambiente ??
      "HOMOLOGACAO"
  );

  const [
    regimeTributario,
    setRegimeTributario,
  ] = useState<RegimeTributario>(
    configuracao
      ?.regimeTributario ??
      "SIMPLES_NACIONAL"
  );

  const [
    serieNfe,
    setSerieNfe,
  ] = useState(
    String(
      configuracao?.serieNfe ?? 1
    )
  );

  const [
    serieNfce,
    setSerieNfce,
  ] = useState(
    String(
      configuracao?.serieNfce ?? 1
    )
  );

  const [idCsc, setIdCsc] =
    useState(
      configuracao?.idCsc ?? ""
    );

  const [csc, setCsc] =
    useState("");

  const [
    tokenNuvemFiscal,
    setTokenNuvemFiscal,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const numeroSerieNfe =
      Number(serieNfe);

    const numeroSerieNfce =
      Number(serieNfce);

    try {
      setCarregando(true);

      const resultado =
        await updateConfiguracaoFiscal({
          empresaId,

          ambiente,

          regimeTributario,

          serieNfe:
            numeroSerieNfe,

          serieNfce:
            numeroSerieNfce,

          idCsc,

          csc,

          tokenNuvemFiscal,
        });

      if (!resultado.success) {
        alert(resultado.message);

        return;
      }

      alert(
        "Configuração fiscal salva com sucesso."
      );

      setCsc("");
      setTokenNuvemFiscal("");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível salvar a configuração fiscal."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Emissão fiscal
          </h2>

          <p className="text-sm text-muted-foreground">
            Configure o ambiente, o regime
            tributário e as séries.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            value={ambiente}
            onChange={(event) =>
              setAmbiente(
                event.target
                  .value as AmbienteFiscal
              )
            }
            className="h-12 rounded-md border bg-background px-3 text-sm"
            disabled={carregando}
          >
            <option value="HOMOLOGACAO">
              Homologação
            </option>

            <option value="PRODUCAO">
              Produção
            </option>
          </select>

          <select
            value={
              regimeTributario
            }
            onChange={(event) =>
              setRegimeTributario(
                event.target
                  .value as RegimeTributario
              )
            }
            className="h-12 rounded-md border bg-background px-3 text-sm"
            disabled={carregando}
          >
            <option value="SIMPLES_NACIONAL">
              Simples Nacional
            </option>

            <option value="SIMPLES_NACIONAL_EXCESSO_SUBLIMITE">
              Simples Nacional — excesso de sublimite
            </option>

            <option value="REGIME_NORMAL">
              Regime Normal
            </option>
          </select>

          <Input
            className="h-12"
            type="number"
            min={1}
            step={1}
            placeholder="Série da NF-e"
            value={serieNfe}
            onChange={(event) =>
              setSerieNfe(
                event.target.value
              )
            }
            disabled={carregando}
            required
          />

          <Input
            className="h-12"
            type="number"
            min={1}
            step={1}
            placeholder="Série da NFC-e"
            value={serieNfce}
            onChange={(event) =>
              setSerieNfce(
                event.target.value
              )
            }
            disabled={carregando}
            required
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            NFC-e
          </h2>

          <p className="text-sm text-muted-foreground">
            Deixe o CSC vazio para manter
            o valor já configurado.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            className="h-12"
            placeholder="ID do CSC"
            value={idCsc}
            onChange={(event) =>
              setIdCsc(
                event.target.value
              )
            }
            disabled={carregando}
          />

          <Input
            className="h-12"
            type="password"
            placeholder={
              configuracao?.possuiCsc
                ? "CSC já configurado — informe apenas para substituir"
                : "CSC"
            }
            value={csc}
            onChange={(event) =>
              setCsc(
                event.target.value
              )
            }
            disabled={carregando}
          />
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">
            Integração Nuvem Fiscal
          </h2>

          <p className="text-sm text-muted-foreground">
            Campo opcional. Deixe vazio
            para manter o token existente.
          </p>
        </div>

        <Input
          className="h-12"
          type="password"
          placeholder={
            configuracao
              ?.possuiTokenNuvemFiscal
              ? "Token já configurado — informe apenas para substituir"
              : "Token da Nuvem Fiscal"
          }
          value={tokenNuvemFiscal}
          onChange={(event) =>
            setTokenNuvemFiscal(
              event.target.value
            )
          }
          disabled={carregando}
        />
      </section>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="h-12 px-6"
          disabled={carregando}
        >
          <Save size={17} />

          {carregando
            ? "Salvando..."
            : "Salvar configuração"}
        </Button>
      </div>
    </form>
  );
}
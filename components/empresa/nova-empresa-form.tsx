"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { createEmpresa } from "@/actions/empresa/create-empresa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NovaEmpresaForm() {
  const router = useRouter();

  const { data: session } =
    useSession();

  const [razaoSocial, setRazaoSocial] =
    useState("");

  const [nomeFantasia, setNomeFantasia] =
    useState("");

  const [cnpj, setCnpj] =
    useState("");

  const [
    inscricaoEstadual,
    setInscricaoEstadual,
  ] = useState("");

  const [
    inscricaoMunicipal,
    setInscricaoMunicipal,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [telefone, setTelefone] =
    useState("");

  const [cep, setCep] =
    useState("");

  const [logradouro,
    setLogradouro] =
    useState("");

  const [numero, setNumero] =
    useState("");

  const [complemento,
    setComplemento] =
    useState("");

  const [bairro, setBairro] =
    useState("");

  const [municipio,
    setMunicipio] =
    useState("");

  const [
    codigoMunicipio,
    setCodigoMunicipio,
  ] = useState("");

  const [uf, setUf] =
    useState("");

  async function handleSubmit() {
    try {
      if (!session?.user?.id) {
        alert(
          "Usuário não autenticado."
        );

        return;
      }

      await createEmpresa({
        usuarioId:
          session.user.id,

        razaoSocial,
        nomeFantasia,
        cnpj,

        inscricaoEstadual,
        inscricaoMunicipal,

        email,
        telefone,

        cep,
        logradouro,
        numero,
        complemento,

        bairro,

        municipio,
        codigoMunicipio,

        uf,
      });

      alert(
        "Empresa cadastrada com sucesso."
      );

      router.push(
        "/configuracoes/empresa"
      );

    } catch (error: any) {
      console.error(error);

      alert(
        error?.message ??
        "Erro ao cadastrar empresa."
      );
    }
  }

  async function buscarCnpj() {
    try {
      const cnpjLimpo =
        cnpj.replace(/\D/g, "");

      const response =
        await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`
        );

      const data =
        await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(
          data.message ??
          "Erro ao consultar CNPJ"
        );
      }

      setRazaoSocial(
        data.razao_social ?? ""
      );

      setNomeFantasia(
        data.nome_fantasia ?? ""
      );

      setCep(
        data.cep ?? ""
      );

      setLogradouro(
        data.logradouro ?? ""
      );

      setNumero(
        data.numero ?? ""
      );

      setComplemento(
        data.complemento ?? ""
      );

      setBairro(
        data.bairro ?? ""
      );

      setMunicipio(
        data.municipio ?? ""
      );

      setCodigoMunicipio(
        String(
          data.codigo_municipio_ibge ?? ""
        )
      );

      setUf(
        data.uf ?? ""
      );

      setTelefone(
        data.ddd_telefone_1 ?? ""
      );

      setEmail(
        data.email ?? ""
      );

      alert(
        "Dados encontrados."
      );

    } catch (error) {
      console.error(error);

      alert(
        "Erro ao consultar CNPJ."
      );
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">

      <div className="w-full max-w-5xl rounded-2xl border bg-card p-8 shadow-sm">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold">
            Cadastro da Empresa
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Informe os dados da empresa emissora.
          </p>

        </div>

        <div className="space-y-8">

          {/* Dados da Empresa */}

          <div>

            <h2 className="mb-4 text-lg font-semibold">
              Dados da Empresa
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <Input
                placeholder="Razão Social"
                value={razaoSocial}
                onChange={(e) =>
                  setRazaoSocial(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Nome Fantasia"
                value={nomeFantasia}
                onChange={(e) =>
                  setNomeFantasia(
                    e.target.value
                  )
                }
              />

              <div className="flex gap-2">

                <Input
                  placeholder="CNPJ"
                  value={cnpj}
                  onChange={(e) =>
                    setCnpj(e.target.value)
                  }
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={buscarCnpj}
                >
                  Buscar
                </Button>

              </div>

              <Input
                placeholder="Inscrição Estadual"
                value={
                  inscricaoEstadual
                }
                onChange={(e) =>
                  setInscricaoEstadual(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Inscrição Municipal"
                value={
                  inscricaoMunicipal
                }
                onChange={(e) =>
                  setInscricaoMunicipal(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* Contato */}

          <div>

            <h2 className="mb-4 text-lg font-semibold">
              Contato
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <Input
                placeholder="E-mail"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Telefone"
                value={telefone}
                onChange={(e) =>
                  setTelefone(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* Endereço */}

          <div>

            <h2 className="mb-4 text-lg font-semibold">
              Endereço
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <Input
                placeholder="CEP"
                value={cep}
                onChange={(e) =>
                  setCep(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Logradouro"
                value={logradouro}
                onChange={(e) =>
                  setLogradouro(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Número"
                value={numero}
                onChange={(e) =>
                  setNumero(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Complemento"
                value={complemento}
                onChange={(e) =>
                  setComplemento(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Bairro"
                value={bairro}
                onChange={(e) =>
                  setBairro(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Município"
                value={municipio}
                onChange={(e) =>
                  setMunicipio(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="Código Município IBGE"
                value={
                  codigoMunicipio
                }
                onChange={(e) =>
                  setCodigoMunicipio(
                    e.target.value
                  )
                }
              />

              <Input
                placeholder="UF"
                value={uf}
                onChange={(e) =>
                  setUf(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <Button
            onClick={handleSubmit}
            className="h-12 w-full"
          >
            Salvar Empresa
          </Button>

        </div>

      </div>

    </div>
  );
}
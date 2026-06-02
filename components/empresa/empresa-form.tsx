"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateEmpresa } from "@/actions/empresa/update-empresa";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  empresa: any;
};

export function EmpresaForm({
  empresa,
}: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    razaoSocial:
      empresa.razaoSocial ?? "",

    nomeFantasia:
      empresa.nomeFantasia ?? "",

    cnpj:
      empresa.cnpj ?? "",

    inscricaoEstadual:
      empresa.inscricaoEstadual ?? "",

    inscricaoMunicipal:
      empresa.inscricaoMunicipal ?? "",

    crt:
      empresa.crt ?? "",

    email:
      empresa.email ?? "",

    telefone:
      empresa.telefone ?? "",

    cep:
      empresa.cep ?? "",

    logradouro:
      empresa.logradouro ?? "",

    numero:
      empresa.numero ?? "",

    complemento:
      empresa.complemento ?? "",

    bairro:
      empresa.bairro ?? "",

    municipio:
      empresa.municipio ?? "",

    codigoMunicipio:
      empresa.codigoMunicipio ?? "",

    uf:
      empresa.uf ?? "",

    cnaePrincipal:
      empresa.cnaePrincipal ?? "",
  });

  async function handleSave() {
    await updateEmpresa({
      id: empresa.id,
      ...form,
    });

    alert("Empresa atualizada!");

    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">

        <Input
          placeholder="Razão Social"
          value={form.razaoSocial}
          onChange={(e) =>
            setForm({
              ...form,
              razaoSocial: e.target.value,
            })
          }
        />

        <Input
          placeholder="Nome Fantasia"
          value={form.nomeFantasia}
          onChange={(e) =>
            setForm({
              ...form,
              nomeFantasia: e.target.value,
            })
          }
        />

        <Input
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={(e) =>
            setForm({
              ...form,
              cnpj: e.target.value,
            })
          }
        />

        <Input
          placeholder="Inscrição Estadual"
          value={form.inscricaoEstadual}
          onChange={(e) =>
            setForm({
              ...form,
              inscricaoEstadual:
                e.target.value,
            })
          }
        />

        <Input
          placeholder="Inscrição Municipal"
          value={form.inscricaoMunicipal}
          onChange={(e) =>
            setForm({
              ...form,
              inscricaoMunicipal:
                e.target.value,
            })
          }
        />

        <select
          value={form.crt}
          onChange={(e) =>
            setForm({
              ...form,
              crt: e.target.value,
            })
          }
          className="h-10 rounded-md border px-3"
        >
          <option value="">
            Selecione o CRT
          </option>

          <option value="1">
            Simples Nacional
          </option>

          <option value="2">
            Simples Nacional Excesso Sublimite
          </option>

          <option value="3">
            Regime Normal
          </option>
        </select>

        <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
                setForm({
                ...form,
                email: e.target.value,
                })
            }
            />

            <Input
            placeholder="Telefone"
            value={form.telefone}
            onChange={(e) =>
                setForm({
                ...form,
                telefone: e.target.value,
                })
            }
            />

            <Input
            placeholder="CEP"
            value={form.cep}
            onChange={(e) =>
                setForm({
                ...form,
                cep: e.target.value,
                })
            }
            />

            <Input
            placeholder="Logradouro"
            value={form.logradouro}
            onChange={(e) =>
                setForm({
                ...form,
                logradouro: e.target.value,
                })
            }
            />

            <Input
            placeholder="Número"
            value={form.numero}
            onChange={(e) =>
                setForm({
                ...form,
                numero: e.target.value,
                })
            }
            />

            <Input
            placeholder="Complemento"
            value={form.complemento}
            onChange={(e) =>
                setForm({
                ...form,
                complemento: e.target.value,
                })
            }
            />

            <Input
            placeholder="Bairro"
            value={form.bairro}
            onChange={(e) =>
                setForm({
                ...form,
                bairro: e.target.value,
                })
            }
            />

            <Input
            placeholder="Município"
            value={form.municipio}
            onChange={(e) =>
                setForm({
                ...form,
                municipio: e.target.value,
                })
            }
            />

            <Input
            placeholder="Código Município IBGE"
            value={form.codigoMunicipio}
            onChange={(e) =>
                setForm({
                ...form,
                codigoMunicipio: e.target.value,
                })
            }
            />

            <Input
            placeholder="UF"
            value={form.uf}
            onChange={(e) =>
                setForm({
                ...form,
                uf: e.target.value,
                })
            }
            />

            <Input
            placeholder="CNAE Principal"
            value={form.cnaePrincipal}
            onChange={(e) =>
                setForm({
                ...form,
                cnaePrincipal: e.target.value,
                })
            }
            />

      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
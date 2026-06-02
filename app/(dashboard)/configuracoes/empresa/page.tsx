import { getEmpresa } from "@/actions/empresa/get-empresa";
import { EmpresaForm } from "@/components/empresa/empresa-form";

export const dynamic = "force-dynamic";

export default async function ConfiguracaoEmpresaPage() {
  const empresa = await getEmpresa();

  if (!empresa) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">
          Empresa
        </h1>

        <div className="rounded-xl border bg-card p-6">
          Nenhuma empresa encontrada.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Dados da Empresa
        </h1>

        <p className="text-muted-foreground">
          Configure os dados fiscais da empresa emissora.
        </p>
      </div>

      <EmpresaForm empresa={empresa} />
    </div>
  );
}
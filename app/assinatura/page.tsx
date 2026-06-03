import { getModulos } from "@/actions/assinaturas/get-modulos";

import { AssinaturaForm } from "@/components/assinaturas/assinatura-form";

export default async function AssinaturaPage() {
  const modulos = await getModulos();

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Assinatura
        </h1>

        <p className="text-muted-foreground">
          Escolha os módulos que deseja utilizar.
        </p>
      </div>

      <AssinaturaForm
        modulos={modulos.map((m) => ({
          ...m,
          valor: Number(m.valor),
        }))}
      />
    </div>
  );
}
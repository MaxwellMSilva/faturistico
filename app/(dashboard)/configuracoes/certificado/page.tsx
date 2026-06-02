import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CertificadoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Certificado Digital
        </h1>

        <p className="text-muted-foreground">
          Configure o certificado utilizado para emissão de NF-e.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="grid gap-4">

          <Input
            type="file"
            accept=".pfx"
          />

          <Input
            type="password"
            placeholder="Senha do Certificado"
          />

        </div>

        <div className="mt-6 flex justify-end">
          <Button>
            Salvar Certificado
          </Button>
        </div>
      </div>
    </div>
  );
}
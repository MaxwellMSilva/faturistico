import { AuthShell } from "@/components/auth/auth-shell";
import { CadastroForm } from "@/components/auth/cadastro-form";

export default function CadastroPage() {
  return (
    <AuthShell
      titulo="Criar conta"
      subtitulo="Preencha os dados abaixo para criar a conta do proprietário."
      variante="cadastro"
    >
      <CadastroForm />
    </AuthShell>
  );
}

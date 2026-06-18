import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function EntrarPage() {
  return (
    <AuthShell
      titulo="Bem-vindo de volta"
      subtitulo="Entre com seu e-mail e senha para acessar o painel."
      variante="login"
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}

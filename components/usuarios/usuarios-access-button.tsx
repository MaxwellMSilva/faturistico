import Link from "next/link";

import {
  LockKeyhole,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type RoleUsuario =
  | "OWNER"
  | "ADMIN"
  | "USUARIO";

type Props = {
  usuarioRole: RoleUsuario;

  variant?:
    | "default"
    | "outline"
    | "ghost";

  size?:
    | "default"
    | "sm"
    | "lg"
    | "icon";

  className?: string;

  texto?: string;
};

export function UsuariosAccessButton({
  usuarioRole,
  variant = "outline",
  size = "default",
  className,
  texto = "Usuários",
}: Props) {
  const permitido =
    usuarioRole === "OWNER" ||
    usuarioRole === "ADMIN";

  if (!permitido) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={[
          "cursor-not-allowed opacity-50",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled
        title="Você não possui permissão para gerenciar usuários"
      >
        <LockKeyhole size={16} />

        {texto}
      </Button>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={
        <Link href="/usuarios" />
      }
      variant={variant}
      size={size}
      className={className}
    >
      <Users size={16} />

      {texto}
    </Button>
  );
}
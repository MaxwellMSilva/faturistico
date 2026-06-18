"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";

type CampoSenhaProps = {
  id: string;
  name?: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  autoComplete?: string;
  minLength?: number;
  disabled?: boolean;
  required?: boolean;
  ajuda?: string;
};

export function CampoSenha({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
  minLength,
  disabled = false,
  required = false,
  ajuda,
}: CampoSenhaProps) {
  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <Input
          id={id}
          name={name}
          type={
            mostrarSenha
              ? "text"
              : "password"
          }
          className="h-11 pr-11"
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          autoComplete={autoComplete}
          minLength={minLength}
          disabled={disabled}
          required={required}
        />

        <button
          type="button"
          onClick={() =>
            setMostrarSenha(
              (atual) => !atual
            )
          }
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            mostrarSenha
              ? "Ocultar senha"
              : "Mostrar senha"
          }
          aria-pressed={mostrarSenha}
          disabled={disabled}
        >
          {mostrarSenha ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>

      {ajuda && (
        <p className="text-xs text-muted-foreground">
          {ajuda}
        </p>
      )}
    </div>
  );
}

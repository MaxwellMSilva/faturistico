"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  Building2,
  KeyRound,
  LoaderCircle,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { updateUsuario } from "@/actions/usuarios/update-usuario";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RoleUsuario =
  | "OWNER"
  | "ADMIN"
  | "USUARIO";

type PermissaoEmpresa =
  | "ADMIN"
  | "FATURAMENTO"
  | "OPERADOR"
  | "VISUALIZADOR";

type Empresa = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
};

type AcessoUsuario = {
  id: string;
  empresaId: string;
  permissao: string;
  ativo: boolean;
};

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: RoleUsuario;

  empresas: AcessoUsuario[];
};

type Props = {
  usuario: Usuario;

  empresas: Empresa[];

  gestorRole:
    | "OWNER"
    | "ADMIN";

  rolesPermitidos: Array<
    "ADMIN" | "USUARIO"
  >;
};

function somenteNumeros(
  valor: string
) {
  return valor.replace(/\D/g, "");
}

function formatarCnpj(
  valor: string
) {
  const numeros =
    somenteNumeros(valor);

  if (numeros.length !== 14) {
    return valor;
  }

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

function permissaoValida(
  permissao: string
): permissao is PermissaoEmpresa {
  return [
    "ADMIN",
    "FATURAMENTO",
    "OPERADOR",
    "VISUALIZADOR",
  ].includes(permissao);
}

export function UsuarioEditDialog({
  usuario,
  empresas,
  gestorRole,
  rolesPermitidos,
}: Props) {
  const router = useRouter();

  const editandoOwner =
    usuario.role === "OWNER";

  function criarEstadoInicial() {
    const acessos: Record<
      string,
      PermissaoEmpresa
    > = {};

    usuario.empresas.forEach(
      (acesso) => {
        if (!acesso.ativo) {
          return;
        }

        if (
          usuario.role === "ADMIN"
        ) {
          acessos[
            acesso.empresaId
          ] = "ADMIN";

          return;
        }

        acessos[acesso.empresaId] =
          permissaoValida(
            acesso.permissao
          ) &&
          acesso.permissao !==
            "ADMIN"
            ? acesso.permissao
            : "OPERADOR";
      }
    );

    return {
      nome: usuario.nome,
      email: usuario.email,

      role: usuario.role,

      novaSenha: "",
      confirmarSenha: "",

      acessos,
    };
  }

  type EstadoFormulario =
    ReturnType<
      typeof criarEstadoInicial
    >;

  const [aberto, setAberto] =
    useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [form, setForm] =
    useState<EstadoFormulario>(
      criarEstadoInicial
    );

  function atualizarCampo<
    Campo extends keyof EstadoFormulario,
  >(
    campo: Campo,
    valor: EstadoFormulario[Campo]
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErro("");
  }

  function alterarRole(
    novaRole:
      | "ADMIN"
      | "USUARIO"
  ) {
    setForm((anterior) => {
      const novosAcessos: Record<
        string,
        PermissaoEmpresa
      > = {};

      Object.keys(
        anterior.acessos
      ).forEach((empresaId) => {
        novosAcessos[empresaId] =
          novaRole === "ADMIN"
            ? "ADMIN"
            : "OPERADOR";
      });

      return {
        ...anterior,
        role: novaRole,
        acessos: novosAcessos,
      };
    });

    setErro("");
  }

  function alternarEmpresa(
    empresaId: string
  ) {
    setForm((anterior) => {
      const novosAcessos = {
        ...anterior.acessos,
      };

      if (
        novosAcessos[empresaId]
      ) {
        delete novosAcessos[
          empresaId
        ];
      } else {
        novosAcessos[empresaId] =
          anterior.role ===
          "ADMIN"
            ? "ADMIN"
            : "OPERADOR";
      }

      return {
        ...anterior,
        acessos: novosAcessos,
      };
    });

    setErro("");
  }

  function alterarPermissao(
    empresaId: string,
    permissao: PermissaoEmpresa
  ) {
    setForm((anterior) => ({
      ...anterior,

      acessos: {
        ...anterior.acessos,

        [empresaId]:
          permissao,
      },
    }));

    setErro("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro("");

    const nome =
      form.nome.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    if (!nome) {
      setErro(
        "Informe o nome do usuário."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      setErro(
        "Informe um e-mail válido."
      );

      return;
    }

    if (
      form.novaSenha &&
      form.novaSenha.length < 6
    ) {
      setErro(
        "A nova senha deve possuir pelo menos 6 caracteres."
      );

      return;
    }

    if (
      form.novaSenha !==
      form.confirmarSenha
    ) {
      setErro(
        "A confirmação da nova senha não confere."
      );

      return;
    }

    const acessos =
      Object.entries(
        form.acessos
      ).map(
        ([
          empresaId,
          permissao,
        ]) => ({
          empresaId,
          permissao,
        })
      );

    if (
      !editandoOwner &&
      acessos.length === 0
    ) {
      setErro(
        "Selecione pelo menos uma empresa para o usuário."
      );

      return;
    }

    try {
      setCarregando(true);

      const resultado =
        await updateUsuario({
          usuarioId:
            usuario.id,

          nome,
          email,

          role: form.role,

          novaSenha:
            form.novaSenha ||
            undefined,

          acessos:
            editandoOwner
              ? []
              : acessos,
        });

      if (!resultado.success) {
        setErro(
          resultado.message
        );

        return;
      }

      setAberto(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Erro ao atualizar usuário:",
        error
      );

      setErro(
        "Não foi possível atualizar o usuário."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(valor) => {
        if (carregando) {
          return;
        }

        setAberto(valor);

        if (valor) {
          setForm(
            criarEstadoInicial()
          );

          setErro("");
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
          />
        }
      >
        <Pencil size={16} />

        Editar
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Editar usuário
          </DialogTitle>

          <DialogDescription>
            Atualize os dados, a senha
            e os acessos do usuário.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Dados pessoais
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Nome, e-mail e função
                  do usuário.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`nome-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Nome completo
                </label>

                <Input
                  id={`nome-${usuario.id}`}
                  className="h-11"
                  value={form.nome}
                  onChange={(event) =>
                    atualizarCampo(
                      "nome",
                      event.target.value
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`email-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  E-mail
                </label>

                <Input
                  id={`email-${usuario.id}`}
                  type="email"
                  className="h-11"
                  value={form.email}
                  onChange={(event) =>
                    atualizarCampo(
                      "email",
                      event.target.value
                    )
                  }
                  disabled={carregando}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor={`role-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Função na plataforma
                </label>

                {editandoOwner ? (
                  <div className="flex h-11 items-center gap-2 rounded-md border bg-muted/30 px-3 text-sm">
                    <ShieldCheck
                      size={17}
                      className="text-violet-600"
                    />

                    Proprietário
                  </div>
                ) : (
                  <select
                    id={`role-${usuario.id}`}
                    value={form.role}
                    onChange={(event) =>
                      alterarRole(
                        event.target
                          .value as
                          | "ADMIN"
                          | "USUARIO"
                      )
                    }
                    className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                    disabled={
                      carregando ||
                      gestorRole ===
                        "ADMIN"
                    }
                  >
                    {rolesPermitidos.includes(
                      "ADMIN"
                    ) && (
                      <option value="ADMIN">
                        Administrador
                      </option>
                    )}

                    <option value="USUARIO">
                      Usuário
                    </option>
                  </select>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-muted/10 p-5">
            <div className="mb-5 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Alterar senha
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Deixe vazio para manter
                  a senha atual.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor={`senha-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Nova senha
                </label>

                <Input
                  id={`senha-${usuario.id}`}
                  type="password"
                  className="h-11"
                  value={
                    form.novaSenha
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "novaSenha",
                      event.target.value
                    )
                  }
                  placeholder="Mínimo de 6 caracteres"
                  disabled={carregando}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`confirmar-senha-${usuario.id}`}
                  className="text-sm font-medium"
                >
                  Confirmar nova senha
                </label>

                <Input
                  id={`confirmar-senha-${usuario.id}`}
                  type="password"
                  className="h-11"
                  value={
                    form.confirmarSenha
                  }
                  onChange={(event) =>
                    atualizarCampo(
                      "confirmarSenha",
                      event.target.value
                    )
                  }
                  placeholder="Repita a nova senha"
                  disabled={carregando}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </section>

          {!editandoOwner && (
            <section className="rounded-xl border bg-muted/10 p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 size={20} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Acesso às empresas
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Selecione as empresas
                    e permissões do usuário.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {empresas.map(
                  (empresa) => {
                    const permissao =
                      form.acessos[
                        empresa.id
                      ];

                    const selecionada =
                      Boolean(
                        permissao
                      );

                    return (
                      <div
                        key={empresa.id}
                        className={[
                          "rounded-xl border p-4",
                          selecionada
                            ? "border-primary/40 bg-primary/5"
                            : "bg-background",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 accent-primary"
                              checked={
                                selecionada
                              }
                              onChange={() =>
                                alternarEmpresa(
                                  empresa.id
                                )
                              }
                              disabled={
                                carregando
                              }
                            />

                            <span>
                              <span className="block font-medium">
                                {empresa.nomeFantasia ??
                                  empresa.razaoSocial}
                              </span>

                              <span className="mt-1 block text-xs text-muted-foreground">
                                {
                                  empresa.razaoSocial
                                }
                                {" · "}
                                {formatarCnpj(
                                  empresa.cnpj
                                )}
                              </span>
                            </span>
                          </label>

                          {selecionada && (
                            <select
                              value={
                                permissao
                              }
                              onChange={(
                                event
                              ) =>
                                alterarPermissao(
                                  empresa.id,
                                  event
                                    .target
                                    .value as PermissaoEmpresa
                                )
                              }
                              className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-56"
                              disabled={
                                carregando ||
                                form.role ===
                                  "ADMIN"
                              }
                            >
                              {form.role ===
                              "ADMIN" ? (
                                <option value="ADMIN">
                                  Administrador
                                </option>
                              ) : (
                                <>
                                  <option value="FATURAMENTO">
                                    Faturamento
                                  </option>

                                  <option value="OPERADOR">
                                    Operador
                                  </option>

                                  <option value="VISUALIZADOR">
                                    Visualizador
                                  </option>
                                </>
                              )}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {erro && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <p>{erro}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() =>
                setAberto(false)
              }
              disabled={carregando}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              className="h-11 sm:min-w-48"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Salvando...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
-- CreateTable
CREATE TABLE "UsuarioEmpresaPrivilegio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioEmpresaId" TEXT NOT NULL,
    "privilegio" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsuarioEmpresaPrivilegio_usuarioEmpresaId_fkey" FOREIGN KEY ("usuarioEmpresaId") REFERENCES "UsuarioEmpresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UsuarioEmpresa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "permissao" TEXT NOT NULL DEFAULT 'PERSONALIZADO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UsuarioEmpresa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UsuarioEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UsuarioEmpresa" ("ativo", "createdAt", "empresaId", "id", "permissao", "updatedAt", "usuarioId") SELECT "ativo", "createdAt", "empresaId", "id", "permissao", "updatedAt", "usuarioId" FROM "UsuarioEmpresa";
DROP TABLE "UsuarioEmpresa";
ALTER TABLE "new_UsuarioEmpresa" RENAME TO "UsuarioEmpresa";
CREATE INDEX "UsuarioEmpresa_usuarioId_idx" ON "UsuarioEmpresa"("usuarioId");
CREATE INDEX "UsuarioEmpresa_empresaId_idx" ON "UsuarioEmpresa"("empresaId");
CREATE UNIQUE INDEX "UsuarioEmpresa_usuarioId_empresaId_key" ON "UsuarioEmpresa"("usuarioId", "empresaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "UsuarioEmpresaPrivilegio_usuarioEmpresaId_idx" ON "UsuarioEmpresaPrivilegio"("usuarioEmpresaId");

-- CreateIndex
CREATE INDEX "UsuarioEmpresaPrivilegio_privilegio_idx" ON "UsuarioEmpresaPrivilegio"("privilegio");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEmpresaPrivilegio_usuarioEmpresaId_privilegio_key" ON "UsuarioEmpresaPrivilegio"("usuarioEmpresaId", "privilegio");

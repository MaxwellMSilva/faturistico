import assert from "node:assert/strict";
import { test } from "node:test";
import { validarDocumentoCliente } from "./validar-documento";

test("aceita documentos válidos, com e sem máscara, incluindo zero inicial", () => {
  for (const cpf of ["52998224725", "529.982.247-25", "01234567890"]) {
    assert.equal(validarDocumentoCliente("FISICA", cpf), null);
  }
  for (const cnpj of ["11222333000181", "11.222.333/0001-81", "04252011000110"]) {
    assert.equal(validarDocumentoCliente("JURIDICA", cnpj), null);
  }
});

test("recusa repetições, tamanho incorreto e erros em ambos os dígitos", () => {
  for (const cpf of ["", "123", "5299822472", "529982247255", "52998224715", "52998224724"]) {
    assert.equal(validarDocumentoCliente("FISICA", cpf), "Informe um CPF válido.");
  }
  for (const cnpj of ["", "123", "1122233300018", "112223330001811", "11222333000171", "11222333000180"]) {
    assert.equal(validarDocumentoCliente("JURIDICA", cnpj), "Informe um CNPJ válido.");
  }
  for (let digito = 0; digito <= 9; digito++) {
    assert.ok(validarDocumentoCliente("FISICA", String(digito).repeat(11)));
    assert.ok(validarDocumentoCliente("JURIDICA", String(digito).repeat(14)));
  }
});

test("recusa documento incompatível com o tipo e caracteres estranhos", () => {
  assert.ok(validarDocumentoCliente("FISICA", "11222333000181"));
  assert.ok(validarDocumentoCliente("JURIDICA", "52998224725"));
  assert.ok(validarDocumentoCliente("OUTRO", "52998224725"));
  assert.ok(validarDocumentoCliente("FISICA", "abc52998224725"));
});

import { describe, it, expect } from "vitest";
import { validatePeso, validateAltura, validateImcForm } from "../validation";

describe("Pruebas de Validacion", () => {
  // Pruebas para validatePeso
  it("valida peso correcto", () => {
    const resultado = validatePeso(70);
    expect(resultado.isValid).toBe(true);
  });

  it("valida peso como string", () => {
    const resultado = validatePeso("65.5");
    expect(resultado.isValid).toBe(true);
  });

  it("rechaza peso vacio", () => {
    const resultado = validatePeso("");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("El peso es requerido");
  });

  it("rechaza peso con letras", () => {
    const resultado = validatePeso("abc");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("El peso debe ser un número válido");
  });

  it("rechaza peso negativo", () => {
    const resultado = validatePeso(-10);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("El peso debe ser mayor a 0");
  });

  it("rechaza peso muy alto", () => {
    const resultado = validatePeso(501);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("El peso no puede ser mayor a 500 kg");
  });

  // Pruebas para validateAltura
  it("valida altura correcta", () => {
    const resultado = validateAltura(1.75);
    expect(resultado.isValid).toBe(true);
  });

  it("valida altura como string", () => {
    const resultado = validateAltura("1.80");
    expect(resultado.isValid).toBe(true);
  });

  it("rechaza altura vacia", () => {
    const resultado = validateAltura("");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("La altura es requerida");
  });

  it("rechaza altura con letras", () => {
    const resultado = validateAltura("abc");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("La altura debe ser un número válido");
  });

  it("rechaza altura negativa", () => {
    const resultado = validateAltura(-1.75);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("La altura debe ser mayor a 0");
  });

  it("rechaza altura muy alta", () => {
    const resultado = validateAltura(3.5);
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("La altura no puede ser mayor a 3 metros");
  });

  // Pruebas para validateImcForm
  it("valida formulario completo correcto", () => {
    const resultado = validateImcForm("1.75", "70");
    expect(resultado.isValid).toBe(true);
  });

  it("rechaza formulario con altura vacia", () => {
    const resultado = validateImcForm("", "70");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("La altura es requerida");
  });

  it("rechaza formulario con peso vacio", () => {
    const resultado = validateImcForm("1.75", "");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("El peso es requerido");
  });

  it("rechaza formulario con altura invalida", () => {
    const resultado = validateImcForm("abc", "70");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("La altura debe ser un número válido");
  });

  it("rechaza formulario con peso invalido", () => {
    const resultado = validateImcForm("1.75", "xyz");
    expect(resultado.isValid).toBe(false);
    expect(resultado.error).toBe("El peso debe ser un número válido");
  });

  // Casos limite
  it("acepta peso minimo valido", () => {
    const resultado = validatePeso(0.1);
    expect(resultado.isValid).toBe(true);
  });

  it("acepta peso maximo valido", () => {
    const resultado = validatePeso(500);
    expect(resultado.isValid).toBe(true);
  });

  it("acepta altura minima valida", () => {
    const resultado = validateAltura(0.1);
    expect(resultado.isValid).toBe(true);
  });

  it("acepta altura maxima valida", () => {
    const resultado = validateAltura(3.0);
    expect(resultado.isValid).toBe(true);
  });

  it("rechaza peso muy pequeno", () => {
    const resultado = validatePeso(0.05);
    expect(resultado.isValid).toBe(false);
  });

  it("rechaza altura muy pequena", () => {
    const resultado = validateAltura(0.05);
    expect(resultado.isValid).toBe(false);
  });
});

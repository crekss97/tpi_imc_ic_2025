// src/test-setup.ts
import { expect, afterEach, beforeEach, vi, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extender las expectativas de Vitest con jest-dom matchers
expect.extend(matchers)
const consoleErrorSpy = vi.spyOn(console, 'error')

// Limpiar después de cada test
beforeAll(() => {
  // Antes de que comiencen todos los tests, reemplazamos la implementacion
  // de console.error con una funcion vacia que no hace nada.
  consoleErrorSpy.mockImplementation(()=>{})
})
afterEach(() => {
  cleanup()
  // Después de cada test, limpiamos el historial de llamadas del espia
  // para que los tests no interfieran entre sí
  consoleErrorSpy.mockClear();
  
})

const originalError = console.error;
beforeEach(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && 
      args[0].includes('Warning: An update to') && 
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  // Después de que todos los tests hayan terminado, restauramos la función
  // original de console.error.
  consoleErrorSpy.mockClear();
})

afterEach(() => {
  console.error = originalError;
});
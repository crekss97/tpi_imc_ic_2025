// src/context/__tests__/AuthContext.test.tsx
// Mock env
vi.stubGlobal("import.meta", {
  env: { VITE_VERCEL_URL: "http://localhost:3000/api" },
});

import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import { ReactNode } from "react";

// Mock de axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}));
const mockedAxios = axios as any;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

// Suprimir console.logs en tests
const originalLog = console.log;
const originalError = console.error;
beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
});
afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear();
  });

  it("empieza sin usuario logueado", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("login exitoso guarda token y user", async () => {
    const fakeUser = { id: 1, nombre: "Juan", apellido: "Pérez", email: "juan@test.com" };

    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token-123", user: fakeUser },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success: boolean;
    await act(async () => {
      success = await result.current.login("juan@test.com", "123456");
    });

    expect(success!).toBe(true);
    expect(result.current.token).toBe("token-123");
    expect(result.current.user).toEqual(fakeUser);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("token", "token-123");
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify(fakeUser));
    expect(axios.defaults.headers.common["Authorization"]).toBe("Bearer token-123");
  });

  it("login falla con credenciales inválidas", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Unauthorized"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let success: boolean;
    await act(async () => {
      success = await result.current.login("malo@test.com", "mala");
    });

    expect(success!).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("register crea usuario y luego hace login automático", async () => {
    const fakeUser = {
      id: 2,
      nombre: "Maria",
      apellido: "García",
      email: "maria@test.com",
    };

    // Mock del post para crear usuario y luego login
    mockedAxios.post
      .mockResolvedValueOnce({ data: { message: "Usuario creado" } }) // registro
      .mockResolvedValueOnce({ data: { access_token: "token-maria-456", user: fakeUser } }); // login automático

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register("Maria", "García", "maria@test.com", "123456");
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(fakeUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Verificar llamadas en orden
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/users",
      {
        name: "Maria",
        surname: "García",
        email: "maria@test.com",
        password: "123456",
      }
    );

    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/auth/login",
      {
        email: "maria@test.com",
        password: "123456",
      }
    );
  });

  it("logout limpia datos", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Simular login previo
    const fakeUser = {
      id: 3,
      nombre: "Pedro",
      apellido: "López",
      email: "pedro@test.com",
    };
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "token-test", user: fakeUser },
    });

    await act(async () => {
      await result.current.login("pedro@test.com", "123456");
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user");
  });

  it("recupera sesión válida desde localStorage", async () => {
    const fakeUser = { id: 4, nombre: "Ana", apellido: "Ruiz", email: "ana@test.com" };
    mockLocalStorage.getItem
      .mockReturnValueOnce("token-ana")
      .mockReturnValueOnce(JSON.stringify(fakeUser));

    mockedAxios.get.mockResolvedValueOnce({ data: fakeUser }); // getUserById

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(fakeUser);
      expect(result.current.token).toBe("token-ana");
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it("si token guardado no es válido, hace logout", async () => {
    const fakeUser = { id: 5, nombre: "Carlos", apellido: "Díaz", email: "carlos@test.com" };
    mockLocalStorage.getItem
      .mockReturnValueOnce("token-malo")
      .mockReturnValueOnce(JSON.stringify(fakeUser));

    mockedAxios.get.mockRejectedValueOnce(new Error("Token inválido"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("token");
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("user");
    });
  });

  it("maneja loading en login", async () => {
    let resolver: (val: any) => void;
    const promise = new Promise((resolve) => {
      resolver = resolve;
    });
    mockedAxios.post.mockReturnValueOnce(promise);

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login("test@test.com", "123456");
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolver!({
        data: {
          access_token: "token-x",
          user: { id: 6, nombre: "Test", apellido: "User", email: "test@test.com" },
        },
      });
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });
});

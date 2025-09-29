// src/components/__tests__/Login.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Login from "../../components/Login";

// Mock del useAuth
const mockLogin = vi.fn();
const mockAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: mockLogin,
  register: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const renderLogin = (onSwitchToRegister = vi.fn()) => {
  return render(<Login onSwitchToRegister={onSwitchToRegister} />);
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.loading = false;
  });

  it("renderiza formulario de login correctamente", () => {
    renderLogin();

    // Usamos roles en lugar de getByText ambiguo
    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /regístrate aquí/i })
    ).toBeInTheDocument();
  });

  it("valida campos vacíos", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/completa todos los campos/i)
      ).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("valida formato de email inválido", async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "email-invalido" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/ingresa un email válido/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("llama a login con credenciales válidas", async () => {
    mockLogin.mockResolvedValueOnce(true);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "123456");
    });
  });

  it("muestra error cuando login falla", async () => {
    mockLogin.mockResolvedValueOnce(false);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "wrong-password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/email o contraseña incorrectos/i)
      ).toBeInTheDocument();
    });
  });

  it("muestra estado de carga durante login", () => {
    mockAuthContext.loading = true;
    renderLogin();

    expect(
      screen.getByRole("button", { name: /iniciando sesión/i })
    ).toBeDisabled();

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();

    // Mensaje visible
    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
  });

  it("navega a registro cuando se hace click en el enlace", () => {
    const mockSwitch = vi.fn();
    renderLogin(mockSwitch);

    fireEvent.click(screen.getByRole("button", { name: /regístrate aquí/i }));

    expect(mockSwitch).toHaveBeenCalled();
  });

  it("maneja error de conexión", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Network Error"));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
    });
  });

  it("campos son accesibles por teclado", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    // Foco inicial
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);

    // Tab simulado de forma real
    await user.tab();
    expect(document.activeElement).toBe(passwordInput);

    // Completar credenciales
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "123456");

    // Simular Enter en password (submit del form)
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "123456");
    });
  });
});

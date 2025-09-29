import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import Register from "../../components/Register";
import * as AuthContext from "../../context/AuthContext";

// Mock del módulo
vi.mock("../../context/AuthContext");

describe("Register Component", () => {
  const mockRegister = vi.fn();
  const mockSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // obtenemos el mock de useAuth del módulo importado
    (AuthContext.useAuth as Mock).mockReturnValue({
      register: mockRegister,
      loading: false,
    });
  });

  const fillForm = ({
    nombre = "Juan",
    apellido = "Pérez",
    email = "juan@example.com",
    password = "123456",
    confirmPassword = "123456",
  } = {}) => {
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: nombre },
    });
    fireEvent.change(screen.getByLabelText(/apellido/i), {
      target: { value: apellido },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: email },
    });
    // ⚡ Contraseña -> tomamos el primer "Contraseña"
    fireEvent.change(screen.getAllByLabelText(/contraseña/i)[0], {
      target: { value: password },
    });
    // Confirmar contraseña
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), {
      target: { value: confirmPassword },
    });
  };

  it("debería renderizar el formulario correctamente", () => {
    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    expect(
      screen.getByRole("heading", { name: /crear cuenta/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /crear cuenta/i })
    ).toBeInTheDocument();
  });

  it("muestra error si el nombre está vacío", async () => {
    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    fillForm({ nombre: "" });
    fireEvent.submit(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(
      await screen.findByText(/el nombre es requerido/i)
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("muestra error si el email no es válido", async () => {
    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    fillForm({ email: "juan@@com" });
    fireEvent.submit(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(
      await screen.findByText(/el email no tiene un formato válido/i)
    ).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
  render(<Register onSwitchToLogin={mockSwitchToLogin} />);

  fillForm({ password: "123456", confirmPassword: "654321" });
  fireEvent.submit(screen.getByRole("button", { name: /crear cuenta/i }));

  await waitFor(() => {
    // Usamos getAllByText, que devuelve un array con todos los elementos encontrados
    const errorMessages = screen.getAllByText(/las contraseñas no coinciden/i);

    // Verificamos que el array no esté vacío, lo que confirma que el mensaje aparece
    expect(errorMessages.length).toBeGreaterThan(0);

    // Opcionalmente, puedes verificar que uno de los elementos esté en el documento
    expect(errorMessages[0]).toBeInTheDocument();
  });
});

  it("llama a register con los datos correctos si el formulario es válido", async () => {
    mockRegister.mockResolvedValue(true);

    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "Juan",
        "Pérez",
        "juan@example.com",
        "123456"
      );
    });
  });

  it("muestra alerta de error si register devuelve false", async () => {
    mockRegister.mockResolvedValue(false);

    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(
      await screen.findByText(/el email podría estar ya registrado/i)
    ).toBeInTheDocument();
  });

  it("muestra alerta de error si ocurre una excepción en register", async () => {
    mockRegister.mockRejectedValue(new Error("network error"));

    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    fillForm();
    fireEvent.submit(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/error de conexión/i)).toBeInTheDocument();
  });

  it("ejecuta onSwitchToLogin al hacer click en 'Inicia sesión aquí'", () => {
    render(<Register onSwitchToLogin={mockSwitchToLogin} />);
    fireEvent.click(screen.getByText(/inicia sesión aquí/i));
    expect(mockSwitchToLogin).toHaveBeenCalled();
  });
});

// src/utils/test/ImcDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import ImcDashboard from '../../ImcDashboard';
import { AuthContextType } from '../../context/AuthContext';

// -----------------------------
// Mock global ResizeObserver
// -----------------------------
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserver;

// -----------------------------
// Mocks de Axios
// -----------------------------
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn(),
  }
}));

const mockedAxios = axios as any;

// -----------------------------
// Mock AuthContext
// -----------------------------
const mockLogout = vi.fn();

const mockAuthContext: AuthContextType = {
  user: { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com' },
  token: 'test-token-123',
  isAuthenticated: true,
  login: vi.fn(),
  register: vi.fn(),
  logout: mockLogout,
  loading: false
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// -----------------------------
// Datos de prueba
// -----------------------------
const mockCalculosIMC = [
  { id: 1, altura: 1.75, peso: 70, imc: 22.86, categoria: 'Normal', createdAt: '2024-09-01T10:00:00.000Z' },
  { id: 2, altura: 1.75, peso: 85, imc: 27.76, categoria: 'Sobrepeso', createdAt: '2024-09-15T10:00:00.000Z' },
  { id: 3, altura: 1.75, peso: 75, imc: 24.49, categoria: 'Normal', createdAt: '2024-09-20T10:00:00.000Z' }
];

// -----------------------------
// Tests
// -----------------------------
describe('ImcDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.token = 'test-token-123'; // Reiniciar token
    mockedAxios.get.mockReset();               // Limpiar llamadas previas
    mockedAxios.isAxiosError.mockReturnValue(false);
  });

  it('CP-DASH-01 - carga y muestra datos correctamente', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockCalculosIMC });

    render(<ImcDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Promedio de IMC')).toBeInTheDocument();
      expect(screen.getByText('25.04')).toBeInTheDocument();
      expect(screen.getByText('Variación del IMC')).toBeInTheDocument();
      expect(screen.getByText('Distribución por Categoría')).toBeInTheDocument();
    });
  });

  it('CP-DASH-02 - muestra mensaje cuando no hay cálculos', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(<ImcDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No hay cálculos')).toBeInTheDocument();
    });

    expect(screen.queryByText(/\d+\.\d+/)).not.toBeInTheDocument();
  });

  it('CP-DASH-03 - muestra error sin token', async () => {
    mockAuthContext.token = null;

    render(<ImcDashboard />);

    await waitFor(() => {
      expect(screen.getByText((content) =>
        content.includes('No tienes autorización')
      )).toBeInTheDocument();
    });

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('CP-DASH-04 - maneja token expirado con logout', async () => {
    mockedAxios.isAxiosError.mockReturnValue(true);
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

    render(<ImcDashboard />);

    await waitFor(() => {
      expect(screen.getByText((content) =>
        content.includes('Tu sesión ha expirado')
      )).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('CP-DASH-05 - calcula promedio IMC correctamente', async () => {
    const datosTest = [
      { id: 1, altura: 1.75, peso: 70, imc: 20.0, categoria: 'Normal', createdAt: '2024-09-01' },
      { id: 2, altura: 1.75, peso: 80, imc: 30.0, categoria: 'Sobrepeso', createdAt: '2024-09-02' },
      { id: 3, altura: 1.75, peso: 75, imc: 25.0, categoria: 'Normal', createdAt: '2024-09-03' }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: datosTest });

    render(<ImcDashboard />);

    await waitFor(() => {
      expect(screen.getByText('25.00')).toBeInTheDocument();
    });
  });

  // Reemplaza tu test 'CP-DASH-06' con estos tres:

it('CP-DASH-06.1 - maneja errores de red (Network Error)', async () => {
    // Simula un error de red
    const networkError = { isAxiosError: true, message: 'Network Error', config: {}, response: undefined };
    mockedAxios.get.mockRejectedValueOnce(networkError);
    mockedAxios.isAxiosError.mockReturnValue(true);

    render(<ImcDashboard />);

    // Espera a que aparezca el mensaje de error de conexión
    await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Error de conexión'))).toBeInTheDocument();
    });
});

it('CP-DASH-06.2 - maneja errores de autorización (403)', async () => {
    // Simula un error 403 (Forbidden)
    const error403 = { isAxiosError: true, response: { status: 403 } };
    mockedAxios.get.mockRejectedValueOnce(error403);
    mockedAxios.isAxiosError.mockReturnValue(true);

    render(<ImcDashboard />);

    // Espera a que aparezca el mensaje de permisos
    await waitFor(() => {
        expect(screen.getByText((content) => content.includes('No tienes permisos'))).toBeInTheDocument();
    });
});

it('CP-DASH-06.3 - maneja errores del servidor (500)', async () => {
    // Simula un error 500 (Internal Server Error)
    const error500 = { isAxiosError: true, response: { status: 500 } };
    mockedAxios.get.mockRejectedValueOnce(error500);
    mockedAxios.isAxiosError.mockReturnValue(true);

    render(<ImcDashboard />);

    // Espera a que aparezca el mensaje de error genérico
    await waitFor(() => {
        expect(screen.getByText((content) => content.includes('Error al cargar el historial'))).toBeInTheDocument();
    });
});

  it('CP-DASH-07 - muestra loading durante carga', async () => {
    let resolver: (value: any) => void;
    const promise = new Promise((resolve) => { resolver = resolve; });
    mockedAxios.get.mockReturnValueOnce(promise);

    render(<ImcDashboard />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    resolver!({ data: mockCalculosIMC });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});

import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import {
  validateImcForm,
  validatePeso,
  validateAltura,
} from "./utils/validation";
import { useAuth } from "./context/AuthContext";

interface ImcResult {
  imc: number;
  categoria: string;
}

interface FormErrors {
  altura?: string;
  peso?: string;
}

interface ImcFormProps {
  onCalculoRealizado?: () => void;
}

export default function ImcForm({ onCalculoRealizado }: ImcFormProps) {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [calculando, setCalculando] = useState(false);

  const { user, token, logout } = useAuth();

  // Validación en tiempo real para altura
  const handleAlturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAltura(value);

    if (value) {
      const validation = validateAltura(value);
      setFormErrors((prev) => ({
        ...prev,
        altura: validation.isValid ? undefined : validation.error,
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        altura: undefined,
      }));
    }
  };

  // Validación en tiempo real para peso
  const handlePesoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPeso(value);

    if (value) {
      const validation = validatePeso(value);
      setFormErrors((prev) => ({
        ...prev,
        peso: validation.isValid ? undefined : validation.error,
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        peso: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setResultado(null);
    setCalculando(true);

    // Validaciones
    const validation = validateImcForm(altura, peso);
    if (!validation.isValid) {
      setError(
        validation.error || "Por favor, corrige los errores del formulario"
      );
      setCalculando(false);
      return;
    }

    const alturaValidation = validateAltura(altura);
    const pesoValidation = validatePeso(peso);

    if (!alturaValidation.isValid || !pesoValidation.isValid) {
      setFormErrors({
        altura: alturaValidation.isValid ? undefined : alturaValidation.error,
        peso: pesoValidation.isValid ? undefined : pesoValidation.error,
      });
      setCalculando(false);
      return;
    }

    if (!token) {
      setError("No tienes autorización. Por favor, inicia sesión nuevamente.");
      setCalculando(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_VERCEL_URL;

      // POST /imc/calcular con JWT token
      const response = await axios.post(
        `${API_URL}/imc/calcular`,
        {
          altura: parseFloat(altura),
          peso: parseFloat(peso),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResultado(response.data);
      setError("");
      setFormErrors({});

      // Notificar al componente padre que se realizó un cálculo
      if (onCalculoRealizado) {
        onCalculoRealizado();
      }
    } catch (err) {
      console.error("Error calculating IMC:", err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError(
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
          );
          setTimeout(() => logout(), 2000);
        } else if (status === 403) {
          setError("No tienes permisos para realizar esta acción.");
        } else if (status !== undefined && status >= 500) {
          setError("Error del servidor. Inténtalo nuevamente.");
        } else if (status !== undefined) {
          setError("Error al calcular el IMC. Verifica los datos ingresados.");
        } else {
          setError("Error de conexión. Verifica tu conexión a internet.");
        }
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
      }

      setResultado(null);
    } finally {
      setCalculando(false);
    }
  };

  const hasErrors = Object.values(formErrors).some(
    (error) => error !== undefined
  );

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
      {/* Header con usuario */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" gutterBottom>
            Nueva Medición
          </Typography>
          {user && (
            <Chip
              label={`${user.nombre} ${user.apellido}`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Button
          startIcon={<LogoutOutlined />}
          onClick={logout}
          color="inherit"
          size="small"
        >
          Salir
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Altura (m)"
          type="number"
          value={altura}
          onChange={handleAlturaChange}
          error={!!formErrors.altura}
          helperText={
            formErrors.altura || "Ingresa tu altura en metros (ej: 1.75)"
          }
          inputProps={{
            min: "0.1",
            max: "3.0",
            step: "0.01",
          }}
          fullWidth
          margin="normal"
          required
          disabled={calculando}
        />

        <TextField
          label="Peso (kg)"
          type="number"
          value={peso}
          onChange={handlePesoChange}
          error={!!formErrors.peso}
          helperText={formErrors.peso || "Ingresa tu peso en kilogramos"}
          inputProps={{
            min: "0.1",
            max: "500",
            step: "0.1",
          }}
          fullWidth
          margin="normal"
          required
          disabled={calculando}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={hasErrors || !altura || !peso || calculando}
          sx={{ mt: 2, borderRadius: 2, py: 1.5 }}
        >
          {calculando ? "Calculando..." : "Calcular IMC"}
        </Button>
      </Box>

      {/* Resultado */}
      {resultado && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success">
            <Typography variant="h6">
              IMC: {resultado.imc.toFixed(2)}
            </Typography>
            <Typography>Categoría: {resultado.categoria}</Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
              ✅ Guardado en el historial
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
    </Paper>
  );
}

import SplitText from "./components/SplitText";
import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import {
  validateImcForm,
  validatePeso,
  validateAltura,
} from "./utils/validation";

interface ImcResult {
  imc: number;
  categoria: string;
}

interface FormErrors {
  altura?: string;
  peso?: string;
}

export default function ImcForm() {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

    // Limpiar errores previos
    setError("");
    setResultado(null);

    // Validar el formulario completo
    const validation = validateImcForm(altura, peso);

    if (!validation.isValid) {
      setError(
        validation.error || "Por favor, corrige los errores del formulario"
      );
      return;
    }

    // Validaciones específicas de cada campo
    const alturaValidation = validateAltura(altura);
    const pesoValidation = validatePeso(peso);

    if (!alturaValidation.isValid || !pesoValidation.isValid) {
      setFormErrors({
        altura: alturaValidation.isValid ? undefined : alturaValidation.error,
        peso: pesoValidation.isValid ? undefined : pesoValidation.error,
      });
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_VERCEL_URL;
      const response = await axios.post(`${API_URL}/imc/calcular`, {
        altura: parseFloat(altura),
        peso: parseFloat(peso),
      });

      setResultado(response.data);
      setError("");
      setFormErrors({});
    } catch (err) {
      console.error("Error calculating IMC:", err);
      setError(
        "Error al calcular el IMC. Verifica si el backend está funcionando correctamente."
      );
      setResultado(null);
    }
  };

  // Verificar si hay errores en el formulario
  const hasErrors = Object.values(formErrors).some(
    (error) => error !== undefined
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        mt: 5,
      }}
    >
      <Box
        sx={{
          fontSize: "3rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "black",
        }}
      >
        <SplitText
          text="¡Hola Bienvenido!"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
        />
      </Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Calculadora de IMC
        </Typography>

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
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={hasErrors || !altura || !peso}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Calcular IMC
          </Button>
        </Box>

        {resultado && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">
              <Typography variant="h6">
                IMC: {resultado.imc.toFixed(2)}
              </Typography>
              <Typography>Categoría: {resultado.categoria}</Typography>
            </Alert>
          </Box>
        )}

        {error && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

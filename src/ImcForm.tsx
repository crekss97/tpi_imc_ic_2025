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

interface ImcResult {
  imc: number;
  categoria: string;
}

export default function ImcForm() {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const alturaNum = parseFloat(altura);
    const pesoNum = parseFloat(peso);
    const API_URL = import.meta.env.VITE_VERCEL_URL;


    if (isNaN(alturaNum) || isNaN(pesoNum) || alturaNum <= 0 || pesoNum <= 0) {
      setError("Por favor, ingresa valores válidos (positivos y numéricos).");
      setResultado(null);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/imc/calcular`, {
        altura: alturaNum,
        peso: pesoNum,
      });
      setResultado(response.data);
      setError("");
    } catch (err) {
      setError(
        "Error al calcular el IMC. Verifica si el backend está corriendo."
      );
      setResultado(null);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
        mt: 5,
      }}
    >
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: 400 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Calculadora de IMC
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Altura (m)"
            type="number"
            value={altura}
            onChange={(e) => setAltura(e.target.value)}
            inputProps={{ min: "0.1", step: "0.01" }}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Peso (kg)"
            type="number"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            inputProps={{ min: "1" }}
            fullWidth
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, borderRadius: 2 }}
          >
            Calcular
          </Button>
        </Box>

        {resultado && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">
              <Typography>IMC: {resultado.imc.toFixed(2)}</Typography>
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

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import axios from "axios";

// ---- MOCK ----
const datosMock = [
  {
    id: 1,
    peso: 70,
    altura: 1.75,
    imc: 22.86,
    categoria: "Normal",
    fecha: new Date().toISOString(),
  },
  {
    id: 2,
    peso: 85,
    altura: 1.7,
    imc: 29.41,
    categoria: "Sobrepeso",
    fecha: new Date().toISOString(),
  },
  {
    id: 3,
    peso: 48,
    altura: 1.7,
    imc: 16.62,
    categoria: "Bajo peso",
    fecha: new Date().toISOString(),
  },
  {
    id: 4,
    peso: 95,
    altura: 1.6,
    imc: 37.11,
    categoria: "Obesidad",
    fecha: new Date().toISOString(),
  },
];

// ---- SWITCH ENTRE MOCK Y BACK ----
const USE_MOCK = true; // ⬅️ cambia a false si querés probar con el back

interface CalculoIMC {
  id: number;
  peso: number;
  altura: number;
  imc: number;
  categoria: string;
  fecha: string;
}

interface HistorialProps {
  shouldRefresh?: number;
}

export default function Historial({ shouldRefresh }: HistorialProps) {
  const [historial, setHistorial] = useState<CalculoIMC[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //const API_URL = import.meta.env.VITE_VERCEL_URL;el
  const API_URL = "http://localhost:3000"; // 👈 usa el back si está levantado

  // Cargar historial
  const cargarHistorial = async () => {
    if (USE_MOCK) {
      setHistorial(datosMock);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/imc/historial`);
      setHistorial(response.data);
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  // Monta y actualiza cuando cambia shouldRefresh
  useEffect(() => {
    cargarHistorial();
  }, [shouldRefresh]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getColorCategoria = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case "bajo peso":
        return "info";
      case "normal":
        return "success";
      case "sobrepeso":
        return "warning";
      case "obesidad":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h5">Historial ({historial.length})</Typography>
        <IconButton
          onClick={cargarHistorial}
          disabled={loading}
          color="primary"
          size="small"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {historial.length === 0 ? (
            <Alert severity="info">
              No hay cálculos registrados. ¡Realiza tu primera medición!
            </Alert>
          ) : (
            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {historial.map((calculo, index) => (
                <Box key={calculo.id}>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="body1" component="span">
                            <strong>IMC: {calculo.imc.toFixed(2)}</strong>
                          </Typography>
                          <Chip
                            label={calculo.categoria}
                            color={getColorCategoria(calculo.categoria) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {calculo.peso} kg • {calculo.altura} m
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatearFecha(calculo.fecha)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < historial.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </>
      )}
    </Paper>
  );
}

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
import { useAuth } from "./context/AuthContext";

interface CalculoIMC {
  id: number;
  altura: number;
  peso: number;
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

  const { token, logout } = useAuth();
  const API_URL = import.meta.env.VITE_VERCEL_URL;

  // Cargar historial
  const cargarHistorial = async () => {
    if (!token) {
      setError("No tienes autorización para ver el historial");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // GET /imc/historial (Traer todo el historial)
      const response = await axios.get(`${API_URL}/imc`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Transformar el array del backend a lo que espera el frontend
      const data: CalculoIMC[] = (
        Array.isArray(response.data) ? response.data : []
      ).map((item) => ({
        id: item.id,
        altura: item.altura,
        peso: item.peso,
        imc: item.imc,
        categoria: item.categoria,
        fecha: item.createdAt, // <- aquí renombramos createdAt a fecha
      }));

      setHistorial(data);
    } catch (err) {
      console.error("Error cargando historial:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Tu sesión ha expirado");
          setTimeout(() => logout(), 2000);
        } else if (err.response?.status === 403) {
          setError("No tienes permisos para ver el historial");
        } else {
          setError("Error al cargar el historial");
        }
      } else {
        setError("Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambie shouldRefresh
  useEffect(() => {
    if (token) {
      cargarHistorial();
    }
  }, [shouldRefresh, token]);

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
        <Typography variant="h5">Mi Historial ({historial.length})</Typography>
        <IconButton
          onClick={cargarHistorial}
          disabled={loading || !token}
          color="primary"
          size="small"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Cargando tu historial...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lista */}
      {!loading && !error && (
        <>
          {historial.length === 0 ? (
            <Alert severity="info">
              No tienes cálculos registrados. ¡Realiza tu primera medición!
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

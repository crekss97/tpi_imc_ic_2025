import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";

interface CalculoIMC {
  id: number;
  altura: number;
  peso: number;
  imc: number;
  categoria: string;
  fecha: string;
}

export default function ImcDashboard() {
  const [grafico, setGrafico] = useState<CalculoIMC[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { token, logout } = useAuth();

  const API_URL = import.meta.env.VITE_VERCEL_URL;

  const cargarGrafico = async () => {
    if (!token) {
      setError("No tienes autorización para ver el historial");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/imc`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: CalculoIMC[] = (
        Array.isArray(response.data) ? response.data : []
      ).map((item) => ({
        id: item.id,
        altura: item.altura,
        peso: item.peso,
        imc: item.imc,
        categoria: item.categoria,
        fecha: new Date(item.createdAt).toLocaleDateString("es-AR"),
      }));

      setGrafico(data);
    } catch (err) {
      console.error("Error cargando historial:", err);

      if (axios.isAxiosError(err)) {
        // Primero, revisa si hay una RESPUESTA del servidor
        if (err.response) {
          // AHORA sí, maneja los errores según el status code
          if (err.response.status === 401) {
            setError("Tu sesión ha expirado");
            setTimeout(() => logout(), 2000);
          } else if (err.response.status === 403) {
            setError("No tienes permisos para ver el historial");
          } else {
            // Para cualquier otro error con respuesta (500, 404, etc.)
            setError("Error al cargar el historial");
          }
        } else {
          // Si es un AxiosError pero NO HAY RESPUESTA, es un error de red
          setError("Error de conexión");
        }
      } else {
        // Si no es un error de Axios, es un error inesperado (ej. en el .map())
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGrafico();
  }, []);

  // --- Cálculos para el dashboard ---
  const promedioIMC =
    grafico.length > 0
      ? (
          grafico.reduce((acc, item) => acc + item.imc, 0) / grafico.length
        ).toFixed(2)
      : null;

  // Conteo de categorías
  const conteoCategorias = grafico.reduce(
    (acc: Record<string, number>, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    },
    {}
  );

  const dataCategorias = Object.keys(conteoCategorias).map((cat) => ({
    name: cat,
    value: conteoCategorias[cat],
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" textAlign="center" mb={2}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <Box display="flex" flexDirection="column" gap={4}>
          {/* Promedio IMC */}
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Promedio de IMC
              </Typography>
              {promedioIMC ? (
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {promedioIMC}
                </Typography>
              ) : (
                <Typography>No hay cálculos</Typography>
              )}
            </CardContent>
          </Card>

          {/* Variación de IMC */}
          <Card sx={{ height: 350 }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" align="center" gutterBottom>
                Variación del IMC
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart
                  data={grafico}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="imc"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="IMC"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conteo por categoría */}
          <Card sx={{ height: 500 }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" align="center" gutterBottom>
                Distribución por Categoría
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={dataCategorias}
                    cx="50%"
                    cy="45%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry: any) => {
                      const name = entry?.name ?? "";
                      const percent =
                        typeof entry?.percent === "number"
                          ? Math.round(entry.percent * 100)
                          : 0;
                      return `${name} ${percent}%`;
                    }}
                    labelLine={false}
                  >
                    {dataCategorias.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

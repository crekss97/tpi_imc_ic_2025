import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

interface ImcData {
  fecha: string;
  imc: number;
  peso: number;
}

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

  useEffect(() => {
    cargarGrafico();
  }, []);

  return (
    <div style={{ width: "100%", height: 400 }}>
      {loading && <p>Cargando datos...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height="100%">
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
            <Line type="monotone" dataKey="peso" stroke="#82ca9d" name="Peso (kg)" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

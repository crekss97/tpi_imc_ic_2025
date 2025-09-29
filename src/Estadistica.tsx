import { useState, useEffect } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useAuth } from "../src/context/AuthContext";

type EstadisticaProps = {
  refreshInterval?: number; // en milisegundos
};

export default function Estadistica({}: EstadisticaProps) {
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prev) => prev + 1); // fuerza re-render del iframe
    },);

    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="warning">
          Debes estar logueado para ver las estadísticas.
        </Alert>
      </Box>
    );
  }

  // URL base de tu pregunta pública de Metabase
  // CAMBIAR esta URL por la URL pública de tu pregunta específica
  const METABASE_BASE_URL = "http://localhost:3000/public/dashboard/dd228009-a1cc-43fe-8807-c2690b975e6e";
  
  // URL con filtro de usuario
  const embedUrl = `${METABASE_BASE_URL}?user_id=${user.id}`;

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Estadísticas de {user.nombre} {user.apellido}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Visualización de tu evolución de IMC y estadísticas personales
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2 }}>Cargando estadísticas...</Typography>
        </Box>
      )}

      <Box sx={{ 
        position: "relative", 
        paddingTop: "56.25%",
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        <iframe
          key={key}
          src={embedUrl}
          title={`Estadísticas IMC de ${user.nombre}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "0",
          }}
          allowTransparency
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </Box>
    </Box>
  );
}
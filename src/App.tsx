import { useState } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
} from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthContainer from "./components/AuthContainer";
import ImcForm from "./ImcForm";
import Historial from "./Historial";
import ImcDashboard from "./ImcDashboard";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function AppContent() {
  const [refreshHistorial, setRefreshHistorial] = useState(0);
  const { isAuthenticated } = useAuth();

  const handleCalculoRealizado = () => {
    setRefreshHistorial((prev) => prev + 1);
  };

  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
        {/* Título */}
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Calculadora de IMC
        </Typography>

        {/* Contenedor principal */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Fila con formulario + historial (solo en desktop en fila) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Formulario */}
            <Box sx={{ flex: "0 0 auto", width: { xs: "100%", md: "400px" } }}>
              <ImcForm onCalculoRealizado={handleCalculoRealizado} />
            </Box>

            {/* Historial */}
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <Historial shouldRefresh={refreshHistorial} />
            </Box>
          </Box>

          {/* Dashboard siempre debajo */}
          <Box sx={{ flex: 1, minWidth: 0, bgcolor: "grey.50"}}>
              <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ mb: 4 }}
              >
                Estadisticas
              </Typography>
            <ImcDashboard />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

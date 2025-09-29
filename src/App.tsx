import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthContainer from './components/AuthContainer';
import ImcForm from './ImcForm';
import Historial from './Historial';
import ImcDashboard from './ImcDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AppContent() {
  const [refreshHistorial, setRefreshHistorial] = useState(0);
  const { isAuthenticated } = useAuth();

  // Función para actualizar el historial cuando se hace un cálculo
  const handleCalculoRealizado = () => {
    setRefreshHistorial(prev => prev + 1);
  };

  // Si no está autenticado, mostrar pantalla de login/registro
  if (!isAuthenticated) {
    return <AuthContainer />;
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        
        {/* Título principal */}
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Calculadora de IMC
        </Typography>

        {/* Layout responsive con flexbox */}
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start'
        }}>
          
          {/* Columna izquierda: Formulario */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '400px' } }}>
            <ImcForm onCalculoRealizado={handleCalculoRealizado} />
          </Box>

          {/* Columna derecha: Historial */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Historial shouldRefresh={refreshHistorial} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
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
import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography } from '@mui/material';
import ImcForm from './ImcForm';
import Historial from './Historial';

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

function App() {
  const [refreshHistorial, setRefreshHistorial] = useState(0);

  // Función para actualizar el historial cuando se hace un cálculo
  const handleCalculoRealizado = () => {
    setRefreshHistorial(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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

          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Login from './Login';
import Register from './Register';

export default function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'grey.50',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 3
    }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
        Calculadora de IMC
      </Typography>

      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </Box>
  );
}
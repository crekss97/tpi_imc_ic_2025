import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Link,
  CircularProgress,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor, ingresa un email válido');
      return;
    }

    try {
      const success = await login(email, password);
      
      if (!success) {
        setError('Email o contraseña incorrectos. Verifica tus credenciales.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu conexión a internet.');
    }
  };

  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: 3, maxWidth: 400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
        <LoginIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h1">
          Iniciar Sesión
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          autoComplete="email"
          error={error.includes('email')}
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 3, mb: 2, py: 1.5 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            ¿No tienes cuenta?{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              sx={{ cursor: 'pointer' }}
              disabled={loading}
            >
              Regístrate aquí
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
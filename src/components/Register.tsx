import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Link,
  CircularProgress,
} from "@mui/material";
import { PersonAdd as RegisterIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const { register, loading } = useAuth();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!nombre.trim()) {
      errors.nombre = "El nombre es requerido";
    } else if (nombre.trim().length < 2) {
      errors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    if (!apellido.trim()) {
      errors.apellido = "El apellido es requerido";
    } else if (apellido.trim().length < 2) {
      errors.apellido = "El apellido debe tener al menos 2 caracteres";
    }

    if (!email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "El email no tiene un formato válido";
    }

    if (!password) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      errors.password = "Las contraseñas no coinciden";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const success = await register(
        nombre.trim(),
        apellido.trim(),
        email.trim(),
        password
      );

      if (!success) {
        setError(
          "Error al crear la cuenta. El email podría estar ya registrado."
        );
      }
      // Si success es true, el AuthContext ya manejó el login automático
    } catch (err) {
      setError("Error de conexión. Verifica tu conexión a internet.");
    }
  };

  const handleFieldChange = (field: keyof FormErrors, value: string) => {
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    switch (field) {
      case "nombre":
        setNombre(value);
        break;
      case "apellido":
        setApellido(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{ p: 4, borderRadius: 3, maxWidth: 450, mx: "auto" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          justifyContent: "center",
        }}
      >
        <RegisterIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h5" component="h1">
          Crear Cuenta
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => handleFieldChange("nombre", e.target.value)}
            error={!!formErrors.nombre}
            helperText={formErrors.nombre}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            autoComplete="given-name"
          />

          <TextField
            label="Apellido"
            value={apellido}
            onChange={(e) => handleFieldChange("apellido", e.target.value)}
            error={!!formErrors.apellido}
            helperText={formErrors.apellido}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            autoComplete="family-name"
          />
        </Box>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          error={!!formErrors.email}
          helperText={formErrors.email}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          autoComplete="email"
        />

        <TextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => handleFieldChange("password", e.target.value)}
          error={!!formErrors.password}
          helperText={formErrors.password || "Mínimo 6 caracteres"}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          autoComplete="new-password"
        />

        <TextField
          label="Confirmar Contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={password !== confirmPassword && confirmPassword !== ""}
          helperText={
            password !== confirmPassword && confirmPassword !== ""
              ? "Las contraseñas no coinciden"
              : ""
          }
          fullWidth
          margin="normal"
          required
          disabled={loading}
          autoComplete="new-password"
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
              Registrando...
            </>
          ) : (
            "Crear Cuenta"
          )}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            ¿Ya tienes cuenta?{" "}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              sx={{ cursor: "pointer" }}
            >
              Inicia sesión aquí
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_VERCEL_URL;

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("Respuesta login:", response.data); // debería ser solo el string JWT

      const { access_token, user } = response.data;

      if (!access_token) {
        console.error("No se recibió token en la respuesta");
        return false;
      }

      setToken(access_token);
      setUser(user); //  tu backend no devuelve user todavía

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      return true;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    nombre: string,
    apellido: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // POST /users(Crear usuario)
      await axios.post(`${API_URL}/users`, {
        name: nombre,
        surname: apellido,
        email,
        password,
      });

      // Después de registrarse exitosamente, hacer login automático
      const loginSuccess = await login(email, password);
      return loginSuccess;
    } catch (error) {
      console.error("Error en registro:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Limpiar header de Authorization
    delete axios.defaults.headers.common["Authorization"];
  };

  const getUserById = async (id: number): Promise<User | null> => {
    try {
      // GET /user/{id} (Buscar por Id)
      const response = await axios.get(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      return null;
    }
  };

  // Recuperar sesión al cargar la aplicación
  React.useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser && savedUser !== "undefined") {
        // <-- importante
        try {
          const userData = JSON.parse(savedUser);

          // Configurar axios con el token
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${savedToken}`;

          // Verificar si el token sigue siendo válido
          const currentUser = await getUserById(userData.id);

          if (currentUser) {
            setToken(savedToken);
            setUser(userData);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Error recuperando sesión:", error);
          logout();
        }
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

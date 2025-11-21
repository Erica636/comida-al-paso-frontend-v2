import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay token al iniciar
  useEffect(() => {
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');
    const savedUser = localStorage.getItem('user');

    if (access && refresh && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login con Django JWT
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      const data = await response.json();

      // Guardar tokens
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      // Obtener información del usuario (incluyendo is_staff)
      try {
        const userResponse = await fetch(`${API_URL}/user/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access}`,
            'Content-Type': 'application/json'
          }
        });

        let userData = { username };

        if (userResponse.ok) {
          const userInfo = await userResponse.json();
          userData = {
            username: userInfo.username,
            email: userInfo.email,
            is_staff: userInfo.is_staff
          };
        }

        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);

        return { success: true };
      } catch (err) {
        // Si falla obtener info del usuario, usar datos básicos
        const userData = { username };
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // Register
  const register = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Error al crear la cuenta' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
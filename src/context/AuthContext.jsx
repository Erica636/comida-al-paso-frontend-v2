import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    try {

      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      const userExists = existingUsers.find(
@@ -68,85 +67,64 @@

  const login = async (username, password) => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const localUser = registeredUsers.find(
        user => user.username === username && user.password === password
      );

      if (localUser) {
        const userData = {
          ...localUser,
          token: 'local_token_' + Date.now()
        };

        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      }

      if (username === 'Erica' && password === 'React2025') {
        const userData = {
          id: 1,
          username: 'Erica',
          email: 'erica@example.com',
          firstName: 'Erica',
          lastName: 'Ansaloni',
          token: 'custom_token_' + Date.now(),
          image: 'https://ui-avatars.com/api/?name=Erica+Ansaloni&background=f97316&color=fff'
        };

        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      }

      const response = await fetch('https://dummyjson.com/auth/login', {
      // Intentar login con el backend de Django (Railway)
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          expiresInMins: 30
          password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.accessToken || data.token);
        localStorage.setItem('user', JSON.stringify(data));
        
        // Django JWT devuelve: { access: "token...", refresh: "token..." }
        const userData = {
          username: username,
          email: `${username}@example.com`,
          firstName: username,
          lastName: '',
          token: data.access,
          refreshToken: data.refresh,
          image: `https://ui-avatars.com/api/?name=${username}&background=f97316&color=fff`
        };

        localStorage.setItem('token', data.access);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(data);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Credenciales inválidas' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
      console.error('Error de login:', error);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

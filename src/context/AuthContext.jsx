import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

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

  // --------------------------------------------------
  //   AL INICIAR: VERIFICA SI HAY TOKEN EN LOCALSTORAGE
  // --------------------------------------------------
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

  // --------------------------------------------------
  //                 LOGIN CON DJANGO
  // --------------------------------------------------
  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      const data = await response.json(); // { access, refresh }

      // Guardar tokens reales
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);

      // Guardar usuario (de forma simple)
      const userData = { username };
      localStorage.setItem('user', JSON.stringify(userData));

      setIsAuthenticated(true);
      setUser(userData);

      return { success: true };

    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  // --------------------------------------------------
  //                 LOGOUT
  // --------------------------------------------------
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
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

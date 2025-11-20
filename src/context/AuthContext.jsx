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
        user => user.username === userData.username || user.email === userData.email
      );

      if (userExists) {
        return {
          success: false,
          error: 'El usuario o email ya existe'
        };
      }

      const newUser = {
        id: Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        image: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=f97316&color=fff`,
        createdAt: new Date().toISOString()
      };

      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: 'Error al crear la cuenta'
      };
    }
  };

  const login = async (username, password) => {
    try {
      // 1. INTENTAR LOGIN CON DJANGO (BACKEND REAL)
      const djangoResponse = await fetch('https://comida-al-paso-proyecto-final-production.up.railway.app/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password
        }),
      });

      if (djangoResponse.ok) {
        const data = await djangoResponse.json();
        
        // Guardar el token REAL de Django
        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        
        // Obtener información del usuario
        const userData = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          firstName: username,
          lastName: 'Usuario',
          token: data.access,
          image: `https://ui-avatars.com/api/?name=${username}&background=f97316&color=fff`
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      }

      // 2. Si falla Django, mostrar error específico
      return { 
        success: false, 
        error: 'Usuario o contraseña incorrectos' 
      };

    } catch (error) {
      return { 
        success: false, 
        error: 'Error de conexión con el servidor' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
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
};

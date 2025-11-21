import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <div className="text-xl text-gray-600">Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere admin y el usuario no es staff
  if (requireAdmin && !user?.is_staff) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-100 border border-red-400 rounded">
        <h2 className="text-xl font-bold text-red-800 mb-2">❌ Acceso Denegado</h2>
        <p className="text-red-700">No tienes permisos de administrador para acceder a esta página.</p>
        <p className="text-red-600 mt-4">Solo los administradores pueden acceder al Dashboard.</p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
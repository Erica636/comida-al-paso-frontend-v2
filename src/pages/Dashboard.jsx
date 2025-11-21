import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { inventarioAPI } from '../services/inventarioAPI';

function Dashboard() {
  const { user, logout } = useAuth();

  // Estados
  const [activeTab, setActiveTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para formularios
  const [newCategoria, setNewCategoria] = useState({ nombre: '', descripcion: '' });
  const [newProducto, setNewProducto] = useState({
    nombre_producto: '',
    nombre_categoria: '',
    precio: '',
    stock: ''
  });

  useEffect(() => {
    document.title = 'Comida al Paso - Dashboard Admin';
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productosData, categoriasData] = await Promise.all([
        inventarioAPI.getProductos(),
        inventarioAPI.getCategorias()
      ]);

      // Extraer el array de results si viene paginado
      const productos = productosData.results || productosData;
      const categorias = categoriasData.results || categoriasData;

      setProductos(Array.isArray(productos) ? productos : []);
      setCategorias(Array.isArray(categorias) ? categorias : []);
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategoria = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await inventarioAPI.createCategoria(newCategoria.nombre, newCategoria.descripcion);
      setSuccess('Categoría creada exitosamente');
      setNewCategoria({ nombre: '', descripcion: '' });
      loadData();
    } catch (err) {
      setError('Error al crear categoría');
    }
  };

  const handleCreateProducto = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await inventarioAPI.createProducto(newProducto);
      setSuccess('Producto creado exitosamente');
      setNewProducto({ nombre_producto: '', nombre_categoria: '', precio: '', stock: '' });
      loadData();
    } catch (err) {
      setError('Error al crear producto');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard - Panel de Administración
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.username}
          </p>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('productos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'productos'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Productos ({productos.length})
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categorias'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Categorías ({categorias.length})
          </button>
          <button
            onClick={() => setActiveTab('crear')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'crear'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Crear Nuevo
          </button>
        </nav>
      </div>

      {/* Contenido de Tabs */}
      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">Cargando...</p>
        </Card>
      ) : (
        <>
          {/* Tab Productos */}
          {activeTab === 'productos' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-600">
                Lista de Productos
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productos.map((producto, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{producto.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{producto.categoria}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${producto.precio}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{producto.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab Categorías */}
          {activeTab === 'categorias' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-600">
                Lista de Categorías
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-lg">{categoria.nombre}</h3>
                    <p className="text-gray-600 text-sm mt-2">{categoria.descripcion}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tab Crear */}
          {activeTab === 'crear' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Crear Categoría */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-orange-600">
                  Crear Nueva Categoría
                </h2>
                <form onSubmit={handleCreateCategoria} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCategoria.nombre}
                      onChange={(e) => setNewCategoria({ ...newCategoria, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newCategoria.descripcion}
                      onChange={(e) => setNewCategoria({ ...newCategoria, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows="3"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Categoría
                  </Button>
                </form>
              </Card>

              {/* Crear Producto */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-orange-600">
                  Crear Nuevo Producto
                </h2>
                <form onSubmit={handleCreateProducto} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={newProducto.nombre_producto}
                      onChange={(e) => setNewProducto({ ...newProducto, nombre_producto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      required
                      value={newProducto.nombre_categoria}
                      onChange={(e) => setNewProducto({ ...newProducto, nombre_categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.nombre}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProducto.precio}
                      onChange={(e) => setNewProducto({ ...newProducto, precio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      required
                      value={newProducto.stock}
                      onChange={(e) => setNewProducto({ ...newProducto, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Crear Producto
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
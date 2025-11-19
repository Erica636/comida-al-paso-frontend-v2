import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { inventarioAPI } from '../services/inventarioAPI';

const categoriasEmojis = {
  'Hamburguesas': '🍔',
  'Pizzas': '🍕', 
  'Empanadas': '🥟',
  'Parrilla': '🥩',
  'Pastas': '🍝',
  'Ensaladas': '🥗',
  'Bebidas': '🥤',
  'Postres': '🍰'
};

function Products() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filtro, setFiltro] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [ordenamiento, setOrdenamiento] = useState('nombre');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Comida al Paso - Productos";
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');
            
            const [productosData, categoriasData] = await Promise.all([
                inventarioAPI.getProductos(),
                inventarioAPI.getCategorias()
            ]);

            const productosTransformados = productosData.map((producto, index) => ({
                id: `${producto.nombre.replace(/\s+/g, '-')}-${index}`,
                nombre: producto.nombre,
                precio: producto.precio,
                categoria: producto.categoria.toLowerCase(),
                imagen: categoriasEmojis[producto.categoria] || '🍽️',
                descripcion: producto.descripcion || 'Delicioso producto de nuestro menú',
                disponible: producto.stock > 0,
                stock: producto.stock
            }));

            setProductos(productosTransformados);
            setCategorias(categoriasData);
            
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setError('Error al cargar los productos. Verifica la conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const categoriasUnicas = ['todos', ...new Set(productos.map(p => p.categoria))];

    let productosFiltrados = productos.filter(producto => {
        const coincideFiltro = filtro === 'todos' || producto.categoria === filtro;
        const coincideBusqueda = 
            producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(busqueda.toLowerCase());
        return coincideFiltro && coincideBusqueda;
    });

    productosFiltrados.sort((a, b) => {
        switch (ordenamiento) {
            case 'precio-asc':
                return a.precio - b.precio;
            case 'precio-desc':
                return b.precio - a.precio;
            case 'nombre':
            default:
                return a.nombre.localeCompare(b.nombre);
        }
    });

    const navegarAProducto = (id) => {
        navigate(`/productos/${id}`);
    };

    const limpiarFiltros = () => {
        setFiltro('todos');
        setBusqueda('');
        setOrdenamiento('nombre');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <div className="text-xl text-gray-600">Cargando productos...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error de conexión:</strong> {error}
                </div>
                <Button onClick={cargarDatos}>
                    🔄 Reintentar Conexión
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Nuestros Productos
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="grid md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar:
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categoría:
                        </label>
                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                            {categoriasUnicas.map(categoria => (
                                <option key={categoria} value={categoria}>
                                    {categoria === 'todos' ? 'Todas las categorías' :
                                     categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ordenar por:
                        </label>
                        <select
                            value={ordenamiento}
                            onChange={(e) => setOrdenamiento(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                            <option value="nombre">Nombre (A-Z)</option>
                            <option value="precio-asc">Precio (menor a mayor)</option>
                            <option value="precio-desc">Precio (mayor a menor)</option>
                        </select>
                    </div>

                    <div>
                        <Button variant="secondary" onClick={limpiarFiltros} className="w-full">
                            Limpiar filtros
                        </Button>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">
                    Mostrando {productosFiltrados.length} de {productos.length} productos
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosFiltrados.map(producto => (
                    <ProductCard
                        key={producto.id}
                        producto={producto}
                        onClick={navegarAProducto}
                    />
                ))}
            </div>

            {productosFiltrados.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-xl mb-4">No se encontraron productos</p>
                    <p className="text-gray-400 mb-4">
                        {busqueda || filtro !== 'todos' 
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay productos disponibles en este momento'
                        }
                    </p>
                    <Button onClick={limpiarFiltros}>
                        Limpiar filtros
                    </Button>
                </div>
            )}
        </div>
    );
}

export default Products;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { productosData } from '../data/productos';

function Home() {
    const [contador, setContador] = useState(0);
    const [mensajeBienvenida, setMensajeBienvenida] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Comida al Paso - Inicio";
        console.log("Componente Home montado - useEffect ejecutado");

        return () => {
            console.log("Componente Home desmontado");
        };
    }, []);

    useEffect(() => {
        if (contador > 0) {
            console.log(`Contador actualizado: ${contador} visitantes`);

            if (contador === 1) {
                setMensajeBienvenida('¡Primer visitante del día! 🎉');
            } else if (contador === 10) {
                setMensajeBienvenida('¡Ya somos 10 visitantes! 🔥');
            } else if (contador > 20) {
                setMensajeBienvenida('¡Qué popular estamos hoy! 🚀');
            } else {
                setMensajeBienvenida('');
            }
        }
    }, [contador]);

    const productosDestacados = productosData.filter(p => p.disponible).slice(0, 3);

    const incrementarContador = () => {
        setContador(contador + 1);
    };

    const reiniciarContador = () => {
        setContador(0);
        setMensajeBienvenida('');
    };

    const navegarAProductos = () => {
        navigate('/productos');
    };

    const navegarAProducto = (id) => {
        navigate(`/productos/${id}`);
    };

    return (
        <div>
            <section className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    Bienvenido a Comida al Paso
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    La mejor comida rápida de la ciudad, preparada con amor e ingredientes frescos
                </p>

                <div className="bg-orange-100 p-6 rounded-lg mb-8 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold mb-2">👥 Visitantes hoy</h3>
                    <div className="text-3xl font-bold text-orange-600 mb-4">{contador}</div>

                    {mensajeBienvenida && (
                        <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4 text-sm">
                            {mensajeBienvenida}
                        </div>
                    )}

                    <div className="space-x-2">
                        <Button onClick={incrementarContador}>
                            👋 ¡Hola!
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={reiniciarContador}
                            disabled={contador === 0}
                        >
                            Reiniciar
                        </Button>
                    </div>
                </div>

                <Button onClick={navegarAProductos} className="text-lg px-8 py-3">
                    🍽️ Ver Nuestro Menú
                </Button>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    Productos Destacados
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {productosDestacados.map(producto => (
                        <ProductCard
                            key={producto.id}
                            producto={producto}
                            onClick={navegarAProducto}
                        />
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Button variant="secondary" onClick={navegarAProductos}>
                        Ver todos los productos →
                    </Button>
                </div>
            </section>
        </div>
    );
}

export default Home;
import React, { useEffect, useState } from 'react';

type Vendedor = {
    id: number;
    descripcion: string;
};

type Articulo = {
    codigo: string;
    descripcion: string;
    precio: number;
    deposito: number;
};

const Table = () => {
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [articulos, setArticulos] = useState<Articulo[]>([]);
    const [selectedVendedor, setSelectedVendedor] = useState<number | undefined>(undefined);
    const [selectedArticulos, setSelectedArticulos] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchVendedores = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('https://run.mocky.io/v3/80bd3e3a-db87-4998-a3ed-d3ee24b1f507');
                const data = await response.json();
                if (data && Array.isArray(data.vendedores)) {
                    setVendedores(data.vendedores);
                } else {
                    throw new Error('La respuesta no contiene el formato esperado.');
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setError('Error al obtener los vendedores.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendedores();
    }, []);


    useEffect(() => {
        const fetchArticulos = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://localhost:7207/api/Producto/articulos');
                const data = await response.json();

                const validArticulos = data.filter((articulo: Articulo) => articulo.precio >= 0);
                setArticulos(validArticulos);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setError('Error al obtener los artículos.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticulos();
    }, []);

    const handleVendedorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVendedor(Number(event.target.value));
    };

    const handleArticuloChange = (codigo: string) => {
        const newSelectedArticulos = new Set(selectedArticulos);
        if (newSelectedArticulos.has(codigo)) {
            newSelectedArticulos.delete(codigo);
        } else {
            newSelectedArticulos.add(codigo);
        }
        setSelectedArticulos(newSelectedArticulos);
    };

    const handleGuardarPedido = async () => {
        if (!selectedVendedor || selectedArticulos.size === 0) {
            alert('seleccione un vendedor y como ninimo un artículo.');
            return;
        }

        const pedido = {
            vendedorId: selectedVendedor,
            articulos: Array.from(selectedArticulos),
        };

        try {
            const response = await fetch('https://localhost:7207/api/Pedidos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedido),
            });

            if (response.ok) {
                alert('Pedido guardado de forma correcta');
            } else {
                alert('Error al guardar el pedido');
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            alert('Hubo un error al guardar el pedido');
        }
    };

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Creacion de  Pedido</h2>

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="vendedor" style={{ fontWeight: 'bold', marginRight: '10px' }}>Vendedor:</label>
                <select id="vendedor" value={selectedVendedor} onChange={handleVendedorChange}>
                    <option value="">Seleccione un vendedor</option>
                    {vendedores.map((vendedor) => (
                        <option key={vendedor.id} value={vendedor.id}>
                            {vendedor.descripcion}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <h2>Artículos</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Seleccionar</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Código</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Descripción</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Precio</th>
                            <th style={{ borderBottom: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Depósito</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articulos.length > 0 ? (
                            articulos.map((articulo) => (
                                <tr key={articulo.codigo}>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleArticuloChange(articulo.codigo)}
                                            checked={selectedArticulos.has(articulo.codigo)}
                                        />
                                    </td>
                                    <td style={{ padding: '8px' }}>{articulo.codigo}</td>
                                    <td style={{ padding: '8px' }}>{articulo.descripcion}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{articulo.precio.toFixed(2)}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{articulo.deposito}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '8px', textAlign: 'center' }}>Sin artículos disponibles.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleGuardarPedido}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Guardar Pedido
            </button>
        </div>
    );
};

export default Table;

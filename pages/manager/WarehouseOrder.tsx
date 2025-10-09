import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { Event, Order, OrderItem, Product } from '../../types';

// Component to select an event
const EventSelector: React.FC = () => {
    const { events } = useData();
    const now = new Date();
    const activeEvents = events.filter(e => e.type === 'Regular' && new Date(e.startDate) <= now && new Date(e.endDate) >= now);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Pedido de Reposición de Stock</h1>
            <Card title="Selecciona un Evento Semanal Activo">
                {activeEvents.length > 0 ? (
                    <div className="space-y-3">
                        {activeEvents.map(event => (
                            <Link key={event.id} to={`/almacen/warehouse-order/${event.id}`} className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                                <p className="font-bold">{event.name}</p>
                                <p className="text-sm text-gray-500">Válido hasta: {new Date(event.endDate).toLocaleString()}</p>
                            </Link>
                        ))}
                    </div>
                ) : <p>No hay eventos de pedido 'Regular' activos en este momento para realizar un pedido de reposición.</p>}
            </Card>
        </div>
    );
};

// Component for the order form itself
const ReplenishmentForm: React.FC<{ event: Event }> = ({ event }) => {
    const navigate = useNavigate();
    const { products, setOrders } = useData();
    const [orderItems, setOrderItems] = useState<Map<string, number>>(new Map());
    
    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const handleQuantityChange = (productId: string, quantity: number) => {
        const newItems = new Map(orderItems);
        if (quantity > 0) newItems.set(productId, quantity);
        else newItems.delete(productId);
        setOrderItems(newItems);
    };

    const totalCost = useMemo(() => {
        let total = 0;
        orderItems.forEach((quantity, productId) => {
            const product = productsMap.get(productId);
            if (product && product.suppliers.length > 0) {
                const price = product.suppliers.sort((a,b) => a.price - b.price)[0].price; // cheapest
                total += price * quantity * (1 + product.tax / 100);
            }
        });
        return total;
    }, [orderItems, productsMap]);

    const handleSubmit = () => {
        if (orderItems.size === 0) {
            alert("El pedido está vacío.");
            return;
        }

        const newOrderItems: OrderItem[] = Array.from(orderItems.entries()).map(([productId, quantity]) => {
            const product = productsMap.get(productId)!;
            const price = product.suppliers.sort((a,b) => a.price - b.price)[0]?.price || 0;
            return { productId, quantity, price, tax: product.tax };
        });

        const orderToSave: Order = {
            id: `ord-wh-${Date.now()}`,
            userId: 'almacen-stock-order', // Special ID for warehouse orders
            date: new Date().toISOString(),
            status: 'Enviado',
            eventId: event.id,
            items: newOrderItems,
            cost: totalCost,
            notes: 'Pedido de reposición para MiniEconomato.',
        };
        
        setOrders(prev => [...prev, orderToSave]);
        alert('Pedido de reposición enviado para su procesamiento.');
        navigate('/almacen/dashboard');
    };

    return (
        <div>
            <Link to="/almacen/warehouse-order" className="text-sm text-primary-600 hover:underline mb-4 block">&larr; Cambiar evento</Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Pedido de Reposición para: {event.name}</h1>
            <Card title="Seleccionar Productos del Catálogo">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.filter(p => p.status === 'Activo').map(product => (
                        <div key={product.id} className="p-3 border rounded-lg dark:border-gray-600">
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.suppliers[0]?.price.toFixed(2) || 'N/A'}€ / {product.unit}</p>
                            <input
                                type="number" step="0.01" min="0"
                                value={orderItems.get(product.id) || ''}
                                onChange={e => handleQuantityChange(product.id, parseFloat(e.target.value) || 0)}
                                className="mt-2 w-full p-1 border rounded dark:bg-gray-700"
                                placeholder="Cantidad"
                            />
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Resumen" className="mt-6">
                <div className="mt-4 text-xl font-bold">
                    Coste Total (Aprox): {totalCost.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSubmit} className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">Enviar Pedido de Reposición</button>
                </div>
            </Card>
        </div>
    );
};

// Main component to switch between views
export const WarehouseOrder: React.FC = () => {
    const { eventId } = useParams<{ eventId?: string }>();
    const { events } = useData();
    const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);

    if (eventId && event) {
        return <ReplenishmentForm event={event} />;
    }
    return <EventSelector />;
};
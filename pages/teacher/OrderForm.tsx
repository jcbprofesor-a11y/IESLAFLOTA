
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Event, Order, OrderItem, Product, NewProductRequest } from '../../types';
import { BlockedAccess } from '../shared/BlockedAccess';
import { TrashIcon, PlusIcon } from '../../components/icons';

export const OrderForm: React.FC = () => {
    const { eventId, orderId } = useParams<{ eventId?: string; orderId?: string }>();
    const navigate = useNavigate();
    const { events, products, orders, setOrders } = useData();
    const { currentUser } = useAuth();
    
    const [orderItems, setOrderItems] = useState<Map<string, number>>(new Map());
    const [notes, setNotes] = useState('');
    const [newRequests, setNewRequests] = useState<NewProductRequest[]>([]);
    const [newRequestForm, setNewRequestForm] = useState({ productName: '', quantity: 1, notes: '' });
    const [isDirty, setIsDirty] = useState(false);

    const event = useMemo(() => events.find(e => e.id === eventId || (orderId && orders.find(o => o.id === orderId)?.eventId === e.id)), [events, eventId, orderId, orders]);
    const existingOrder = useMemo(() => orderId ? orders.find(o => o.id === orderId) : null, [orders, orderId]);
    
    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    useEffect(() => {
        if (existingOrder) {
            const itemsMap = new Map<string, number>();
            existingOrder.items.forEach(item => {
                itemsMap.set(item.productId, item.quantity);
            });
            setOrderItems(itemsMap);
            setNotes(existingOrder.notes || '');
            setNewRequests(existingOrder.newProductRequests || []);
        }
    }, [existingOrder]);
    
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);


    const handleQuantityChange = (productId: string, quantity: number) => {
        setIsDirty(true);
        const newItems = new Map(orderItems);
        if (quantity > 0) {
            newItems.set(productId, quantity);
        } else {
            newItems.delete(productId);
        }
        setOrderItems(newItems);
    };
    
    const handleAddRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if(newRequestForm.productName && newRequestForm.quantity > 0) {
            setIsDirty(true);
            setNewRequests([...newRequests, { ...newRequestForm, quantity: Number(newRequestForm.quantity) }]);
            setNewRequestForm({ productName: '', quantity: 1, notes: '' });
        }
    };

    const handleRemoveRequest = (index: number) => {
        setIsDirty(true);
        setNewRequests(newRequests.filter((_, i) => i !== index));
    };

    const calculateTotalCost = useMemo(() => {
        let total = 0;
        orderItems.forEach((quantity, productId) => {
            const product = productsMap.get(productId);
            if (product && product.suppliers.length > 0) {
                const price = product.suppliers[0].price; // Simplified: use first supplier's price
                const itemCost = price * quantity;
                const itemCostWithTax = itemCost * (1 + product.tax / 100);
                total += itemCostWithTax;
            }
        });
        return total;
    }, [orderItems, productsMap]);

    if (!event) return <Card title="Error">Evento no encontrado.</Card>;
    if (existingOrder && existingOrder.status !== 'Borrador') return <BlockedAccess message="Este pedido ya ha sido enviado y no puede ser editado." />;

    const handleSubmit = (status: 'Borrador' | 'Enviado') => {
        if (!currentUser) return;
        
        setIsDirty(false);

        const newOrderItems: OrderItem[] = Array.from(orderItems.entries()).map(([productId, quantity]) => {
            const product = productsMap.get(productId)!;
            return {
                productId,
                quantity,
                price: product.suppliers[0]?.price || 0,
                tax: product.tax,
            };
        });

        const orderToSave: Order = {
            id: existingOrder?.id || `ord-${Date.now()}`,
            userId: currentUser.id,
            date: new Date().toISOString(),
            status,
            eventId: event.id,
            items: newOrderItems,
            newProductRequests: newRequests,
            cost: calculateTotalCost,
            notes: notes,
        };
        
        const newOrders = existingOrder 
            ? orders.map(o => o.id === existingOrder.id ? orderToSave : o)
            : [...orders, orderToSave];

        setOrders(newOrders);
        
        setTimeout(() => {
            alert(`Pedido ${status === 'Borrador' ? 'guardado como borrador' : 'enviado'}.`);
            navigate('/teacher/order-portal');
        }, 100);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Pedido para: {event.name}</h1>
            <Card title="Añadir Productos del Catálogo">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.filter(p => p.status === 'Activo').map(product => (
                        <div key={product.id} className="p-3 border rounded-lg dark:border-gray-600">
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-gray-500">{product.suppliers[0]?.price.toFixed(2) || 'N/A'}€ / {product.unit}</p>
                            <input
                                type="number"
                                // FIX: Allow decimal quantities for weights/volumes.
                                step="0.01"
                                min="0"
                                value={orderItems.get(product.id) || ''}
                                // FIX: Use parseFloat instead of parseInt to handle decimal quantities correctly.
                                onChange={e => handleQuantityChange(product.id, parseFloat(e.target.value) || 0)}
                                className="mt-2 w-full p-1 border rounded dark:bg-gray-700"
                                placeholder="Cantidad"
                            />
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Solicitar Nuevo Producto (fuera de catálogo)" className="mt-6">
                 <form onSubmit={handleAddRequest} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-2">
                        <label className="text-sm">Nombre del Producto</label>
                        <input type="text" value={newRequestForm.productName} onChange={e => setNewRequestForm({...newRequestForm, productName: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700"/>
                    </div>
                    <div>
                        <label className="text-sm">Cantidad</label>
                        <input type="number" value={newRequestForm.quantity} min="1" onChange={e => setNewRequestForm({...newRequestForm, quantity: Number(e.target.value)})} className="w-full p-2 border rounded dark:bg-gray-700"/>
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded flex items-center justify-center"><PlusIcon className="w-5 h-5 mr-1"/> Añadir Solicitud</button>
                    </div>
                    <div className="md:col-span-4">
                        <label className="text-sm">Notas (proveedor/precio sugerido)</label>
                        <input type="text" value={newRequestForm.notes} onChange={e => setNewRequestForm({...newRequestForm, notes: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700"/>
                    </div>
                </form>
                <div className="mt-4 space-y-2">
                    {newRequests.map((req, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900/50 rounded">
                            <div>
                                <p><strong>{req.productName}</strong> x {req.quantity}</p>
                                <p className="text-xs text-gray-500">{req.notes}</p>
                            </div>
                            <button onClick={() => handleRemoveRequest(index)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Resumen y Notas" className="mt-6">
                 <div>
                    <label>Notas Adicionales para el Encargado</label>
                    <textarea 
                        value={notes}
                        onChange={e => { setNotes(e.target.value); setIsDirty(true); }}
                        rows={3}
                        className="w-full mt-1 p-2 border rounded dark:bg-gray-700"
                    />
                </div>
                <div className="mt-4 text-xl font-bold">
                    Coste Total (Catálogo): {calculateTotalCost.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={() => handleSubmit('Borrador')} className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600">Guardar Borrador</button>
                    <button onClick={() => handleSubmit('Enviado')} className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">Enviar Pedido</button>
                </div>
            </Card>
        </div>
    );
};

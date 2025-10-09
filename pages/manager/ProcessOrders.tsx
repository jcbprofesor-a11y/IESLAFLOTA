import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Product, Supplier, Order, OrderItem, OrderStatus, Profile, NewProductRequest, Message } from '../../types';
import { generateOrderPdf } from '../../utils/export';
import { PlusIcon, TrashIcon } from '../../components/icons';
import { useCreator } from '../../contexts/CreatorContext';

type AggregatedProduct = {
    product: Product;
    totalQuantity: number;
    orders: { order: Order; item: OrderItem }[];
}

// Main Component
export const ProcessOrders: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { events, orders } = useData();
    const now = new Date();

    // View to select an event if no eventId is in the URL
    if (!eventId) {
        const processableEvents = useMemo(() => {
            const eventStatusMap = new Map<string, { orderCount: number; status: 'Procesado' | 'Enviado' }>();
            orders.forEach(o => {
                if (o.status === 'Enviado' || o.status === 'Procesado') {
                    if (!eventStatusMap.has(o.eventId)) {
                        eventStatusMap.set(o.eventId, { orderCount: 0, status: 'Enviado' });
                    }
                    const info = eventStatusMap.get(o.eventId)!;
                    info.orderCount++;
                    if (o.status === 'Procesado') info.status = 'Procesado';
                }
            });
            return events
                .filter(e => eventStatusMap.has(e.id))
                .map(e => ({ ...e, ...eventStatusMap.get(e.id)! }));
        }, [events, orders]);

        return (
            <div>
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Procesar Pedido General</h1>
                 <Card title="Selecciona un Evento para Procesar">
                     <div className="space-y-3">
                        {processableEvents.length > 0 ? processableEvents.map(e => {
                            const isEventOpen = new Date(e.startDate) <= now && new Date(e.endDate) >= now;
                            return (
                            <Link to={`/almacen/process-orders/${e.id}`} key={e.id} className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{e.name}</p>
                                        <p className="text-sm">{e.orderCount} pedidos de profesores</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isEventOpen ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {isEventOpen ? 'Abierto' : 'Cerrado'}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${e.status === 'Enviado' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}>
                                            {e.status === 'Enviado' ? 'Pendiente' : 'Procesado'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        )}) : <p>No hay eventos con pedidos pendientes de procesar.</p>}
                     </div>
                 </Card>
            </div>
        );
    }
    
    // Detailed view for a specific event
    return <EventProcessingDetail eventId={eventId} />;
};


// Detail view component
const EventProcessingDetail: React.FC<{ eventId: string }> = ({ eventId }) => {
    const navigate = useNavigate();
    const { orders, setOrders, events, products, suppliers, users, setMessages } = useData();
    const { companyInfo } = useCompany();
    const { currentUser } = useAuth();
    const { creatorInfo } = useCreator();

    const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
    const [selectedSuppliers, setSelectedSuppliers] = useState<Record<string, string>>({});
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const suppliersMap = useMemo(() => new Map(suppliers.map(s => [s.id, s])), [suppliers]);
    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const managerUser = useMemo(() => users.find(u => u.id === companyInfo.managerUserId), [users, companyInfo]);
    
    const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);
    const eventOrders = useMemo(() => orders.filter(o => o.eventId === eventId && (o.status === 'Enviado' || o.status === 'Procesado')), [orders, eventId]);
    const isProcessed = useMemo(() => eventOrders.length > 0 && eventOrders.every(o => o.status === 'Procesado'), [eventOrders]);

    const { aggregatedProducts, newProductRequests } = useMemo(() => {
        const productMap: Map<string, AggregatedProduct> = new Map();
        const requests: (NewProductRequest & { teacherName: string })[] = [];

        for (const order of eventOrders) {
            for (const item of order.items) {
                const product = productsMap.get(item.productId);
                if (!product || product.status === 'Inactivo') continue;

                if (!productMap.has(product.id)) {
                    productMap.set(product.id, { product, totalQuantity: 0, orders: [] });
                }
                const agg = productMap.get(product.id)!;
                agg.totalQuantity += item.quantity;
                agg.orders.push({ order, item });
            }
            if (order.newProductRequests) {
                requests.push(...order.newProductRequests.map(r => ({...r, teacherName: usersMap.get(order.userId) || 'Desconocido' })));
            }
        }
        return { aggregatedProducts: Array.from(productMap.values()), newProductRequests: requests };
    }, [eventOrders, productsMap, usersMap]);
    
    useEffect(() => {
        const initialSuppliers: Record<string, string> = {};
        aggregatedProducts.forEach(({ product }) => {
            const cheapestSupplier = product.suppliers
                .map(ps => ({ ...ps, supplier: suppliersMap.get(ps.supplierId) }))
                .filter(ps => ps.supplier?.status === 'Activo')
                .sort((a, b) => a.price - b.price)[0];
            if (cheapestSupplier) {
                initialSuppliers[product.id] = cheapestSupplier.supplierId;
            }
        });
        setSelectedSuppliers(initialSuppliers);
    }, [aggregatedProducts, suppliersMap]);

    const handleQuantityChange = (orderId: string, productId: string, newQuantity: number) => {
        setEditedQuantities(prev => ({ ...prev, [`${orderId}-${productId}`]: newQuantity < 0 ? 0 : newQuantity }));
    };

    const toggleExpand = (productId: string) => {
        const newSet = new Set(expandedProducts);
        if (newSet.has(productId)) {
            newSet.delete(productId);
        } else {
            newSet.add(productId);
        }
        setExpandedProducts(newSet);
    };

    const supplierSummary = useMemo(() => {
        const summary = new Map<string, { supplier: Supplier; items: Product[]; totalCost: number }>();
        aggregatedProducts.forEach(agg => {
            const supplierId = selectedSuppliers[agg.product.id];
            if (!supplierId || !suppliersMap.has(supplierId)) return;

            if (!summary.has(supplierId)) {
                summary.set(supplierId, { supplier: suppliersMap.get(supplierId)!, items: [], totalCost: 0 });
            }

            const totalQuantity = agg.orders.reduce((sum, detail) => sum + (editedQuantities[`${detail.order.id}-${agg.product.id}`] ?? detail.item.quantity), 0);
            const priceInfo = agg.product.suppliers.find(s => s.supplierId === supplierId);
            const cost = totalQuantity * (priceInfo?.price || 0);

            const entry = summary.get(supplierId)!;
            entry.items.push(agg.product);
            entry.totalCost += cost;
        });
        return Array.from(summary.values());
    }, [aggregatedProducts, selectedSuppliers, suppliersMap, editedQuantities]);

    const handleGeneratePdfs = () => {
         const ordersBySupplier = new Map<string, { product: Product; quantity: number; price: number }[]>();
        supplierSummary.forEach(({ supplier, totalCost }) => {
            const itemsForSupplier = aggregatedProducts
                .filter(agg => selectedSuppliers[agg.product.id] === supplier.id)
                .map(agg => {
                    const totalQuantity = agg.orders.reduce((sum, detail) => sum + (editedQuantities[`${detail.order.id}-${agg.product.id}`] ?? detail.item.quantity), 0);
                    const priceInfo = agg.product.suppliers.find(s => s.supplierId === supplier.id);
                    return { product: agg.product, quantity: totalQuantity, price: priceInfo?.price || 0 };
                });
            ordersBySupplier.set(supplier.id, itemsForSupplier);
        });
        generateOrderPdf(ordersBySupplier, suppliersMap, companyInfo, managerUser, creatorInfo.appName, creatorInfo.copyright);
    };

    const handleModifyOrders = () => {
        if (window.confirm("¿Seguro que quieres revertir este evento a 'Enviado'? Podrás volver a editar los pedidos de los profesores.")) {
             const newOrders = orders.map(order => {
                if (order.eventId === eventId && order.status === 'Procesado') {
                    return { ...order, status: 'Enviado' as OrderStatus };
                }
                return order;
            });
            setOrders(newOrders);
        }
    };
    
    const handleProcessOrders = () => {
        if (window.confirm("¿Seguro que quieres procesar estos pedidos? Su estado cambiará a 'Procesado' y ya no podrán ser editados hasta que reviertas esta acción.")) {
            const eventOrderIds = new Set(eventOrders.map(o => o.id));
            const newMessages: Message[] = [];
            
            const newOrders = orders.map(order => {
                if (eventOrderIds.has(order.id)) {
                    const originalOrder = eventOrders.find(o => o.id === order.id)!;

                    const updatedItems = order.items.map(item => {
                        const editedQty = editedQuantities[`${order.id}-${item.productId}`];
                        return editedQty !== undefined ? { ...item, quantity: editedQty } : item;
                    }).filter(item => item.quantity > 0);

                    const updatedCost = updatedItems.reduce((sum, item) => {
                        const product = productsMap.get(item.productId);
                        if (!product) return sum;
                        const priceInfo = product.suppliers.find(s => s.supplierId === selectedSuppliers[product.id]);
                        const price = priceInfo?.price || item.price;
                        return sum + (item.quantity * price * (1 + item.tax / 100));
                    }, 0);
                    
                    // Generate automatic message if changes were made
                    let itemChanges: string[] = [];
                    updatedItems.forEach(updatedItem => {
                        const originalItem = originalOrder.items.find(i => i.productId === updatedItem.productId);
                        if (originalItem && originalItem.quantity !== updatedItem.quantity) {
                            itemChanges.push(`- ${productsMap.get(updatedItem.productId)?.name}: Cantidad cambiada de ${originalItem.quantity} a ${updatedItem.quantity}.`);
                        }
                    });
                    originalOrder.items.forEach(originalItem => {
                        if (!updatedItems.some(i => i.productId === originalItem.productId)) {
                            itemChanges.push(`- ${productsMap.get(originalItem.productId)?.name}: Eliminado del pedido.`);
                        }
                    });

                    if (itemChanges.length > 0) {
                        let changesDescription = `Tu pedido para "${event?.name}" ha sido procesado por ${currentUser?.name}.\n\nSe han realizado los siguientes ajustes:\n${itemChanges.join('\n')}`;
                        newMessages.push({
                            id: `msg-sys-${Date.now()}-${order.id}`,
                            senderId: currentUser!.id,
                            recipientIds: [order.userId],
                            subject: `Actualización de tu pedido para el evento "${event?.name}"`,
                            body: changesDescription,
                            date: new Date().toISOString(),
                            readBy: {},
                        });
                    }


                    return { ...order, items: updatedItems, cost: updatedCost, status: 'Procesado' as OrderStatus };
                }
                return order;
            });
            setOrders(newOrders);
            setMessages(prev => [...prev, ...newMessages]);
            alert('¡Pedidos procesados con éxito!');
        }
    }

    if (!event) return <Card title="Error">Evento no encontrado.</Card>;

    return (
        <div>
            <Link to="/almacen/process-orders" className="text-sm text-primary-600 hover:underline no-print">&larr; Volver a la selección de eventos</Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Procesar Pedido: {event.name}</h1>
            <p className="mb-6 text-gray-500">Agrupa, revisa y genera las hojas de pedido para los proveedores.</p>

            <Card title="Revisión de Pedidos Pendientes">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-2 py-2">Producto</th>
                            <th className="px-2 py-2">Cantidad Total</th>
                            <th className="px-2 py-2 w-1/3">Proveedor Asignado</th>
                            <th className="px-2 py-2">Coste Total (Aprox)</th>
                            <th className="px-2 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregatedProducts.map(({ product, orders: orderDetails }) => {
                            const totalQuantity = orderDetails.reduce((sum, detail) => sum + (editedQuantities[`${detail.order.id}-${product.id}`] ?? detail.item.quantity), 0);
                            const selectedSupId = selectedSuppliers[product.id];
                            const price = product.suppliers.find(s => s.supplierId === selectedSupId)?.price || 0;
                            const totalCost = totalQuantity * price;
                            const isExpanded = expandedProducts.has(product.id);
                             return (
                                <React.Fragment key={product.id}>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="p-2 font-semibold">{product.name}</td>
                                    <td className="p-2 text-center">{totalQuantity} {product.unit}</td>
                                    <td className="p-2">
                                        <select value={selectedSupId || ''} disabled={isProcessed} onChange={(e) => setSelectedSuppliers({...selectedSuppliers, [product.id]: e.target.value})} className="w-full p-1 border rounded dark:bg-gray-800">
                                            {product.suppliers.map(ps => suppliersMap.get(ps.supplierId)).filter(s => s?.status === 'Activo').map(s => s && <option key={s.id} value={s.id}>{s.name} ({product.suppliers.find(ps => ps.supplierId === s.id)?.price.toFixed(2)}€)</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">{totalCost.toFixed(2)}€</td>
                                    <td className="p-2"><button onClick={() => toggleExpand(product.id)} className="text-primary-600 text-xs">{isExpanded ? 'Ocultar' : 'Ver/Editar Desglose'}</button></td>
                                </tr>
                                {isExpanded && (
                                    <tr className="bg-gray-50 dark:bg-gray-900">
                                        <td colSpan={5} className="p-4">
                                            <h4 className="font-bold mb-2">Desglose para {product.name}</h4>
                                            {orderDetails.map(({ order, item }) => (
                                                <div key={order.id} className="grid grid-cols-3 gap-2 items-center text-xs mb-1">
                                                    <span>{usersMap.get(order.userId)}:</span>
                                                    {/* FIX: Use parseFloat for quantities that can be decimals and add a step attribute. */}
                                                    <input type="number" step="0.01" disabled={isProcessed} value={editedQuantities[`${order.id}-${item.productId}`] ?? item.quantity} onChange={e => handleQuantityChange(order.id, item.productId, parseFloat(e.target.value) || 0)} className="w-20 p-1 border rounded dark:bg-gray-800"/>
                                                    <em className="text-gray-500 truncate" title={order.notes}>"{order.notes}"</em>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                </div>
            </Card>

            {newProductRequests.length > 0 && (
                <Card title="Solicitudes de Nuevos Productos" className="mt-6 border-yellow-400">
                    {newProductRequests.map((req, i) => (
                        <div key={i} className="p-2 border-b dark:border-gray-700">
                           <p><strong>{req.productName}</strong> x {req.quantity}</p>
                           <p className="text-sm">Pedido por: {req.teacherName}</p>
                           <p className="text-xs text-gray-500">Notas: {req.notes}</p>
                        </div>
                    ))}
                </Card>
            )}

            <Card title="Generar Pedidos por Proveedor" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {supplierSummary.map(({ supplier, items, totalCost }) => (
                        <div key={supplier.id} className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-md">
                            <h4 className="font-bold">{supplier.name}</h4>
                            <p className="text-sm">{items.length} productos</p>
                            <p className="text-lg font-semibold">{totalCost.toFixed(2)}€ <span className="text-xs">(sin IVA)</span></p>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                    <button onClick={handleGeneratePdfs} className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">Generar Hojas de Pedido (PDF)</button>
                    {isProcessed ? (
                        <button onClick={handleModifyOrders} className="bg-orange-600 text-white py-2 px-6 rounded-md hover:bg-orange-700">Modificar Pedidos Procesados</button>
                    ) : (
                        <button onClick={handleProcessOrders} className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700">Procesar Pedidos Pendientes</button>
                    )}
                </div>
            </Card>
        </div>
    );
};
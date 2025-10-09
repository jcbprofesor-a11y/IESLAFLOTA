import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { ClassroomProduct, ClassroomOrder } from '../../types';
import { DownloadIcon } from '../../components/icons';
import { printPage } from '../../utils/export';

type AggregatedClassroomProduct = {
    product: ClassroomProduct;
    totalQuantity: number;
}

export const StudentProcessOrders: React.FC = () => {
    const { currentUser } = useAuth();
    const { classroomOrders, classroomProducts, classroomSuppliers, classroomEvents } = useData();

    const myClassroomId = currentUser?.classroomId;
    
    const eventToProcess = useMemo(() => 
        classroomEvents.find(e => e.classroomId === myClassroomId && new Date(e.endDate) > new Date())
    , [classroomEvents, myClassroomId]);

    const aggregatedProducts = useMemo<AggregatedClassroomProduct[]>(() => {
        if (!eventToProcess) return [];

        const productsMap = new Map<string, ClassroomProduct>(classroomProducts.map(p => [p.id, p]));
        const productAggregation: Map<string, AggregatedClassroomProduct> = new Map();
        
        const eventOrders = classroomOrders.filter(o => o.eventId === eventToProcess.id && o.status === 'Pendiente');

        for (const order of eventOrders) {
            for (const item of order.items) {
                const product = productsMap.get(item.productId);
                if (!product) continue;

                if (!productAggregation.has(product.id)) {
                    productAggregation.set(product.id, { product, totalQuantity: 0 });
                }
                productAggregation.get(product.id)!.totalQuantity += item.quantity;
            }
        }
        return Array.from(productAggregation.values());
    }, [classroomOrders, classroomProducts, eventToProcess]);
    
    const suppliersForClass = useMemo(() => classroomSuppliers.filter(s => s.classroomId === myClassroomId), [classroomSuppliers, myClassroomId]);

    if (!eventToProcess) {
        return <Card title="Procesar Pedidos"><p>No hay eventos de pedido de práctica activos en este momento.</p></Card>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Práctica: Procesar Pedido "{eventToProcess.name}"</h1>
                <button onClick={printPage} className="no-print bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Descargar PDF
                </button>
            </div>
             <p className="mb-6 text-gray-500">Agrupa los productos y asígnalos a un proveedor ficticio.</p>
            
            <div className="space-y-4">
                {aggregatedProducts.map(({ product, totalQuantity }) => (
                    <Card key={product.id} title={product.name}>
                         <div className="grid grid-cols-3 gap-4 items-center">
                             <div><strong>Total a pedir:</strong> {totalQuantity} unidades</div>
                             <div className="col-span-2">
                                <label className="text-sm">Asignar a Proveedor:</label>
                                <select className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 no-print">
                                    <option value="">Selecciona...</option>
                                    {suppliersForClass.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                         </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-end no-print">
                <button className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700">Finalizar Práctica</button>
            </div>
        </div>
    );
};
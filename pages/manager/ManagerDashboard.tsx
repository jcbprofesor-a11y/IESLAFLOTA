import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { EventIcon, ProductIcon, SupplierIcon, HistoryIcon, DownloadIcon } from '../../components/icons';
import { printPage } from '../../utils/export';

const StatCard: React.FC<{ title: string; icon: React.ReactNode; value: string | number; color: string }> = ({ title, icon, value, color }) => (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center border-t-4 border-primary-500">
        <div className={`p-3 rounded-full ${color} mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

export const ManagerDashboard: React.FC = () => {
    const { events, orders, miniEconomatoStock, products } = useData();
    const now = new Date();
    
    const pendingOrderCount = useMemo(() => {
        return orders.filter(o => o.status === 'Enviado').length;
    }, [orders]);

    const lowStockItems = useMemo(() => {
        return miniEconomatoStock.filter(item => item.stock <= item.minStock).length;
    }, [miniEconomatoStock]);

    const activeEvents = events.filter(e => new Date(e.endDate) > now);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Panel del Encargado</h1>
                <button onClick={printPage} className="no-print bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center">
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Descargar PDF
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard title="Pedidos Pendientes" icon={<ProductIcon className="w-7 h-7 text-white"/>} value={pendingOrderCount} color="bg-yellow-500" />
                 <StatCard title="Eventos Activos" icon={<EventIcon className="w-7 h-7 text-white"/>} value={activeEvents.length} color="bg-blue-500" />
                 <StatCard title="Bajo Stock (Mini-Eco)" icon={<SupplierIcon className="w-7 h-7 text-white"/>} value={lowStockItems} color="bg-red-500" />
                 <StatCard title="Productos Totales" icon={<HistoryIcon className="w-7 h-7 text-white"/>} value={products.length} color="bg-green-500" />
            </div>
            
            <div className="mt-8">
                <Card title="Eventos con Pedidos Pendientes">
                    {activeEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {activeEvents.map(event => {
                                const pendingCount = orders.filter(o => o.eventId === event.id && o.status === 'Enviado').length;
                                if (pendingCount === 0) return null;
                                return (
                                <li key={event.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{event.name}</p>
                                        <p className="text-sm">{pendingCount} pedidos de profesores pendientes de procesar.</p>
                                    </div>
                                    <Link to={`/almacen/process-orders/${event.id}`} className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 no-print">
                                        Procesar
                                    </Link>
                                </li>
                            )}).filter(Boolean)}
                        </ul>
                    ) : (
                        <p>No hay eventos activos en este momento.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};
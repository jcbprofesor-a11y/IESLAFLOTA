import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { Product, User, Profile, Order, StockItem, Event } from '../../types';
import { DownloadIcon, PlusIcon, PencilIcon } from '../../components/icons';
import { printPage } from '../../utils/export';

const AssignExpenseModal: React.FC<{product: Product; onClose: () => void; onAssign: (teacherId: string, quantity: number) => void; teachers: User[]}> = ({ product, onClose, onAssign, teachers }) => {
    const [teacherId, setTeacherId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const { miniEconomatoStock } = useData();
    const maxQuantity = miniEconomatoStock.find(s => s.id === product.id)?.stock || 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAssign(teacherId, quantity);
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={`Asignar ${product.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label>Profesor</label>
                    <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required className="w-full mt-1 p-2 border rounded dark:bg-gray-700">
                        <option value="">Selecciona un profesor...</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label>Cantidad (Máx: {maxQuantity})</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" max={maxQuantity} required className="w-full mt-1 p-2 border rounded dark:bg-gray-700" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                     <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">Asignar Gasto</button>
                </div>
            </form>
        </Modal>
    );
};

const AddProductModal: React.FC<{ allProducts: Product[], currentStockIds: string[], onClose: () => void, onAdd: (productId: string, stock: number, minStock: number) => void }> = ({ allProducts, currentStockIds, onClose, onAdd }) => {
    const [productId, setProductId] = useState('');
    const [stock, setStock] = useState(0);
    const [minStock, setMinStock] = useState(0);
    
    const availableProducts = useMemo(() => allProducts.filter(p => !currentStockIds.includes(p.id)), [allProducts, currentStockIds]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(productId) onAdd(productId, stock, minStock);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Añadir Producto al Mini-Economato">
            <form onSubmit={handleSubmit} className="space-y-4">
                <select value={productId} onChange={e => setProductId(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700">
                    <option value="">-- Seleccionar Producto --</option>
                    {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} placeholder="Stock Inicial" required min="0" className="w-full p-2 border rounded dark:bg-gray-700" />
                <input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} placeholder="Stock Mínimo" required min="0" className="w-full p-2 border rounded dark:bg-gray-700" />
                <div className="flex justify-end"><button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Añadir</button></div>
            </form>
        </Modal>
    );
};

const EditStockModal: React.FC<{ item: StockItem, productName: string, onClose: () => void, onSave: (stock: number, minStock: number) => void }> = ({ item, productName, onClose, onSave }) => {
    const [stock, setStock] = useState(item.stock);
    const [minStock, setMinStock] = useState(item.minStock);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(stock, minStock); };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Editar Stock de ${productName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} placeholder="Stock Actual" required min="0" className="w-full p-2 border rounded dark:bg-gray-700" />
                <input type="number" value={minStock} onChange={e => setMinStock(Number(e.target.value))} placeholder="Stock Mínimo" required min="0" className="w-full p-2 border rounded dark:bg-gray-700" />
                <div className="flex justify-end"><button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Guardar</button></div>
            </form>
        </Modal>
    );
};


export const MiniEconomato: React.FC = () => {
    const { miniEconomatoStock, setMiniEconomatoStock, products, users, orders, setOrders, events } = useData();
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [productToAssign, setProductToAssign] = useState<Product | null>(null);
    const [itemToEdit, setItemToEdit] = useState<StockItem | null>(null);

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const stockMap = useMemo(() => new Map(miniEconomatoStock.map(s => [s.id, s])), [miniEconomatoStock]);

    const economatoProducts = useMemo(() => 
        Array.from(stockMap.values()).map((stockItem: StockItem) => ({
            product: productsMap.get(stockItem.id)!,
            stock: stockItem
        })).filter(item => item.product)
    , [stockMap, productsMap]);

    const getStockLevel = (current: number, min: number) => {
        if (current === 0) return { text: 'Agotado', className: 'bg-red-200 dark:bg-red-900 border-red-400' };
        if (current <= min * 0.5) return { text: 'Bajo Mínimos', className: 'bg-red-300 dark:bg-red-800 border-red-500' };
        if (current <= min) return { text: 'Nivel Bajo', className: 'bg-yellow-200 dark:bg-yellow-900 border-yellow-400' };
        return { text: 'Saludable', className: 'bg-green-200 dark:bg-green-900 border-green-400' };
    };

    const handleOpenAssignModal = (product: Product) => {
        setProductToAssign(product);
        setIsAssignModalOpen(true);
    };

    const handleAssignExpense = (teacherId: string, quantity: number) => {
        if (!productToAssign || !teacherId || !quantity || quantity <= 0) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const activeEvent = events.find(e => e.type === 'Regular' && new Date(e.startDate) <= new Date() && new Date(e.endDate) >= new Date());
        if (!activeEvent) {
            alert("No hay un evento de pedido 'Regular' activo en este momento para imputar el gasto.");
            return;
        }

        const currentStock = stockMap.get(productToAssign.id);
        if (!currentStock || currentStock.stock < quantity) {
            alert("No hay suficiente stock.");
            return;
        }

        const priceInfo = productToAssign.suppliers.sort((a,b) => a.price - b.price)[0];
        if (!priceInfo) {
            alert("El producto no tiene un proveedor/precio definido para calcular el coste.");
            return;
        }
        
        const newOrder: Order = {
            id: `ord-eco-${Date.now()}`,
            userId: teacherId,
            date: new Date().toISOString(),
            status: 'Completado',
            eventId: activeEvent.id,
            items: [{
                productId: productToAssign.id,
                quantity,
                price: priceInfo.price,
                tax: productToAssign.tax
            }],
            cost: (priceInfo.price * quantity) * (1 + productToAssign.tax / 100),
            notes: `Asignado desde MiniEconomato por encargado.`
        };
        setOrders(prev => [...prev, newOrder]);

        const newStock = miniEconomatoStock.map(item => 
            item.id === productToAssign.id ? { ...item, stock: item.stock - quantity } : item
        );
        setMiniEconomatoStock(newStock);

        alert(`Gasto de ${quantity} x ${productToAssign.name} asignado a profesor.`);
        setIsAssignModalOpen(false);
        setProductToAssign(null);
    };
    
    const handleAddProduct = (productId: string, stock: number, minStock: number) => {
        setMiniEconomatoStock(prev => [...prev, {id: productId, stock, minStock}]);
        setIsAddModalOpen(false);
    }
    
    const handleEditStock = (stock: number, minStock: number) => {
        if (!itemToEdit) return;
        setMiniEconomatoStock(prev => prev.map(item => item.id === itemToEdit.id ? {...item, stock, minStock} : item));
        setIsEditModalOpen(false);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Gestión de Mini-Economato</h1>
                <div className="flex space-x-2">
                    <button onClick={() => setIsAddModalOpen(true)} className="no-print bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-2" /> Añadir Producto
                    </button>
                    <button onClick={printPage} className="no-print bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center">
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Descargar PDF
                    </button>
                </div>
            </div>
            
            <Card title="Stock Interno">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {economatoProducts.map(({ product, stock }) => {
                        const stockLevel = getStockLevel(stock.stock, stock.minStock);
                        return (
                        <div key={product.id} className={`p-4 rounded-lg border ${stockLevel.className}`}>
                            <h4 className="font-bold">{product.name}</h4>
                            <p>Stock: <span className="font-bold text-xl">{stock.stock}</span> / Mínimo: {stock.minStock}</p>
                             <p className="text-xs font-semibold">{stockLevel.text}</p>
                            <div className="mt-2 space-x-2 no-print">
                                <button onClick={() => { setItemToEdit(stock); setIsEditModalOpen(true); }} className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                                    <PencilIcon className="w-4 h-4 inline-block mr-1"/> Editar Stock
                                </button>
                                <button onClick={() => handleOpenAssignModal(product)} className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={stock.stock === 0}>
                                    Asignar Gasto
                                </button>
                            </div>
                        </div>
                    )})}
                </div>
            </Card>

            {isAssignModalOpen && productToAssign && (
                <AssignExpenseModal 
                    product={productToAssign}
                    onClose={() => setIsAssignModalOpen(false)}
                    onAssign={handleAssignExpense}
                    teachers={users.filter(u => u.profiles.includes(Profile.TEACHER) && u.activityStatus === 'Activo')}
                />
            )}

            {isAddModalOpen && (
                <AddProductModal
                    allProducts={products}
                    currentStockIds={miniEconomatoStock.map(s => s.id)}
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddProduct}
                />
            )}

            {isEditModalOpen && itemToEdit && (
                <EditStockModal
                    item={itemToEdit}
                    productName={productsMap.get(itemToEdit.id)?.name || ''}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleEditStock}
                />
            )}
        </div>
    );
};
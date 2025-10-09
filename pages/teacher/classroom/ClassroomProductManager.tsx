import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { Card } from '../../../components/Card';
import { Modal } from '../../../components/Modal';
import { PlusIcon, DownloadIcon } from '../../../components/icons';
import { ClassroomProduct } from '../../../types';
import { exportToCsv } from '../../../utils/export';

export const ClassroomProductManager: React.FC = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { classroomProducts, setClassroomProducts, classrooms } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ClassroomProduct | null>(null);

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
    const productsInClass = useMemo(() => classroomProducts.filter(p => p.classroomId === classroomId), [classroomProducts, classroomId]);

    const handleOpenModal = (product: ClassroomProduct | null = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = (productData: Partial<ClassroomProduct>) => {
        if (selectedProduct) { // Editing
            setClassroomProducts(classroomProducts.map(p => p.id === selectedProduct.id ? { ...p, ...productData } : p));
        } else { // Creating
            const newProduct: ClassroomProduct = {
                id: `cprod-${Date.now()}`,
                name: productData.name || '',
                reference: productData.reference || '',
                category: productData.category || '',
                classroomId: classroomId!,
            };
            setClassroomProducts([...classroomProducts, newProduct]);
        }
        setIsModalOpen(false);
        setSelectedProduct(null);
    };
    
    const handleDeleteProduct = (productId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar este producto del aula?")) {
            setClassroomProducts(classroomProducts.filter(p => p.id !== productId));
        }
    }

    const handleExport = () => {
        exportToCsv(`productos_${classroom?.name.replace(' ', '_')}.csv`, productsInClass);
    }

    if (!classroom) {
        return <Card title="Error"><p>Clase no encontrada. <Link to="/teacher/aula" className="text-primary-600">Volver a mis clases</Link>.</p></Card>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Productos de: {classroom.name}</h1>
                <div className="no-print flex items-center space-x-2">
                    <button onClick={handleExport} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center">
                        <DownloadIcon className="w-5 h-5 mr-1" /> Exportar a CSV
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nuevo Producto de Aula
                    </button>
                </div>
            </div>
            
            <Card title={`Listado de Productos Simulados (${productsInClass.length})`}>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                           <tr>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Referencia</th>
                                <th className="px-4 py-2">Categoría</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsInClass.map(product => (
                                <tr key={product.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-medium">{product.name}</td>
                                    <td className="px-4 py-2">{product.reference}</td>
                                    <td className="px-4 py-2">{product.category}</td>
                                    <td className="px-4 py-2 no-print">
                                        <button onClick={() => handleOpenModal(product)} className="text-primary-600 hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:underline ml-4">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && <ProductFormModal product={selectedProduct} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} />}
        </div>
    );
};

const ProductFormModal: React.FC<{ product: ClassroomProduct | null; onClose: () => void; onSave: (product: Partial<ClassroomProduct>) => void; }> = ({ product, onClose, onSave }) => {
    const [formState, setFormState] = useState({
        name: product?.name || '',
        reference: product?.reference || '',
        category: product?.category || '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({...formState, [e.target.name]: e.target.value});
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={product ? 'Editar Producto de Aula' : 'Nuevo Producto de Aula'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Nombre del Producto" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <input type="text" name="reference" value={formState.reference} onChange={handleChange} placeholder="Referencia" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <input type="text" name="category" value={formState.category} onChange={handleChange} placeholder="Categoría" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};
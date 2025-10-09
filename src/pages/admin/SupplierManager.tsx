import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { PlusIcon, DownloadIcon, WarningIcon, TrashIcon } from '../../components/icons';
import { Supplier, Product, Incident, Event, Order, ProductState, WarehouseStatus } from '../../types';
import { exportToCsv, printPage } from '../../utils/export';

const ALLERGENS_LIST = [
    "Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", 
    "Soja", "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", 
    "Sésamo", "Sulfitos", "Altramuces", "Moluscos"
];

const PREDEFINED_FAMILIES = [
    "ACEITES Y GRASAS", "AGUAS, REFRESCOS Y CERVEZAS", "ARROCES, PASTAS Y LEGUMBRES", "CAFÉS E INFUSIONES",
    "Carnes", "CONSERVAS", "DESTILADOS Y COCTELERÍA", "EMBUTIDOS", "ESPECIAS Y CONDIMENTOS",
    "FRUTOS SECOS", "HARINAS, SEMILLAS Y GRANOS", "LÁCTEOS Y HUEVOS", "LICORES Y APERITIVOS",
    "Marisco", "PASTELERÍA Y PANADERÍA", "Pato", "Pescados", "QUESOS", "SALSAS Y CREMAS", "VARIOS",
    "Vegetales", "VINOS", "NO ESTÁN EN LA LISTA/NUEVOS", "OTROS"
];

const PREDEFINED_CATEGORIES = [
    "ACEITES", "AGUAS", "ALGAS", "ARROCES", "AVES Y CAZA", "AZÚCARES", "CABRITO", "CACAO/CHOCOLATES",
    "CAFÉS", "CERDO", "CERVEZAS", "CONDIMENTOS", "CONSERVAS", "CORDERO", "CREMAS", "DESHIDRATADOS",
    "DESTILADOS Y COCTELERÍA", "EMBUTIDOS", "ESPECIAS", "FLORES", "FRUTAS", "FRUTAS CONFITADAS",
    "FRUTAS DESHIDRATADAS", "FRUTAS PROCESADAS", "FRUTOS SECOS", "GRANOS", "GRASAS", "HARINAS",
    "HIERBAS", "HUEVOS", "INFUSIONES", "LÁCTEOS", "LEGUMBRES", "LICORES Y APERITIVOS", "LIOFILIZADOS",
    "MARISCO", "MERMELADAS", "OTROS", "PASTAS", "PATO", "PESCADO", "PREPARADOS", "QUESOS", "REFRESCOS",
    "SALSAS", "SEMILLAS", "SETAS", "SIROPES", "VACUNO", "VERDURAS", "VINOS", "ZUMOS"
].sort();

const PRODUCT_STATES: ProductState[] = [
    'Fresco', 'Congelado', 'Otros', 'Conservas', 'Ahumado', 'Desalado', 'UHT', 'Esterilizado', 'Enlatado', 'Deshidratado'
];
const WAREHOUSE_STATUSES: WarehouseStatus[] = ['Disponible', 'Bajo Pedido', 'Descontinuado'];

const ProductFormModal: React.FC<{ product: Product | null; onClose: () => void; onSave: (product: Product) => void; allProducts: Product[]; allSuppliers: Supplier[] }> = ({ product, onClose, onSave, allProducts, allSuppliers }) => {
    const [formState, setFormState] = useState<Product>(product || { 
        id: '', name: '', description: '', reference: `REF-${Date.now().toString().slice(-6)}`, unit: 'Uds', suppliers: [], tax: 21, category: '', family: '', allergens: [], status: 'Activo', productState: 'Fresco', warehouseStatus: 'Disponible'
    });
    
    const [families, setFamilies] = useState<string[]>(() => [...new Set([...PREDEFINED_FAMILIES, ...allProducts.map(p => p.family).filter(f => f)])].sort());
    const [categories, setCategories] = useState<string[]>(() => [...new Set([...PREDEFINED_CATEGORIES, ...allProducts.map(p => p.category).filter(c => c)])].sort());

    const [addModalType, setAddModalType] = useState<'family' | 'category' | null>(null);
    const [removeModalType, setRemoveModalType] = useState<'family' | 'category' | null>(null);
    const [newListItemName, setNewListItemName] = useState('');

    const handleChange = (e: React.
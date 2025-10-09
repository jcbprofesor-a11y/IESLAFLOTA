import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Recipe, Product, RecipeIngredient } from '../../types';
import { PlusIcon, TrashIcon, PrinterIcon } from '../../components/icons';
import { Modal } from '../../components/Modal';
import { useCompany } from '../../contexts/CompanyContext';

const ALLERGENS_LIST = ["Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja", "Lácteos", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo", "Sulfitos", "Altramuces", "Moluscos"];

const LabelPreviewModal: React.FC<{ recipe: Recipe, company: any, onClose: () => void }> = ({ recipe, company, onClose }) => {
    const { products } = useData();
    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const allAllergens = useMemo(() => {
        const allergens = new Set<string>();
        recipe.ingredients.forEach(ing => {
            const product = productsMap.get(ing.productId);
            product?.allergens.forEach(a => allergens.add(a));
        });
        return Array.from(allergens);
    }, [recipe.ingredients, productsMap]);

    const printLabel = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const labelContent = document.getElementById('label-content')?.innerHTML;
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Imprimir Etiqueta</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @media print {
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            }
                        </style>
                    </head>
                    <body class="font-sans">${labelContent}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { // Timeout needed for content to render in some browsers
                 printWindow.print();
                 printWindow.close();
            }, 250);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Previsualización de Etiqueta" size="sm">
            <div id="label-content" className="w-full max-w-sm mx-auto border-2 border-black p-3 space-y-2 text-xs bg-white text-black">
                <div className="flex items-center space-x-3 border-b border-black pb-2">
                    <img src={company.printLogo} alt="Logo" className="h-10 w-auto" />
                    <h1 className="font-bold text-sm">{company.name}</h1>
                </div>
                <div>
                    <h2 className="text-center font-bold text-base uppercase tracking-wide">{recipe.name}</h2>
                </div>
                <div>
                    <p><span className="font-bold">Fecha de elaboración:</span> {new Date().toLocaleDateString()}</p>
                </div>
                <div className="border-t border-black pt-1">
                    <p><span className="font-bold">Ingredientes:</span> {recipe.ingredients.map(i => productsMap.get(i.productId)?.name).join(', ')}.</p>
                </div>
                {allAllergens.length > 0 && (
                     <div className="border-t border-black pt-1">
                        <p><span className="font-bold">ALÉRGENOS:</span> <span className="font-bold uppercase">{allAllergens.join(', ')}</span>.</p>
                    </div>
                )}
            </div>
             <div className="flex justify-end space-x-2 mt-6 no-print">
                <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md">Cerrar</button>
                <button onClick={printLabel} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"><PrinterIcon className="w-4 h-4 mr-2"/>Imprimir</button>
            </div>
        </Modal>
    );
};

export const RecipeForm: React.FC = () => {
    const { recipeId } = useParams<{ recipeId?: string }>();
    const navigate = useNavigate();
    const { recipes, setRecipes, products } = useData();
    const { currentUser } = useAuth();
    const { companyInfo } = useCompany();

    const [formState, setFormState] = useState<Omit<Recipe, 'id' | 'authorId'>>({
        name: '', description: '', photo: '', yieldAmount: 1, yieldUnit: 'raciones', category: '',
        ingredients: [], preparationSteps: '', keyPoints: '', isPublic: false, cost: 0, price: 0,
        customSection: { title: '', content: '' },
        presentation: '',
        temperature: 'Caliente',
        recommendedMarking: '',
        serviceType: '',
        clientDescription: '',
        serviceTime: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [showLabelPreview, setShowLabelPreview] = useState(false);

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    useEffect(() => {
        if (recipeId) {
            const existingRecipe = recipes.find(r => r.id === recipeId);
            if (existingRecipe) {
                setFormState(existingRecipe);
            }
        }
    }, [recipeId, recipes]);
    
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.status === 'Activo');
    }, [searchTerm, products]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'customSectionTitle') {
            setFormState(prev => ({ ...prev, customSection: { ...prev.customSection!, title: value } }));
        } else if (name === 'customSectionContent') {
            setFormState(prev => ({ ...prev, customSection: { ...prev.customSection!, content: value } }));
        } else {
            setFormState(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => setFormState(prev => ({ ...prev, photo: reader.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const addIngredient = (product: Product) => {
        if (!formState.ingredients.some(i => i.productId === product.id)) {
            const newIngredient: RecipeIngredient = { productId: product.id, quantity: 1, unit: product.unit };
            setFormState(prev => ({...prev, ingredients: [...prev.ingredients, newIngredient]}));
        }
        setSearchTerm('');
    };
    
    const handleIngredientChange = (index: number, field: 'quantity' | 'unit', value: string | number) => {
        const newIngredients = [...formState.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setFormState(prev => ({...prev, ingredients: newIngredients}));
    };

    const removeIngredient = (index: number) => {
        setFormState(prev => ({...prev, ingredients: prev.ingredients.filter((_, i) => i !== index)}));
    };
    
    const calculatedCost = useMemo(() => {
        return formState.ingredients.reduce((total, ing) => {
            const product = productsMap.get(ing.productId);
            const price = product?.suppliers.sort((a,b) => a.price - b.price)[0]?.price || 0;
            return total + (price * ing.quantity);
        }, 0);
    }, [formState.ingredients, productsMap]);

    const costPerServing = (calculatedCost / (formState.yieldAmount || 1));

    const allAllergens = useMemo(() => {
        const allergens = new Set<string>();
        formState.ingredients.forEach(ing => {
            const product = productsMap.get(ing.productId);
            product?.allergens.forEach(a => allergens.add(a));
        });
        return Array.from(allergens);
    }, [formState.ingredients, productsMap]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!currentUser) return;
        
        const recipeToSave: Recipe = {
            id: recipeId || `rec-${Date.now()}`,
            authorId: currentUser.id,
            ...formState,
            cost: calculatedCost
        };
        
        const newRecipes = recipeId 
            ? recipes.map(r => r.id === recipeId ? recipeToSave : r)
            : [...recipes, recipeToSave];
        
        setRecipes(newRecipes);
        navigate('/teacher/recipes');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">{recipeId ? 'Editar' : 'Nueva'} Ficha de Receta</h1>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda y Central */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="md:w-1/3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto de la Ficha</label>
                                    <div className="mt-1 aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                        {formState.photo ? <img src={formState.photo} alt="Vista previa" className="object-cover w-full h-full rounded-lg"/> : <span className="text-gray-400">Sin foto</span>}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2 text-sm"/>
                                </div>
                                <div className="md:w-2/3 space-y-4">
                                    <input type="text" placeholder="Nombre de la Ficha" value={formState.name} onChange={handleFormChange} name="name" required className="w-full text-xl font-bold p-2 border-b-2"/>
                                    <div className="flex gap-4">
                                        <input type="number" placeholder="Raciones" value={formState.yieldAmount} onChange={handleFormChange} name="yieldAmount" min="1" className="w-1/3 p-2 border rounded"/>
                                        <input type="text" placeholder="Unidad" value={formState.yieldUnit} onChange={handleFormChange} name="yieldUnit" className="w-1/3 p-2 border rounded"/>
                                        <input type="text" placeholder="Categoría" value={formState.category} onChange={handleFormChange} name="category" className="w-1/3 p-2 border rounded"/>
                                    </div>
                                    <textarea placeholder="Descripción corta" value={formState.description} onChange={handleFormChange} name="description" rows={2} className="w-full p-2 border rounded" />
                                </div>
                            </div>
                        </Card>

                        <Card title="Ingredientes (del Almacén Central)">
                            <div className="relative mb-4">
                                <input type="text" placeholder="Buscar producto para añadir..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700"/>
                                {searchTerm && (
                                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-b-md shadow-lg max-h-40 overflow-y-auto">
                                        {filteredProducts.map(p => <li key={p.id} onClick={() => addIngredient(p)} className="p-2 hover:bg-primary-100 cursor-pointer">{p.name}</li>)}
                                        {filteredProducts.length === 0 && <li className="p-2 text-gray-500">No se encontraron productos</li>}
                                    </ul>
                                )}
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {formState.ingredients.map((ing, index) => (
                                    <div key={ing.productId} className="grid grid-cols-12 gap-2 items-center">
                                        <span className="col-span-6">{productsMap.get(ing.productId)?.name}</span>
                                        <input type="number" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))} className="col-span-2 p-1 border rounded dark:bg-gray-700"/>
                                        <input type="text" value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="col-span-2 p-1 border rounded dark:bg-gray-700"/>
                                        <div className="col-span-2 flex justify-end"><button type="button" onClick={() => removeIngredient(index)} className="text-red-500 p-1"><TrashIcon className="w-5 h-5"/></button></div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Elaboración">
                            <textarea placeholder="Pasos detallados de la receta..." value={formState.preparationSteps} onChange={handleFormChange} name="preparationSteps" rows={10} required className="w-full p-2 border rounded" />
                        </Card>
                        
                        <Card title="Instrucciones de Servicio">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Presentación (plato, copa...)</label>
                                    <input type="text" name="presentation" value={formState.presentation || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Temperatura de Servicio</label>
                                    <select name="temperature" value={formState.temperature || 'Caliente'} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded">
                                        <option value="Caliente">Caliente</option>
                                        <option value="Frio">Frío</option>
                                        <option value="Ambiente">Ambiente</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Marcaje Recomendado</label>
                                    <input type="text" name="recommendedMarking" value={formState.recommendedMarking || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Tiempo de Pase</label>
                                    <input type="text" name="serviceTime" value={formState.serviceTime || ''} placeholder="Ej: 5 min" onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Tipo de Servicio</label>
                                    <input type="text" name="serviceType" value={formState.serviceType || ''} placeholder="Inglesa, salseado, terminado en sala..." onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Breve Descripción para el Cliente</label>
                                    <textarea name="clientDescription" value={formState.clientDescription || ''} rows={3} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded" />
                                </div>
                            </div>
                        </Card>

                        <Card title="Notas Importantes">
                            <textarea placeholder="Advertencias, maridajes, conservación, etc." value={formState.keyPoints} onChange={handleFormChange} name="keyPoints" rows={3} className="w-full p-2 border rounded" />
                        </Card>

                        <Card title={<input type="text" value={formState.customSection?.title || ''} onChange={handleFormChange} name="customSectionTitle" placeholder="Título de Sección Personalizable" className="text-xl font-bold p-1 w-full"/>}>
                             <textarea placeholder="Contenido de la sección personalizable..." value={formState.customSection?.content || ''} onChange={handleFormChange} name="customSectionContent" rows={3} className="w-full p-2 border rounded" />
                        </Card>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-6">
                        <Card title="Coste y Alérgenos">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm">Coste Total</p>
                                    <p className="font-bold text-lg">{calculatedCost.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                                </div>
                                <div>
                                    <p className="text-sm">Coste por Ración</p>
                                    <p className="font-bold text-lg">{costPerServing.toLocaleString('es-ES', {style: 'currency', currency: 'EUR'})}</p>
                                </div>
                                <div>
                                    <label>Precio de Venta</label>
                                    <input type="number" step="0.01" placeholder="Precio" value={formState.price} onChange={handleFormChange} name="price" required className="w-full mt-1 p-2 border rounded"/>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Alérgenos Detectados</h4>
                                    {allAllergens.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {allAllergens.map(a => <span key={a} className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">{a}</span>)}
                                        </div>
                                    ) : <p className="text-sm text-gray-500">Sin alérgenos detectados.</p>}
                                </div>
                            </div>
                        </Card>
                        
                        <Card title="Acciones">
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={formState.isPublic} onChange={e => setFormState({...formState, isPublic: e.target.checked})} className="h-4 w-4 rounded" />
                                    <span className="ml-2 text-sm">Hacer ficha pública para otros profesores</span>
                                </label>
                                <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 font-bold">Guardar Ficha</button>
                                <button type="button" onClick={() => setShowLabelPreview(true)} className="w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 flex items-center justify-center">
                                    <PrinterIcon className="w-5 h-5 mr-2"/> Generar Etiqueta
                                </button>
                                <button type="button" onClick={() => navigate('/teacher/recipes')} className="w-full bg-gray-200 dark:bg-gray-600 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
            {showLabelPreview && <LabelPreviewModal recipe={formState as Recipe} company={companyInfo} onClose={() => setShowLabelPreview(false)} />}
        </div>
    );
};
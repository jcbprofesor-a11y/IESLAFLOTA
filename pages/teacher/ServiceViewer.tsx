import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Service, ServiceGroup, User, Profile, ServiceRole, Recipe, Order, Event } from '../../types';
import { Modal } from '../../components/Modal';
import { PlusIcon, TrashIcon, PrinterIcon } from '../../components/icons';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SERVICE_ROLES: ServiceRole[] = ['Cocina', 'Postres', 'Servicios (Sala)', 'Cafetería'];

// --- DETAIL VIEW COMPONENT ---
const ServiceDetailView: React.FC<{ service: Service; onBack: () => void }> = ({ service, onBack }) => {
    const { services, setServices, serviceGroups, users, recipes, products, setOrders, events } = useData();
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const navigate = useNavigate();

    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const recipesMap = useMemo(() => new Map(recipes.map(r => [r.id, r])), [recipes]);
    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const group = useMemo(() => serviceGroups.find(g => g.id === service.serviceGroupId), [serviceGroups, service.serviceGroupId]);
    const teachersInGroup = useMemo(() => group?.teacherIds.map(id => usersMap.get(id)).filter((u): u is User => !!u) || [], [group, usersMap]);

    const handleRoleChange = (role: ServiceRole, userId: string) => {
        const updatedService = { ...service, roles: { ...service.roles, [role]: userId } };
        setServices(services.map(s => s.id === service.id ? updatedService : s));
    };

    const handleAddRecipe = (recipeId: string) => {
        const updatedService = { ...service, menu: [...service.menu, { recipeId }] };
        setServices(services.map(s => s.id === service.id ? updatedService : s));
    };

    const handleRemoveRecipe = (recipeId: string) => {
        const updatedService = { ...service, menu: service.menu.filter(item => item.recipeId !== recipeId) };
        setServices(services.map(s => s.id === service.id ? updatedService : s));
    };

    const generateAllergenDoc = () => {
        const doc = new jsPDF();
        doc.text(`Informe de Alérgenos - ${service.name}`, 14, 15);
        doc.text(`Fecha: ${new Date(service.date).toLocaleDateString()}`, 14, 22);

        const body = service.menu.flatMap(item => {
            const recipe = recipesMap.get(item.recipeId);
            if (!recipe) return [];
            const allergens = new Set<string>();
            recipe.ingredients.forEach(ing => {
                productsMap.get(ing.productId)?.allergens.forEach(a => allergens.add(a));
            });
            return {
                name: recipe.name,
                allergens: Array.from(allergens).join(', ') || 'Ninguno'
            };
        }).map(r => [r.name, r.allergens]);

        (doc as any).autoTable({ startY: 30, head: [['Plato', 'Alérgenos']], body });
        doc.save(`alergenos_${service.name}.pdf`);
    };
    
    const generateServiceOrderDoc = () => {
        const doc = new jsPDF();
        doc.text(`Orden de Servicio - ${service.name}`, 14, 15);
        doc.text(`Fecha: ${new Date(service.date).toLocaleDateString()}`, 14, 22);

        const body = service.menu.map(item => {
            const r = recipesMap.get(item.recipeId);
            if (!r) return ['Receta no encontrada', '', '', '', '', ''];
            const allergens = new Set<string>();
            r.ingredients.forEach(ing => {
                productsMap.get(ing.productId)?.allergens.forEach(a => allergens.add(a));
            });
            return [
                r.name,
                Array.from(allergens).join(', ') || '-',
                r.presentation || '-',
                `${r.temperature || '-'} / ${r.serviceTime || '-'}`,
                r.recommendedMarking || '-',
                r.serviceType || '-',
                r.clientDescription || '-'
            ];
        });

        (doc as any).autoTable({ startY: 30, head: [['Plato', 'Alérgenos', 'Presentación', 'Temp/Pase', 'Marcaje', 'Servicio', 'Descripción Cliente']], body });
        doc.save(`orden_servicio_${service.name}.pdf`);
    };

    const generateDraftOrder = () => {
        const activeEvent = events.find(e => e.type === 'Regular' && new Date(e.endDate) > new Date());
        if (!activeEvent) {
            alert("No hay un evento de pedido 'Regular' activo para asociar el borrador.");
            return;
        }

        const aggregatedIngredients = new Map<string, number>();
        service.menu.forEach(item => {
            const recipe = recipesMap.get(item.recipeId);
            recipe?.ingredients.forEach(ing => {
                aggregatedIngredients.set(ing.productId, (aggregatedIngredients.get(ing.productId) || 0) + ing.quantity);
            });
        });

        const newOrder: Order = {
            id: `ord-draft-${Date.now()}`,
            userId: teachersInGroup[0]?.id || '', // Assign to first teacher in group
            date: new Date().toISOString(),
            status: 'Borrador',
            eventId: activeEvent.id,
            items: Array.from(aggregatedIngredients.entries()).map(([productId, quantity]) => ({
                productId, quantity, price: productsMap.get(productId)?.suppliers[0]?.price || 0, tax: productsMap.get(productId)?.tax || 0
            })),
            notes: `Borrador generado automáticamente desde el servicio: ${service.name}`
        };
        setOrders(prev => [...prev, newOrder]);
        alert('Borrador de pedido generado. Serás redirigido para editarlo.');
        navigate(`/teacher/order-portal/edit/${newOrder.id}`);
    };

    return (
        <div>
            <button onClick={onBack} className="text-sm text-primary-600 hover:underline mb-4">&larr; Volver a mis servicios</button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Menú del Servicio">
                        <button onClick={() => setIsRecipeModalOpen(true)} className="bg-blue-500 text-white px-3 py-1 rounded mb-4">Añadir Plato</button>
                        {service.menu.map(item => {
                            const recipe = recipesMap.get(item.recipeId);
                            return <div key={item.recipeId} className="flex justify-between items-center p-2 border-b">{recipe?.name}<button onClick={() => handleRemoveRecipe(item.recipeId)}><TrashIcon className="w-4 h-4 text-red-500"/></button></div>
                        })}
                    </Card>
                    <Card title="Documentación de Salida">
                        <div className="flex space-x-4">
                            <button onClick={generateAllergenDoc} className="bg-gray-600 text-white py-2 px-4 rounded-md flex items-center"><PrinterIcon className="w-5 h-5 mr-1"/> Informe de Alérgenos</button>
                            <button onClick={generateServiceOrderDoc} className="bg-gray-600 text-white py-2 px-4 rounded-md flex items-center"><PrinterIcon className="w-5 h-5 mr-1"/> Orden de Servicio</button>
                        </div>
                    </Card>
                    <Card title="Generación de Pedido">
                         <button onClick={generateDraftOrder} className="bg-green-600 text-white py-2 px-4 rounded-md">Generar Borrador de Pedido</button>
                    </Card>
                </div>
                <div>
                    <Card title="Asignación de Roles">
                        {SERVICE_ROLES.map(role => (
                            <div key={role} className="mb-2">
                                <label className="text-sm font-semibold">{role}</label>
                                <select value={service.roles[role] || ''} onChange={e => handleRoleChange(role, e.target.value)} className="w-full p-1 border rounded">
                                    <option value="">-- Sin Asignar --</option>
                                    {teachersInGroup.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
            {isRecipeModalOpen && <RecipeSelectorModal recipes={recipes} onSelect={handleAddRecipe} onClose={() => setIsRecipeModalOpen(false)} />}
        </div>
    );
};

const RecipeSelectorModal: React.FC<{ recipes: Recipe[], onClose: () => void, onSelect: (recipeId: string) => void }> = ({ recipes, onClose, onSelect }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="Seleccionar Receta">
            <div className="max-h-96 overflow-y-auto">
                {recipes.map(r => (
                    <div key={r.id} onClick={() => { onSelect(r.id); onClose(); }} className="p-2 hover:bg-gray-100 cursor-pointer">{r.name}</div>
                ))}
            </div>
        </Modal>
    );
};

// --- LIST VIEW COMPONENT ---
export const ServiceViewer: React.FC = () => {
    const { services, serviceGroups } = useData();
    const { currentUser } = useAuth();
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const myServices = useMemo(() => {
        if (!currentUser) return [];
        const myGroupIds = new Set(serviceGroups.filter(g => g.teacherIds.includes(currentUser.id)).map(g => g.id));
        return services.filter(s => myGroupIds.has(s.serviceGroupId));
    }, [services, serviceGroups, currentUser]);

    if (selectedService) {
        return <ServiceDetailView service={selectedService} onBack={() => setSelectedService(null)} />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Planificador de Servicios</h1>
            <Card title="Mis Próximos Servicios">
                <div className="space-y-3">
                    {myServices.map(service => (
                        <div key={service.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{service.name}</h3>
                                <p className="text-sm">{new Date(service.date).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedService(service)} className="bg-primary-600 text-white py-2 px-4 rounded-md">Gestionar Servicio</button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
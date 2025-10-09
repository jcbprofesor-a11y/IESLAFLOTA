
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { PlusIcon, TrashIcon, PencilIcon, UsersIcon, EventIcon } from '../../components/icons';
import { ServiceGroup, Service, User, Profile, ServiceRole } from '../../types';

// --- SERVICE GROUP MANAGEMENT ---
const ServiceGroupManager: React.FC = () => {
    const { serviceGroups, setServiceGroups, users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ServiceGroup | null>(null);

    const teachers = useMemo(() => users.filter(u => u.profiles.includes(Profile.TEACHER)), [users]);
    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const handleSave = (groupData: Partial<ServiceGroup>) => {
        if (selectedGroup) {
            setServiceGroups(serviceGroups.map(g => g.id === selectedGroup.id ? { ...g, ...groupData } : g));
        } else {
            const newGroup: ServiceGroup = { id: `sg-${Date.now()}`, name: groupData.name!, teacherIds: groupData.teacherIds! };
            setServiceGroups([...serviceGroups, newGroup]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (groupId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar este grupo?")) {
            setServiceGroups(serviceGroups.filter(g => g.id !== groupId));
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setSelectedGroup(null); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center"><PlusIcon className="w-5 h-5 mr-1" /> Nuevo Grupo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceGroups.map(group => (
                    <div key={group.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold">{group.name}</h3>
                            <div className="space-x-2">
                                <button onClick={() => { setSelectedGroup(group); setIsModalOpen(true); }}><PencilIcon className="w-4 h-4 text-gray-500"/></button>
                                <button onClick={() => handleDelete(group.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                            </div>
                        </div>
                        <ul className="text-sm mt-2 list-disc list-inside">
                            {group.teacherIds.map(id => <li key={id}>{usersMap.get(id) || 'Desconocido'}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
            {isModalOpen && <ServiceGroupFormModal group={selectedGroup} teachers={teachers} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

const ServiceGroupFormModal: React.FC<{ group: ServiceGroup | null; teachers: User[]; onClose: () => void; onSave: (data: Partial<ServiceGroup>) => void; }> = ({ group, teachers, onClose, onSave }) => {
    const [name, setName] = useState(group?.name || '');
    const [teacherIds, setTeacherIds] = useState<string[]>(group?.teacherIds || []);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ name, teacherIds }); };
    return (
        <Modal isOpen={true} onClose={onClose} title={group ? 'Editar Grupo' : 'Nuevo Grupo de Servicio'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del Grupo" required className="w-full p-2 border rounded"/>
                {/* FIX: Explicitly type `option` to resolve type inference issue. */}
                <select multiple value={teacherIds} onChange={e => setTeacherIds(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="w-full h-32 p-2 border rounded">
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <div className="flex justify-end"><button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Guardar</button></div>
            </form>
        </Modal>
    );
};


// --- SERVICE MANAGEMENT ---
const ServiceManager: React.FC = () => {
    const { services, setServices, serviceGroups } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const serviceGroupsMap = useMemo(() => new Map(serviceGroups.map(g => [g.id, g.name])), [serviceGroups]);

    const handleSave = (serviceData: Partial<Service>) => {
        if (selectedService) {
            setServices(services.map(s => s.id === selectedService.id ? { ...s, ...serviceData } : s));
        } else {
            // FIX: Add the required 'roles' property to the new Service object.
            const newService: Service = { id: `svc-${Date.now()}`, name: serviceData.name!, date: serviceData.date!, serviceGroupId: serviceData.serviceGroupId!, menu: [], roles: {}, status: 'Planificación' };
            setServices([...services, newService]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (serviceId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar este servicio?")) {
            setServices(services.filter(s => s.id !== serviceId));
        }
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => { setSelectedService(null); setIsModalOpen(true); }} className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center"><PlusIcon className="w-5 h-5 mr-1" /> Nuevo Servicio</button>
            </div>
            <table className="w-full text-sm">
                <thead><tr><th className="text-left p-2">Nombre</th><th className="text-left p-2">Fecha</th><th className="text-left p-2">Grupo Asignado</th><th className="text-left p-2">Acciones</th></tr></thead>
                <tbody>
                    {services.map(service => (
                        <tr key={service.id} className="border-t">
                            <td className="p-2">{service.name}</td>
                            <td className="p-2">{new Date(service.date).toLocaleDateString()}</td>
                            <td className="p-2">{serviceGroupsMap.get(service.serviceGroupId) || 'N/A'}</td>
                            <td className="p-2 space-x-2">
                                <button onClick={() => { setSelectedService(service); setIsModalOpen(true); }}><PencilIcon className="w-4 h-4 text-gray-500"/></button>
                                <button onClick={() => handleDelete(service.id)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isModalOpen && <ServiceFormModal service={selectedService} serviceGroups={serviceGroups} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

const ServiceFormModal: React.FC<{ service: Service | null; serviceGroups: ServiceGroup[]; onClose: () => void; onSave: (data: Partial<Service>) => void; }> = ({ service, serviceGroups, onClose, onSave }) => {
    const [formState, setFormState] = useState({
        name: service?.name || '',
        date: service ? new Date(service.date).toISOString().substring(0, 10) : '',
        serviceGroupId: service?.serviceGroupId || '',
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormState({...formState, [e.target.name]: e.target.value});
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...formState, date: new Date(formState.date).toISOString() }); };

    return (
        <Modal isOpen={true} onClose={onClose} title={service ? 'Editar Servicio' : 'Nuevo Servicio'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Nombre del Servicio" required className="w-full p-2 border rounded"/>
                <input type="date" name="date" value={formState.date} onChange={handleChange} required className="w-full p-2 border rounded"/>
                <select name="serviceGroupId" value={formState.serviceGroupId} onChange={handleChange} required className="w-full p-2 border rounded">
                    <option value="">-- Asignar Grupo --</option>
                    {serviceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <div className="flex justify-end"><button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Guardar</button></div>
            </form>
        </Modal>
    );
};


// --- MAIN COMPONENT ---
export const ServicePlanner: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'groups' | 'services'>('groups');

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Planificación de Servicios</h1>
            <Card>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('groups')} className={`${activeTab === 'groups' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            <UsersIcon className="w-5 h-5 mr-2" /> Grupos de Servicio
                        </button>
                        <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            <EventIcon className="w-5 h-5 mr-2" /> Servicios
                        </button>
                    </nav>
                </div>
                <div className="mt-4">
                    {activeTab === 'groups' && <ServiceGroupManager />}
                    {activeTab === 'services' && <ServiceManager />}
                </div>
            </Card>
        </div>
    );
};

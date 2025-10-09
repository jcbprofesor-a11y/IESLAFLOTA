import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { PlusIcon, WarningIcon, DownloadIcon } from '../../components/icons';
import { User, Profile, Assignment, Group, Module, getProfileDisplayName } from '../../types';
import { exportToCsv } from '../../utils/export';

export const TeacherManager: React.FC = () => {
    const { users, setUsers, assignments, groups, modules } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteStep, setDeleteStep] = useState(1);

    const staff = useMemo(() => users.filter(u => 
        !u.profiles.includes(Profile.CREATOR) && 
        !u.profiles.includes(Profile.STUDENT)
    ), [users]);

    const handleOpenFormModal = (user: User | null = null) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };
    
    const handleOpenDeleteModal = (user: User) => {
        setSelectedUser(user);
        setDeleteStep(1);
        setIsDeleteModalOpen(true);
    };

    const handleSaveUser = (userData: Partial<User>) => {
        if (selectedUser) { // Editing
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
        } else { // Creating
            const newUser: User = {
                id: `user-${Date.now()}`,
                name: userData.name || '',
                email: userData.email || '',
                password: userData.password || 'password',
                avatar: `https://i.pravatar.cc/150?u=${userData.email}`,
                profiles: userData.profiles || [],
                activityStatus: 'Activo',
                locationStatus: 'En el centro',
                ...userData
            };
            setUsers([...users, newUser]);
        }
        setIsFormModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleToggleStatus = (user: User) => {
        const newStatus = user.activityStatus === 'Activo' ? 'De Baja' : 'Activo';
        const newLocationStatus = newStatus === 'Activo' ? 'En el centro' : 'Fuera del centro';
        setUsers(users.map(u => u.id === user.id ? { ...u, activityStatus: newStatus, locationStatus: newLocationStatus } : u));
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            setUsers(users.filter(u => u.id !== selectedUser.id));
        }
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
    };

    const handleExport = () => {
        exportToCsv('personal.csv', staff.map(s => ({...s, password: '***'})));
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Gestión de Personal</h1>
                <div className="no-print flex items-center">
                    <button onClick={handleExport} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 mr-2 flex items-center">
                        <DownloadIcon className="w-5 h-5 mr-1" /> Exportar a CSV
                    </button>
                    <button onClick={() => handleOpenFormModal()} className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Nuevo Personal
                    </button>
                </div>
            </div>
            
            <Card title="Listado de Personal">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                           <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Perfiles</th>
                                <th className="px-6 py-3 text-center">Estado Actividad</th>
                                <th className="px-6 py-3 text-center">Ubicación</th>
                                <th className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map(user => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.profiles.map(p => getProfileDisplayName(p)).join(', ')}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.activityStatus === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.activityStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       {user.locationStatus === 'Fuera del centro' && (
                                         <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">
                                            {user.locationStatus}
                                        </span>
                                       )}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-4 no-print">
                                        <button onClick={() => handleOpenFormModal(user)} className="text-blue-600 dark:text-blue-500 hover:underline">Ver/Editar</button>
                                        <button onClick={() => handleToggleStatus(user)} className={user.activityStatus === 'Activo' ? 'text-orange-600 hover:underline' : 'text-green-600 hover:underline'}>
                                            {user.activityStatus === 'Activo' ? 'Dar de Baja' : 'Reactivar'}
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(user)} className="text-red-600 dark:text-red-500 hover:underline">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isFormModalOpen && (
                <UserFormModal 
                    user={selectedUser} 
                    onClose={() => setIsFormModalOpen(false)} 
                    onSave={handleSaveUser}
                    allAssignments={assignments}
                    allGroups={groups}
                    allModules={modules}
                />
            )}
            
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmar Eliminación">
                {deleteStep === 1 ? (
                    <div>
                        <div className="text-center">
                            <WarningIcon className="w-16 h-16 text-red-500 mx-auto"/>
                            <p className="text-lg font-semibold my-4">¿Seguro que quieres eliminar a {selectedUser?.name}?</p>
                            <p className="text-gray-500">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={() => setDeleteStep(2)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Sí, eliminar</button>
                        </div>
                    </div>
                ) : (
                     <div>
                        <p className="mb-4 text-center">Para confirmar, haz clic de nuevo en el botón de eliminar.</p>
                        <div className="mt-6 flex justify-end">
                             <button onClick={handleDeleteUser} className="w-full px-4 py-2 bg-red-600 text-white rounded-md">Confirmar Eliminación Permanente</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const UserFormModal: React.FC<{ 
    user: User | null; 
    onClose: () => void; 
    onSave: (user: Partial<User>) => void; 
    allAssignments: Assignment[],
    allGroups: Group[],
    allModules: Module[]
}> = ({ user, onClose, onSave, allAssignments, allGroups, allModules }) => {
    const [formState, setFormState] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        profiles: user?.profiles || [],
        contractType: user?.contractType || 'Fijo',
        roleType: user?.roleType || 'Titular',
    });

    const userAssignments = useMemo(() => {
        if (!user || !user.profiles.includes(Profile.TEACHER)) return [];
        const groupMap: Map<string, Group> = new Map(allGroups.map(g => [g.id, g]));
        const moduleMap: Map<string, Module> = new Map(allModules.map(m => [m.id, m]));
        return allAssignments
            .filter(a => a.userId === user.id)
            .map(a => {
                const group = groupMap.get(a.groupId);
                const module = group ? moduleMap.get(group.moduleId) : undefined;
                return {
                    groupId: a.groupId,
                    groupName: group?.name || 'Desconocido',
                    moduleName: module?.name || 'Desconocido'
                };
            });
    }, [user, allAssignments, allGroups, allModules]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormState({...formState, [e.target.name]: e.target.value});
    }

    const handleProfileChange = (profile: Profile) => {
        const newProfiles = formState.profiles.includes(profile)
            ? formState.profiles.filter(p => p !== profile)
            : [...formState.profiles, profile];
        setFormState({ ...formState, profiles: newProfiles });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.profiles.length === 0) {
            alert("Por favor, selecciona al menos un perfil.");
            return;
        }
        onSave({ ...formState, password: formState.password || undefined });
    };

    const assignableProfiles = [Profile.ADMIN, Profile.ALMACEN, Profile.TEACHER];

    return (
        <Modal isOpen={true} onClose={onClose} title={user ? 'Editar Personal' : 'Nuevo Personal'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" value={formState.name} onChange={handleChange} placeholder="Nombre y Apellidos" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <input type="email" name="email" value={formState.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <input type="password" name="password" value={formState.password} onChange={handleChange} placeholder={user ? "Nueva contraseña (opcional)" : "Contraseña"} required={!user} className="w-full p-2 border rounded dark:bg-gray-700"/>
                
                <div>
                    <label className="font-medium">Perfiles</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {assignableProfiles.map(p => (
                            <label key={p} className="flex items-center space-x-2 p-2 border rounded-md dark:border-gray-600">
                                <input type="checkbox" checked={formState.profiles.includes(p)} onChange={() => handleProfileChange(p)} />
                                <span className="text-sm">{getProfileDisplayName(p)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {formState.profiles.includes(Profile.TEACHER) && (
                    <div className="grid grid-cols-2 gap-4">
                        <select name="contractType" value={formState.contractType} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700">
                            <option value="Fijo">Fijo</option>
                            <option value="Interino">Interino</option>
                        </select>
                         <select name="roleType" value={formState.roleType} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700">
                            <option value="Titular">Titular</option>
                            <option value="Sustituto">Sustituto</option>
                        </select>
                    </div>
                )}
                
                {userAssignments.length > 0 && (
                    <div className="pt-2">
                        <h4 className="font-semibold text-sm">Módulos Asignados</h4>
                        <ul className="list-disc list-inside text-xs mt-1 bg-gray-100 dark:bg-gray-700 p-2 rounded-md max-h-24 overflow-y-auto">
                            {userAssignments.map(a => <li key={a.groupId}>{a.moduleName} - {a.groupName}</li>)}
                        </ul>
                    </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { ProfileIcon, ShieldCheckIcon, LockClosedIcon, BookIcon, ClassroomIcon } from '../../components/icons';
import { Avatar } from '../../components/Avatar';
import { Profile, getProfileDisplayName, Message } from '../../types';

export const MyProfile: React.FC = () => {
    const { currentUser, selectedProfile, updateCurrentUser, selectProfile } = useAuth();
    const { users, setUsers, setMessages } = useData();

    const [personalInfo, setPersonalInfo] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        secondaryPhone: currentUser?.secondaryPhone || '',
        address: currentUser?.address || '',
        avatar: currentUser?.avatar || '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    if (!currentUser) return <p>Cargando perfil...</p>;

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setAvatarPreview(result);
                setPersonalInfo(prev => ({ ...prev, avatar: result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePersonalInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData = {
            name: personalInfo.name,
            phone: personalInfo.phone,
            secondaryPhone: personalInfo.secondaryPhone,
            address: personalInfo.address,
            avatar: personalInfo.avatar,
        };
        
        updateCurrentUser(updatedData);
        setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
        alert("Información personal actualizada.");
    };
    
    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser.password && passwordInfo.currentPassword !== currentUser.password) {
            alert("La contraseña actual es incorrecta.");
            return;
        }
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            alert("Las nuevas contraseñas no coinciden.");
            return;
        }
        if (!passwordInfo.newPassword) {
            alert("La nueva contraseña no puede estar vacía.");
            return;
        }

        const updatedData = { password: passwordInfo.newPassword };
        updateCurrentUser(updatedData);
        setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));

        const newMessage: Message = {
            id: `msg-sys-${Date.now()}`,
            senderId: 'system',
            recipientIds: [currentUser.id],
            subject: 'Actualización de Seguridad de la Cuenta',
            body: 'Tu contraseña ha sido actualizada con éxito.',
            date: new Date().toISOString(),
            readBy: {},
        };
        setMessages(prev => [...prev, newMessage]);
        
        alert("Contraseña actualizada con éxito. Recibirás un mensaje de confirmación.");
        setPasswordInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Mi Perfil</h1>
            
            {currentUser.profiles.length > 1 && (
                <Card title="Perfiles de Acceso" className="mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.values(Profile).map(profile => {
                            const hasProfile = currentUser.profiles.includes(profile);
                            const isSelected = selectedProfile === profile;
                            return (
                                <button
                                    key={profile}
                                    disabled={!hasProfile}
                                    onClick={() => hasProfile && selectProfile(profile)}
                                    className={`p-4 rounded-lg text-center transition-transform transform hover:scale-105 ${
                                        isSelected ? 'bg-primary-600 text-white shadow-lg' :
                                        hasProfile ? 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 shadow' :
                                        'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {!hasProfile && <LockClosedIcon className="w-5 h-5 mx-auto mb-1 text-gray-400" />}
                                    <span className="font-semibold">{getProfileDisplayName(profile)}</span>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Información Personal" icon={<ProfileIcon className="w-8 h-8" />}>
                        <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                            <div className="flex items-center space-x-4">
                               <Avatar user={{ ...currentUser, avatar: avatarPreview || personalInfo.avatar }} className="w-20 h-20" />
                               <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarChange} accept="image/*"/>
                               <label htmlFor="avatar-upload" className="bg-gray-200 dark:bg-gray-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Cambiar Foto</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm">Nombre y Apellidos</label>
                                    <input type="text" value={personalInfo.name} onChange={e => setPersonalInfo({...personalInfo, name: e.target.value})} className="w-full mt-1 p-2 border rounded"/>
                                </div>
                                <div>
                                    <label className="block text-sm">Correo Electrónico</label>
                                    <input type="email" value={currentUser.email} readOnly className="w-full mt-1 p-2 border rounded bg-gray-100 dark:bg-gray-800"/>
                                </div>
                                 <div>
                                    <label className="block text-sm">Teléfono Principal</label>
                                    <input type="tel" value={personalInfo.phone} onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})} className="w-full mt-1 p-2 border rounded"/>
                                </div>
                                 <div>
                                    <label className="block text-sm">Teléfono Secundario</label>
                                    <input type="tel" value={personalInfo.secondaryPhone} onChange={e => setPersonalInfo({...personalInfo, secondaryPhone: e.target.value})} className="w-full mt-1 p-2 border rounded"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm">Dirección</label>
                                    <textarea value={personalInfo.address} onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} rows={2} className="w-full mt-1 p-2 border rounded"/>
                                </div>
                            </div>
                             <div className="text-right">
                                <button type="submit" className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700">Guardar Cambios</button>
                            </div>
                        </form>
                    </Card>

                    <Card title="Seguridad" icon={<ShieldCheckIcon className="w-8 h-8"/>}>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm">Contraseña Actual</label>
                                <input type="password" value={passwordInfo.currentPassword} onChange={e => setPasswordInfo({...passwordInfo, currentPassword: e.target.value})} className="w-full mt-1 p-2 border rounded" required={!!currentUser.password} />
                            </div>
                            <div>
                                <label className="block text-sm">Nueva Contraseña</label>
                                <input type="password" value={passwordInfo.newPassword} onChange={e => setPasswordInfo({...passwordInfo, newPassword: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                            </div>
                             <div>
                                <label className="block text-sm">Confirmar Nueva Contraseña</label>
                                <input type="password" value={passwordInfo.confirmPassword} onChange={e => setPasswordInfo({...passwordInfo, confirmPassword: e.target.value})} className="w-full mt-1 p-2 border rounded" />
                            </div>
                             <div className="text-right">
                                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Cambiar Contraseña</button>
                            </div>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    {currentUser.profiles.includes(Profile.TEACHER) && (
                        <Card title="Información de Profesor" icon={<BookIcon className="w-8 h-8" />}>
                            <div className="space-y-3 text-sm">
                                <div><span className="font-semibold">Tipo:</span> {currentUser.contractType}</div>
                                <div><span className="font-semibold">Estatus:</span> {currentUser.roleType}</div>
                                <div><span className="font-semibold">Estado de Actividad:</span> {currentUser.activityStatus}</div>
                                <p className="text-xs text-gray-500 pt-2 border-t mt-2">Esta información es de solo lectura y la gestiona el Administrador.</p>
                            </div>
                        </Card>
                    )}
                    {currentUser.profiles.includes(Profile.STUDENT) && (
                        <Card title="Información de Alumno" icon={<ClassroomIcon className="w-8 h-8" />}>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-semibold">Rol de Simulación:</span> {
                                        currentUser.studentSimulatedProfile
                                        ? getProfileDisplayName(currentUser.studentSimulatedProfile)
                                        : 'Sin Asignar'
                                    }
                                </div>
                                <div>
                                    <span className="font-semibold">Estado de Actividad:</span> {
                                         currentUser.activityStatus === 'De Baja'
                                         ? 'De Baja'
                                         : currentUser.studentSimulatedProfile
                                             ? 'Puede comenzar la práctica'
                                             : 'Esperando asignación de rol'
                                    }
                                </div>
                                <p className="text-xs text-gray-500 pt-2 border-t mt-2">Esta información es de solo lectura y la gestiona tu Profesor.</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { PlusIcon, TrashIcon, PencilIcon } from '../../components/icons';
import { Classroom, User, Profile } from '../../types';

const ClassroomFormModal: React.FC<{
    classroom: Classroom | null;
    teachers: User[];
    onClose: () => void;
    onSave: (classroomData: Partial<Classroom>) => void;
}> = ({ classroom, teachers, onClose, onSave }) => {
    const [name, setName] = useState(classroom?.name || '');
    const [tutorId, setTutorId] = useState(classroom?.tutorId || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, tutorId });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={classroom ? 'Editar Aula de Práctica' : 'Nueva Aula de Práctica'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nombre del Aula</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Simulador de Almacén 1º Cocina"
                        className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Asignar Profesor Tutor</label>
                    <select
                        value={tutorId}
                        onChange={(e) => setTutorId(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700"
                        required
                    >
                        <option value="">-- Seleccionar un Profesor --</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};

export const ClassroomManager: React.FC = () => {
    const { classrooms, setClassrooms, users, setUsers } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

    const teachers = useMemo(() => users.filter(u => u.profiles.includes(Profile.TEACHER)), [users]);
    const usersMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    
    const studentCountByClassroom = useMemo(() => {
        const counts = new Map<string, number>();
        users.forEach(user => {
            if(user.classroomId) {
                counts.set(user.classroomId, (counts.get(user.classroomId) || 0) + 1);
            }
        });
        return counts;
    }, [users]);

    const handleOpenModal = (classroom: Classroom | null = null) => {
        setSelectedClassroom(classroom);
        setIsModalOpen(true);
    };

    const handleSaveClassroom = (classroomData: Partial<Classroom>) => {
        if (selectedClassroom) {
            setClassrooms(classrooms.map(c => c.id === selectedClassroom.id ? { ...c, ...classroomData } : c));
        } else {
            const newClassroom: Classroom = {
                id: `cls-${Date.now()}`,
                name: classroomData.name!,
                tutorId: classroomData.tutorId!,
            };
            setClassrooms([...classrooms, newClassroom]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteClassroom = (classroomId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar esta aula? Los alumnos asignados quedarán sin clase y se borrarán todos los datos de práctica del aula. Esta acción es irreversible.")) {
            // Unassign students by clearing their classroomId
            setUsers(users.map(u => 
                u.classroomId === classroomId 
                ? { ...u, classroomId: undefined } 
                : u
            ));

            // Remove the classroom's sandboxed data from local storage
            localStorage.removeItem(`classroom-data-${classroomId}`);
            
            // Delete the classroom itself
            setClassrooms(classrooms.filter(c => c.id !== classroomId));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Gestión de Aulas de Práctica</h1>
                <button onClick={() => handleOpenModal()} className="no-print bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-1" /> Crear Nueva Aula
                </button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3 text-left">Nombre del Aula</th>
                                <th className="px-4 py-3 text-left">Profesor Tutor</th>
                                <th className="px-4 py-3 text-center">Nº Alumnos</th>
                                <th className="px-4 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classrooms.map(classroom => (
                                <tr key={classroom.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-medium">{classroom.name}</td>
                                    <td className="px-4 py-2">{usersMap.get(classroom.tutorId)?.name || 'Sin Asignar'}</td>
                                    <td className="px-4 py-2 text-center">{studentCountByClassroom.get(classroom.id) || 0}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button onClick={() => handleOpenModal(classroom)} className="text-primary-600 p-1 inline-block"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteClassroom(classroom.id)} className="text-red-600 p-1 inline-block"><TrashIcon className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <ClassroomFormModal
                    classroom={selectedClassroom}
                    teachers={teachers}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveClassroom}
                />
            )}
        </div>
    );
};
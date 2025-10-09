import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { Card } from '../../../components/Card';
import { Modal } from '../../../components/Modal';
import { PlusIcon, DownloadIcon } from '../../../components/icons';
import { User, Profile } from '../../../types';
import { exportToCsv } from '../../../utils/export';

export const StudentManager: React.FC = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { users, setUsers, classrooms } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);
    const studentsInClass = useMemo(() => users.filter(u => u.classroomId === classroomId), [users, classroomId]);

    const handleOpenModal = (student: User | null = null) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleSaveStudent = (studentData: Partial<User>) => {
        if (selectedStudent) { // Editing
            setUsers(users.map(u => u.id === selectedStudent.id ? { ...u, ...studentData } : u));
        } else { // Creating
            const newStudent: User = {
                id: `student-${Date.now()}`,
                name: studentData.name || '',
                email: studentData.email || '',
                password: studentData.password || 'password',
                avatar: `https://i.pravatar.cc/150?u=${studentData.email}`,
                profiles: [Profile.STUDENT],
                activityStatus: 'Activo',
                locationStatus: 'En el centro',
                classroomId: classroomId,
            };
            setUsers([...users, newStudent]);
        }
        setIsModalOpen(false);
        setSelectedStudent(null);
    };
    
    const handleDeleteStudent = (studentId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar a este alumno?")) {
            setUsers(users.filter(u => u.id !== studentId));
        }
    }

    const handleExport = () => {
        exportToCsv(`alumnos_${classroom?.name.replace(' ', '_')}.csv`, studentsInClass.map(s => ({
            nombre: s.name,
            email: s.email
        })));
    }

    if (!classroom) {
        return <Card title="Error"><p>Clase no encontrada. <Link to="/teacher/aula" className="text-primary-600">Volver a mis clases</Link>.</p></Card>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Alumnos de: {classroom.name}</h1>
                <div className="no-print flex items-center space-x-2">
                    <button onClick={handleExport} className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center">
                        <DownloadIcon className="w-5 h-5 mr-1" /> Exportar a CSV
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center">
                        <PlusIcon className="w-5 h-5 mr-1" /> Añadir Alumno
                    </button>
                </div>
            </div>
            
            <Card title={`Listado de Alumnos (${studentsInClass.length})`}>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                           <tr>
                                <th className="px-4 py-2">Nombre</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentsInClass.map(student => (
                                <tr key={student.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-medium">{student.name}</td>
                                    <td className="px-4 py-2">{student.email}</td>
                                    <td className="px-4 py-2 no-print">
                                        <button onClick={() => handleOpenModal(student)} className="text-primary-600 hover:underline">Editar</button>
                                        <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:underline ml-4">Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && <StudentFormModal student={selectedStudent} onClose={() => setIsModalOpen(false)} onSave={handleSaveStudent} />}
        </div>
    );
};

const StudentFormModal: React.FC<{ student: User | null; onClose: () => void; onSave: (student: Partial<User>) => void; }> = ({ student, onClose, onSave }) => {
    const [name, setName] = useState(student?.name || '');
    const [email, setEmail] = useState(student?.email || '');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, password: password || undefined });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={student ? 'Editar Alumno' : 'Nuevo Alumno'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre y Apellidos" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-2 border rounded dark:bg-gray-700"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={student ? "Nueva contraseña (opcional)" : "Contraseña"} required={!student} className="w-full p-2 border rounded dark:bg-gray-700"/>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
                    <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};
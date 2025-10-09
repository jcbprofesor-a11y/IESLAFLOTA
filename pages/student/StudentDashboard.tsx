import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Card';
import { Profile } from '../../types';

export const StudentDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    const { studentSimulatedProfile } = currentUser;

    if (studentSimulatedProfile === Profile.TEACHER) {
        return <Navigate to="/student/teacher-dashboard" replace />;
    }
    
    if (studentSimulatedProfile === Profile.ALMACEN) {
        return <Navigate to="/student/almacen-dashboard" replace />;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Bienvenido al Aula de Almacén</h1>
            <Card title="Esperando Asignación de Rol">
                <p>Tu profesor aún no te ha asignado un rol de práctica (Profesor o Almacén).</p>
                <p className="mt-2">Por favor, espera a que tu profesor configure tu perfil para poder empezar las prácticas.</p>
            </Card>
        </div>
    );
};
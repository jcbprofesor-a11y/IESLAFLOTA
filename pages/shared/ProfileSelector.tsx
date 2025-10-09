import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getProfileDisplayName } from '../../types';

export const ProfileSelector: React.FC = () => {
  const { currentUser, selectProfile, logout } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center">
      <div className="text-center">
        <img src={currentUser.avatar} alt="User Avatar" className="w-24 h-24 mx-auto rounded-full mb-4 shadow-lg" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Bienvenido, {currentUser.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Por favor, selecciona un perfil para continuar.</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {currentUser.profiles.map((profile) => (
          <button
            key={profile}
            onClick={() => selectProfile(profile)}
            className="px-8 py-4 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-semibold rounded-lg shadow-md hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600 transition-all duration-300 transform hover:scale-105"
          >
            <span className="text-xl">{getProfileDisplayName(profile)}</span>
          </button>
        ))}
      </div>
       <button 
        onClick={logout}
        className="mt-8 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
        >
            ¿No eres tú? Cerrar sesión
        </button>
    </div>
  );
};
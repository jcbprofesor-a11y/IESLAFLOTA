import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useCreator } from '../../contexts/CreatorContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { companyInfo } = useCompany();
  const { creatorInfo } = useCreator();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (!success) {
      setError('Email o contraseña incorrectos.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <img src={companyInfo.logo} alt="Logotipo de la Empresa" className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Bienvenido a {companyInfo.name}</h2>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correo Electrónico
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500">
             <p>{creatorInfo.copyright}</p>
             <a href={creatorInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400">
                 {creatorInfo.name}
             </a>
        </div>
      </div>
    </div>
  );
};

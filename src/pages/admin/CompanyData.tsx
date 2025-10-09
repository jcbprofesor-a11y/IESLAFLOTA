

import React, { useState, useMemo } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { Card } from '../../components/Card';
import { CompanyIcon } from '../../components/icons';
import { Company, Profile, User, SUPER_USER_EMAIL } from '../../types';
import { useData } from '../../contexts/DataContext';

export const CompanyData: React.FC = () => {
  const { companyInfo, setCompanyInfo } = useCompany();
  const { users } = useData();
  const [formState, setFormState] = useState<Company>(companyInfo);
  const [isSaved, setIsSaved] = useState(false);

  // FIX: Replaced Profile.MANAGER with Profile.ALMACEN, which exists in the enum.
  const managerUsers = useMemo(() => users.filter(u => u.profiles.includes(Profile.ALMACEN) && u.email !== SUPER_USER_EMAIL), [users]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormState({ ...formState, [name]: isNumber ? parseFloat(value) : value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'printLogo') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState({ ...formState, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyInfo(formState);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Datos de la Empresa</h1>
      <Card title="Información General y de Contacto" icon={<CompanyIcon className="w-8 h-8" />}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Nombre de la Empresa</label>
              <input type="text" name="name" value={formState.name} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div>
              <label className="block text-sm font-medium">CIF</label>
              <input type="text" name="cif" value={formState.cif} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
            </div>
             <div>
              <label className="block text-sm font-medium">Teléfono</label>
              <input type="text" name="phone" value={formState.phone} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
            </div>
             <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" name="email" value={formState.email} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Dirección</label>
              <textarea name="address" value={formState.address} onChange={handleFormChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
            </div>
          </div>

          <hr className="dark:border-gray-700"/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
                <label className="block text-sm font-medium">Logo Principal (Interfaz)</label>
                <input type="file" name="logo" accept="image/*,.gif" onChange={(e) => handleFileChange(e, 'logo')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
            </div>
            <div className="flex justify-center">
                <img src={formState.logo} alt="Logo Preview" className="h-16 w-auto bg-gray-100 dark:bg-gray-600 p-2 rounded-md"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Logo para Documentos (Impresión)</label>
                <input type="file" name="printLogo" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'printLogo')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
            </div>
            <div className="flex justify-center">
                <img src={formState.printLogo} alt="Print Logo Preview" className="h-16 w-auto bg-white p-2 rounded-md shadow-sm"/>
            </div>
          </div>

          <hr className="dark:border-gray-700"/>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium">Encargado de Almacén</label>
                    <select name="managerUserId" value={formState.managerUserId} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        <option value="">-- Seleccionar Encargado --</option>
                        {managerUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Presupuesto por Defecto (€)</label>
                    <input type="number" name="defaultBudget" value={formState.defaultBudget} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"/>
                </div>
            </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700">
                {isSaved ? '¡Guardado!' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
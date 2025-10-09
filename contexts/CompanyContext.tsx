import React, { createContext, useContext, useMemo } from 'react';
import { Company } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CompanyContextType {
  companyInfo: Company;
  setCompanyInfo: (info: Company) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const initialCompanyInfo: Company = {
  name: "Manager Pro Edu",
  logo: "https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600",
  printLogo: "https://tailwindui.com/img/logos/mark.svg?color=black",
  cif: "B12345678",
  address: "Calle Educación 123, Ciudad del Saber, 45678",
  phone: "555-010203",
  email: "contact@managerpro.edu",
  defaultBudget: 300,
  managerUserId: 'user-2',
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useLocalStorage<Company>('company:info', initialCompanyInfo);

  const value = useMemo(() => ({ companyInfo, setCompanyInfo }), [companyInfo, setCompanyInfo]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
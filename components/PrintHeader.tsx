import React from 'react';
import { Company, User } from '../types';

interface PrintHeaderProps {
  companyInfo: Company;
  managerUser?: User;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({ companyInfo, managerUser }) => {
  return (
    <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
      <div className="flex justify-between items-start">
        <img src={companyInfo.printLogo} alt="Logo" className="max-w-[150px] max-h-[75px]" />
        <div className="text-right text-xs">
          <h2 className="font-bold text-lg">{companyInfo.name}</h2>
          <p>{companyInfo.address}</p>
          {managerUser && (
            <div className="mt-2">
              <p><strong>Contacto Almacén:</strong> {managerUser.name}</p>
              <p><strong>Teléfono:</strong> {companyInfo.phone}</p>
              <p><strong>Email:</strong> {managerUser.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

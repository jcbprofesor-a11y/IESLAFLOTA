import React, { createContext, useContext, useMemo } from 'react';
import { Creator } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CreatorContextType {
  creatorInfo: Creator;
  setCreatorInfo: (info: Creator) => void;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

const initialCreatorInfo: Creator = {
  name: "JCB",
  logo: "https://avatars.githubusercontent.com/u/1?v=4", // Placeholder Octocat
  website: "mailto:managerproapp@gmail.com",
  copyright: `© ${new Date().getFullYear()} JCB. Todos los derechos reservados.`,
  appName: "Manager Pro",
};

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creatorInfo, setCreatorInfo] = useLocalStorage<Creator>('creator:info', initialCreatorInfo);
  
  const value = useMemo(() => ({ creatorInfo, setCreatorInfo }), [creatorInfo, setCreatorInfo]);

  return <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>;
};

export const useCreator = () => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
};
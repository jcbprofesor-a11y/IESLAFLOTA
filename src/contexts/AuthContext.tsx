import React, { createContext, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useData } from './DataContext';
import { User, Profile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  selectedProfile: Profile | null;
  isImpersonating: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  selectProfile: (profile: Profile) => void;
  impersonateUser: (user: User) => void;
  stopImpersonating: () => void;
  updateCurrentUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('auth:user', null);
  const [selectedProfile, setSelectedProfile] = useLocalStorage<Profile | null>('auth:profile', null);
  const [originalUser, setOriginalUser] = useLocalStorage<User | null>('auth:originalUser', null);
  const { users } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const isImpersonating = !!originalUser;

  const login = async (email: string, password?: string): Promise<boolean> => {
    // Special hardcoded creator/super-user login
    if (email.toLowerCase() === 'managerproapp@gmail.com' && password === 'Proteinas@123') {
        const superUser = users.find(u => u.email.toLowerCase() === 'managerproapp@gmail.com');
        if (superUser) {
            if (superUser.activityStatus === 'De Baja') {
                navigate('/blocked-access');
                return false;
            }
            setCurrentUser(superUser);
            // Super user has multiple profiles, navigate to selector
            setSelectedProfile(null);
            navigate('/select-profile');
            return true;
        }
    }

    // Standard user login
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user && (!user.password || user.password === password)) {
        if (user.activityStatus === 'De Baja') {
            navigate('/blocked-access');
            return false;
        }
      setCurrentUser(user);
      if (user.profiles.length === 1) {
        selectProfile(user.profiles[0]);
      } else {
        setSelectedProfile(null); // Ensure no profile is pre-selected
        navigate('/select-profile');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedProfile(null);
    setOriginalUser(null);
    navigate('/login');
  };

  const selectProfile = (profile: Profile) => {
    if (currentUser && currentUser.profiles.includes(profile)) {
      setSelectedProfile(profile);
      
      const currentPath = location.pathname;
      const isProfilePage = currentPath.endsWith('/profile');

      if (isProfilePage) {
        navigate(`/${profile}/profile`);
      } else {
        navigate(`/${profile}/dashboard`);
      }
    }
  };

  const impersonateUser = (user: User) => {
    if (currentUser) {
      setOriginalUser(currentUser);
      setCurrentUser(user);
      if (user.profiles.length > 0) {
        const newProfile = user.profiles[0];
        setSelectedProfile(newProfile);
        navigate(`/${newProfile}/dashboard`);
      } else {
        logout(); // Or navigate to a "no profiles" page
      }
    }
  };

  const stopImpersonating = () => {
    if (originalUser) {
      const newProfile = originalUser.profiles[0];
      setCurrentUser(originalUser);
      setSelectedProfile(newProfile);
      setOriginalUser(null);
      navigate(`/${newProfile}/dashboard`);
    }
  };
  
  const updateCurrentUser = (userData: Partial<User>) => {
    if(currentUser) {
        const updatedUser = {...currentUser, ...userData};
        setCurrentUser(updatedUser);
        if(isImpersonating && originalUser?.id === currentUser.id) {
            setOriginalUser(updatedUser);
        }
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      selectedProfile,
      isImpersonating,
      login,
      logout,
      selectProfile,
      impersonateUser,
      stopImpersonating,
      updateCurrentUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser, selectedProfile, isImpersonating, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
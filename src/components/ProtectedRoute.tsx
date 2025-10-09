import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';

interface ProtectedRouteProps {
  allowedProfiles: Profile[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedProfiles, children }) => {
  const { currentUser, selectedProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!selectedProfile || !allowedProfiles.includes(selectedProfile)) {
    // If user has a profile, but not the right one, send them to selector.
    // Or if they landed here without selecting a profile.
    return <Navigate to="/select-profile" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
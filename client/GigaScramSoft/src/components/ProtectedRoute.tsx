import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuthStore();

  useEffect(() => {
    console.log('ProtectedRoute check -', {
      isAuthenticated,
      userRole,
      allowedRoles,
      hasAccess: userRole && allowedRoles.includes(userRole)
    });
  }, [isAuthenticated, userRole, allowedRoles]);

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting - not authenticated');
    return <Navigate to="/" replace />;
  }

  if (userRole && allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: Access granted to', userRole);
    return <>{children}</>;
  }

  console.log('ProtectedRoute: Access denied -', userRole, 'not in', allowedRoles);
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;

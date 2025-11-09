import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isSignedIn || !user) {
    // Redirect to sign-in page with return url
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};











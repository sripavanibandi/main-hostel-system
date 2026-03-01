import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login page
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Redirect based on user's actual role
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

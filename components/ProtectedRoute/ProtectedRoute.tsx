import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { User, UserRole } from '../../types';

interface ProtectedRouteProps {
    currentUser: User | null;
    allowedRoles: UserRole[];
    children: React.ReactElement;
}

const ProtectedRoute = ({ currentUser, allowedRoles, children }: ProtectedRouteProps) => {
    const location = useLocation();

    // console.log('ProtectedRoute:', { currentUser, allowedRoles, location: location.pathname });

    if (!currentUser) {
        // Not logged in, redirect to login page
        console.log('Not logged in, redirecting to login');
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(currentUser.role)) {
        // Logged in but does not have permission, redirect to a 'not authorized' page or dashboard
        console.log('Not authorized, redirecting to dashboard');
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    // console.log('Access granted, rendering children');
    return children;
};

export default ProtectedRoute;

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

interface GuestRouteProps {
    children: ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        // Redirect to a placeholder dashboard or home if they are already logged in
        // For now, let's just say they are redirected to a new "Dashboard" path
        // which we'll handle in App.tsx
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}

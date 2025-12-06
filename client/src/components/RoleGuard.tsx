import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, Box, Typography } from '@mui/material';
import { useAuthStore } from '../stores/authStore';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            <Typography variant="h6">Không có quyền truy cập</Typography>
            <Typography>
              Bạn không có quyền truy cập trang này. Vai trò của bạn: <strong>{user.role}</strong>
            </Typography>
        </Alert>
        </Box>
      )
    );
  }

  return <>{children}</>;
}


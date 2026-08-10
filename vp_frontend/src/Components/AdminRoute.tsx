import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Alert, Box, CircularProgress } from '@mui/material';

const AdminRoute: React.FC = () => {
  const { user, isAdmin, loading } = useSettings();
  const token = sessionStorage.getItem('authToken');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access Denied. You do not have Super Admin privileges to view or modify settings.
        </Alert>
      </Box>
    );
  }

  return <Outlet />;
};

export default AdminRoute;

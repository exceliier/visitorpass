import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PhotoCapture from './Components/PhotoCapture';
import DataForm from './Components/DataForm';
import BarcodeGenerator from './Components/BarcodeGenerator';
import PrintPass from './Components/PrintPass';
import Login from './Components/Login';
import HomePage from './Components/HomePage';
import DailyRegisterPage from './Components/DailyRegisterPage';
import SettingsPage from './Components/SettingsPage';
import PrivateRoute from './Components/PrivateRoute';
import { Container, Typography, Box } from '@mui/material';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const AppHeader: React.FC = () => {
  const { settings } = useSettings();
  return (
    <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2', pt: 2 }}>
      {settings?.appTitle || 'Visitor Pass Management'}
    </Typography>
  );
};

const AppContent: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Container maxWidth="md">
        <AppHeader />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pass" element={<DataForm />} />
            <Route path="/photo" element={<PhotoCapture />} />
            <Route path="/barcode" element={<BarcodeGenerator />} />
            <Route path="/print" element={<PrintPass />} />
            <Route path="/daily-register" element={<DailyRegisterPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Container>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  );
};

export default App;
'use client';
import React, { useState } from 'react';
import { Button, TextField, Box, Container, Typography, Paper, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import BadgeIcon from '@mui/icons-material/Badge';
import PrintIcon from '@mui/icons-material/Print';
import axiosInstance from '../axiosInstance';
import { useSettings } from '../context/SettingsContext';

const HomePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const navigate = useNavigate();
  const { user, isAdmin, settings, logout } = useSettings();

  const handlePass = () => {
    navigate('/pass');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  const handlePrintDailyRegister = async () => {
    if (!selectedDate) {
      alert('Please select a date to print the daily register.');
      return;
    }

    try {
      const response = await axiosInstance.get('/visitors/by-date', {
        params: { date: selectedDate },
      });

      navigate('/daily-register', {
        state: { selectedDate, visitorData: response.data },
      });
    } catch (error) {
      console.error('Error fetching daily register:', error);
      alert('Failed to fetch daily register. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '1.5rem' }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: '#ffffff' }}>
        {/* User Session Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="subtitle2" color="textSecondary">
              Assigned Office:
            </Typography>
            <Chip
              label={settings?.officeName || settings?.organizationName || 'Main Office'}
              color="primary"
              variant="filled"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {user?.name || user?.username} ({isAdmin ? 'Super Admin' : 'Operator'})
            </Typography>
            <Button variant="text" color="error" size="small" startIcon={<LogoutIcon />} onClick={logout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<BadgeIcon />}
            onClick={handlePass}
            sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            Issue New Visitor Pass
          </Button>

          {isAdmin && (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AdminPanelSettingsIcon />}
                onClick={handleAdminDashboard}
                fullWidth
              >
                Super Admin Dashboard
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SettingsIcon />}
                onClick={handleSettings}
                fullWidth
              >
                Office Settings
              </Button>
            </Box>
          )}
        </Box>

        {/* Daily Register Section */}
        <Box sx={{ p: 2, border: '1px border #e2e8f0', borderRadius: 2, backgroundColor: '#f8fafc' }}>
          <Typography variant="subtitle2" gutterBottom color="textSecondary">
            Daily Visitor Register
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              size="small"
              sx={{ width: 170 }}
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={handlePrintDailyRegister}
            >
              Print Register
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;

'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestoreIcon from '@mui/icons-material/Restore';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { defaultSettings } from '../services/settingsService';

const SettingsPage: React.FC = () => {
  const { settings, loading, saveSettings, reloadSettings } = useSettings();
  const navigate = useNavigate();

  const [organizationName, setOrganizationName] = useState('');
  const [appTitle, setAppTitle] = useState('');
  const [passTitle, setPassTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [validityHours, setValidityHours] = useState<number>(2);
  const [cutoffTime, setCutoffTime] = useState('17:00');
  const [footerNotice, setFooterNotice] = useState('');
  const [fontFamily, setFontFamily] = useState('');
  const [offices, setOffices] = useState<string[]>([]);
  const [newOffice, setNewOffice] = useState('');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setOrganizationName(settings.organizationName || '');
      setAppTitle(settings.appTitle || '');
      setPassTitle(settings.passTitle || '');
      setLogoUrl(settings.logoUrl || '');
      setValidityHours(settings.validityHours || 2);
      setCutoffTime(settings.cutoffTime || '17:00');
      setFooterNotice(settings.footerNotice || '');
      setFontFamily(settings.fontFamily || "'DVOT-Surekh', 'DVOT Surekh', 'Nirmala UI', 'Mangal', sans-serif");
      setOffices(settings.offices ? [...settings.offices] : []);
    }
  }, [settings]);

  const handleAddOffice = () => {
    if (!newOffice.trim()) return;
    if (offices.includes(newOffice.trim())) {
      setFeedback({ type: 'error', message: 'Office/Department already exists in the list.' });
      return;
    }
    setOffices([...offices, newOffice.trim()]);
    setNewOffice('');
  };

  const handleDeleteOffice = (indexToDelete: number) => {
    setOffices(offices.filter((_, idx) => idx !== indexToDelete));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Logo file size should be less than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to system defaults?')) {
      setOrganizationName(defaultSettings.organizationName);
      setAppTitle(defaultSettings.appTitle);
      setPassTitle(defaultSettings.passTitle);
      setLogoUrl(defaultSettings.logoUrl);
      setValidityHours(defaultSettings.validityHours);
      setCutoffTime(defaultSettings.cutoffTime);
      setFooterNotice(defaultSettings.footerNotice);
      setFontFamily(defaultSettings.fontFamily);
      setOffices([...defaultSettings.offices]);
      setFeedback({ type: 'success', message: 'Form populated with defaults. Click Save Settings to persist.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await saveSettings({
        organizationName,
        appTitle,
        passTitle,
        logoUrl,
        validityHours,
        cutoffTime,
        footerNotice,
        fontFamily,
        offices,
      });
      setFeedback({ type: 'success', message: 'Application settings saved successfully!' });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save settings. Please check credentials or network.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading application settings...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              Back
            </Button>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Application & Office Customization
            </Typography>
          </Box>
          <Button
            variant="text"
            color="warning"
            startIcon={<RestoreIcon />}
            onClick={handleResetDefaults}
          >
            Reset Defaults
          </Button>
        </Box>

        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 3 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <form onSubmit={handleSave}>
          <Typography variant="h6" color="primary" gutterBottom>
            1. Organization & Branding Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Organization / Office Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                fullWidth
                required
                helperText="Displayed at the header of visitor passes"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Application Title"
                value={appTitle}
                onChange={(e) => setAppTitle(e.target.value)}
                fullWidth
                required
                helperText="Main title shown on navigation bar"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pass Title (Marathi / Regional)"
                value={passTitle}
                onChange={(e) => setPassTitle(e.target.value)}
                fullWidth
                required
                helperText="E.g., अभ्यागत प्रवेश परवाना"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pass Footer Notice Text"
                value={footerNotice}
                onChange={(e) => setFooterNotice(e.target.value)}
                fullWidth
                required
                helperText="Notice after validity time"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pass Font Family (e.g. DVOT-Surekh)"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                fullWidth
                required
                helperText="Font stack used for printing passes (e.g. 'DVOT-Surekh', 'Nirmala UI')"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>
            2. Pass Validity Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Validity Duration (Hours)"
                type="number"
                value={validityHours}
                onChange={(e) => setValidityHours(Number(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1, max: 24 }}
                helperText="Default duration pass remains valid"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Daily Cutoff Time (24h HH:mm)"
                type="time"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                helperText="Pass validity limit cutoff (e.g. 17:00)"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>
            3. Organization Logo
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Card sx={{ maxWidth: 150, p: 1, textAlign: 'center', border: '1px border #ccc' }}>
              <CardMedia
                component="img"
                height="80"
                image={logoUrl || '/logo.png'}
                alt="Organization Logo"
                sx={{ objectFit: 'contain' }}
              />
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="caption" color="textSecondary">
                  Current Logo
                </Typography>
              </CardContent>
            </Card>

            <Box>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
              >
                Upload New Logo
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </Button>
              <Typography variant="caption" display="block" color="textSecondary">
                Supported formats: PNG, JPG, SVG (Max 2MB).
              </Typography>
            </Box>
          </Box>

          <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 4 }}>
            4. Offices & Departments Dropdown List (`To Whom to Visit`)
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Add New Office / Officer Section"
              value={newOffice}
              onChange={(e) => setNewOffice(e.target.value)}
              fullWidth
              size="small"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOffice();
                }
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleAddOffice}
            >
              Add
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ maxHeight: 250, overflow: 'auto' }}>
            <List density="compact">
              {offices.map((officeItem, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText primary={`${idx + 1}. ${officeItem}`} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteOffice(idx)}
                      disabled={officeItem === 'Other'} // Keep 'Other' optional fallback
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving}
            >
              Save Settings
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default SettingsPage;

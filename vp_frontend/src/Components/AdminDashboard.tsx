'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardMedia,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';
import { AppSettings } from '../services/settingsService';
import { UserAccount, fetchOffices, createOffice, updateOffice, fetchUsers, createUser, deleteUser } from '../services/adminService';
import { useSettings } from '../context/SettingsContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { reloadSettings } = useSettings();
  const [tabIndex, setTabIndex] = useState(0);

  const [offices, setOffices] = useState<AppSettings[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Office Dialog State
  const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Partial<AppSettings> | null>(null);
  const [officeCodeInput, setOfficeCodeInput] = useState('');
  const [officeNameInput, setOfficeNameInput] = useState('');
  const [orgNameInput, setOrgNameInput] = useState('');
  const [passTitleInput, setPassTitleInput] = useState('');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [officesListInput, setOfficesListInput] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState('');

  // New User Dialog State
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'user'>('user');
  const [assignedOfficeInput, setAssignedOfficeInput] = useState('DEFAULT_OFFICE');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [officesData, usersData] = await Promise.all([fetchOffices(), fetchUsers()]);
      setOffices(officesData);
      setUsers(usersData);
    } catch (error: any) {
      console.error('Failed to load admin dashboard data:', error);
      setFeedback({ type: 'error', message: 'Failed to fetch admin data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleOpenNewOffice = () => {
    setEditingOffice(null);
    setOfficeCodeInput(`OFF_${Math.floor(100 + Math.random() * 900)}`);
    setOfficeNameInput('');
    setOrgNameInput('');
    setPassTitleInput('अभ्यागत प्रवेश परवाना');
    setLogoUrlInput('/logo.png');
    setOfficesListInput(['General Department', 'Other']);
    setOpenOfficeDialog(true);
  };

  const handleEditOffice = (office: AppSettings) => {
    setEditingOffice(office);
    setOfficeCodeInput(office.officeId || '');
    setOfficeNameInput(office.officeName || '');
    setOrgNameInput(office.organizationName || '');
    setPassTitleInput(office.passTitle || 'अभ्यागत प्रवेश परवाना');
    setLogoUrlInput(office.logoUrl || '/logo.png');
    setOfficesListInput(office.offices ? [...office.offices] : ['General Department', 'Other']);
    setOpenOfficeDialog(true);
  };

  const handleSaveOffice = async () => {
    if (!officeCodeInput.trim() || !officeNameInput.trim()) {
      alert('Office Code and Office Name are required.');
      return;
    }

    try {
      if (editingOffice) {
        await updateOffice(officeCodeInput, {
          officeName: officeNameInput,
          organizationName: orgNameInput || officeNameInput,
          passTitle: passTitleInput,
          logoUrl: logoUrlInput,
          offices: officesListInput,
        });
        setFeedback({ type: 'success', message: 'Office configuration updated successfully.' });
      } else {
        await createOffice({
          officeId: officeCodeInput,
          officeName: officeNameInput,
          organizationName: orgNameInput || officeNameInput,
          passTitle: passTitleInput,
          logoUrl: logoUrlInput,
          offices: officesListInput,
        });
        setFeedback({ type: 'success', message: 'New Office created successfully.' });
      }
      setOpenOfficeDialog(false);
      await loadAdminData();
      await reloadSettings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save office.');
    }
  };

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) return;
    if (!officesListInput.includes(newDepartment.trim())) {
      setOfficesListInput([...officesListInput, newDepartment.trim()]);
    }
    setNewDepartment('');
  };

  const handleRemoveDepartment = (dep: string) => {
    setOfficesListInput(officesListInput.filter((d) => d !== dep));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrlInput(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateUser = async () => {
    if (!usernameInput.trim() || !passwordInput.trim() || !assignedOfficeInput) {
      alert('Username, password, and assigned office are required.');
      return;
    }

    try {
      await createUser({
        username: usernameInput,
        password: passwordInput,
        role: roleInput,
        officeId: assignedOfficeInput,
        name: fullNameInput || usernameInput,
      });
      setFeedback({ type: 'success', message: `User login created for ${usernameInput}.` });
      setOpenUserDialog(false);
      setUsernameInput('');
      setPasswordInput('');
      setFullNameInput('');
      await loadAdminData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user account.');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to delete user account "${username}"?`)) {
      try {
        await deleteUser(userId);
        setFeedback({ type: 'success', message: `User ${username} deleted.` });
        await loadAdminData();
      } catch (error: any) {
        alert('Failed to delete user.');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading Admin Management System...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
              Centralized Super Admin Dashboard
            </Typography>
          </Box>
        </Box>

        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 3 }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} sx={{ mb: 3 }} indicatorColor="primary" textColor="primary">
          <Tab label="1. Multi-Office Configurations" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="2. User Logins & Office Mapping" icon={<PersonAddIcon />} iconPosition="start" />
        </Tabs>

        {/* TAB 1: OFFICES */}
        {tabIndex === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Configured Offices ({offices.length})</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenNewOffice}
              >
                Create New Office Profile
              </Button>
            </Box>

            <Table container component={Paper} variant="outlined">
              <TableHead sx={{ backgroundColor: '#f0f4f8' }}>
                <TableRow>
                  <TableCell><strong>Logo</strong></TableCell>
                  <TableCell><strong>Office Code</strong></TableCell>
                  <TableCell><strong>Office Name</strong></TableCell>
                  <TableCell><strong>Organization Header</strong></TableCell>
                  <TableCell><strong>Departments</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {offices.map((office) => (
                  <TableRow key={office.officeId}>
                    <TableCell>
                      <img src={office.logoUrl || '/logo.png'} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                    </TableCell>
                    <TableCell><Chip label={office.officeId} color="primary" variant="outlined" size="small" /></TableCell>
                    <TableCell>{office.officeName || 'Main Office'}</TableCell>
                    <TableCell>{office.organizationName}</TableCell>
                    <TableCell>{(office.offices || []).length} Sections</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditOffice(office)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* TAB 2: USERS */}
        {tabIndex === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Operator Accounts ({users.length})</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={() => setOpenUserDialog(true)}
              >
                Issue New Operator Login
              </Button>
            </Box>

            <Table container component={Paper} variant="outlined">
              <TableHead sx={{ backgroundColor: '#f0f4f8' }}>
                <TableRow>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Operator Name</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Assigned Office</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((usr) => (
                  <TableRow key={usr._id}>
                    <TableCell><strong>{usr.username}</strong></TableCell>
                    <TableCell>{usr.name || usr.username}</TableCell>
                    <TableCell>
                      <Chip
                        label={usr.role === 'admin' ? 'Super Admin' : 'Office Operator'}
                        color={usr.role === 'admin' ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={usr.officeId || 'DEFAULT_OFFICE'} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {usr.username !== 'admin' && (
                        <IconButton color="error" onClick={() => handleDeleteUser(usr._id, usr.username)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* CREATE/EDIT OFFICE DIALOG */}
      <Dialog open={openOfficeDialog} onClose={() => setOpenOfficeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingOffice ? 'Edit Office Settings' : 'Create New Office Settings'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Office ID / Code"
                value={officeCodeInput}
                onChange={(e) => setOfficeCodeInput(e.target.value.toUpperCase())}
                fullWidth
                disabled={!!editingOffice}
                required
                helperText="Unique office identifier (e.g. OFF_PUNE)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Office Name"
                value={officeNameInput}
                onChange={(e) => setOfficeNameInput(e.target.value)}
                fullWidth
                required
                helperText="Human readable branch office name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Organization Header Name"
                value={orgNameInput}
                onChange={(e) => setOrgNameInput(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pass Title"
                value={passTitleInput}
                onChange={(e) => setPassTitleInput(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            {/* LOGO */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Office Logo</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Card sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardMedia component="img" image={logoUrlInput || '/logo.png'} style={{ maxHeight: 50, objectFit: 'contain' }} />
                </Card>
                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                  Upload Logo
                  <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </Button>
              </Box>
            </Grid>

            {/* DEPARTMENTS */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Departments / Sections for Visitor Options</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Department"
                  size="small"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={handleAddDepartment}>Add</Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {officesListInput.map((dep) => (
                  <Chip key={dep} label={dep} onDelete={() => handleRemoveDepartment(dep)} color="primary" variant="outlined" />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOfficeDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveOffice} variant="contained" color="primary">Save Office</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE USER DIALOG */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue New Operator Login</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Operator Full Name"
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              fullWidth
            />
            <TextField
              label="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select value={roleInput} label="Role" onChange={(e) => setRoleInput(e.target.value as any)}>
                <MenuItem value="user">Office Operator (Issue & Print Passes Only)</MenuItem>
                <MenuItem value="admin">Super Admin (Global Office & User Control)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Assigned Office Location</InputLabel>
              <Select value={assignedOfficeInput} label="Assigned Office Location" onChange={(e) => setAssignedOfficeInput(e.target.value)}>
                {offices.map((off) => (
                  <MenuItem key={off.officeId} value={off.officeId}>
                    {off.officeName} ({off.officeId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained" color="primary">Issue Login</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

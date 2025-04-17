'use client';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import axiosInstance from '../axiosInstance'; // Import the centralized Axios instance

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  /**
   * Handles the login process by sending a POST request to the authentication endpoint.
   * If the login is successful, the authentication token is stored in session storage,
   * and the user is redirected to the home page. If the login fails, an alert is displayed.
   */
  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password }); // Use Axios instance

      if (response.status === 200) {
        const { token } = response.data;
        sessionStorage.setItem('authToken', token); // Save token in sessionStorage
        history.push('/'); // Redirect to the home page
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
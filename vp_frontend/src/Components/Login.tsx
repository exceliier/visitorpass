'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Paper,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import axiosInstance from '../axiosInstance';
import { fetchCaptcha } from '../services/adminService';
import { useSettings } from '../context/SettingsContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { setCurrentUserSession } = useSettings();

  const loadNewCaptcha = async () => {
    try {
      setCaptchaInput('');
      const data = await fetchCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaText(data.captchaText);
    } catch (error) {
      console.error('Error fetching captcha:', error);
      // Fallback local captcha generator if offline
      const id = Math.random().toString(36).substring(2, 9);
      const text = Math.random().toString(36).substring(2, 7).toUpperCase();
      setCaptchaId(id);
      setCaptchaText(text);
    }
  };

  useEffect(() => {
    loadNewCaptcha();
  }, []);

  // Draw captcha image onto canvas with security noise lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !captchaText) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background noise lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw captcha text characters
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#1e293b';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < captchaText.length; i++) {
      const x = 20 + i * 22;
      const y = canvas.height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 0.4 - 0.2);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(captchaText[i], 0, 0);
      ctx.restore();
    }
  }, [captchaText]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaInput.trim()) {
      setErrorMsg('Please enter the CAPTCHA text shown.');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/login', {
        username,
        password,
        captchaId,
        captchaValue: captchaInput,
      });

      if (response.status === 200) {
        const { token, user, officeSettings } = response.data;
        sessionStorage.setItem('authToken', token);
        setCurrentUserSession(user, officeSettings);
        navigate('/');
      } else {
        setErrorMsg('Invalid username or password.');
        loadNewCaptcha();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMsg(error.response?.data?.message || 'An error occurred during login.');
      loadNewCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, textAlign: 'center', backgroundColor: '#ffffff' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1, color: '#1976d2' }}>
          <SecurityIcon fontSize="large" />
          <Typography variant="h5" fontWeight="bold">
            Portal Login
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Centralized Visitor Management System
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          {/* CAPTCHA Challenge */}
          <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px border #cbd5e1', borderRadius: 2, backgroundColor: '#f8fafc' }}>
            <Typography variant="caption" display="block" color="textSecondary" gutterBottom>
              Security Check (Enter code below):
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <canvas
                ref={canvasRef}
                width={140}
                height={40}
                style={{ border: '1px solid #cbd5e1', borderRadius: 4, background: '#f1f5f9' }}
              />
              <IconButton color="primary" onClick={loadNewCaptcha} title="Refresh Captcha" size="small">
                <RefreshIcon />
              </IconButton>
            </Box>

            <TextField
              label="Enter Security CAPTCHA"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              fullWidth
              required
              size="small"
              slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: 3, fontWeight: 'bold' } } }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 1, py: 1.2, fontWeight: 'bold' }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
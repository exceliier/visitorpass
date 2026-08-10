const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const OfficeSettings = require('../models/OfficeSettings');
const router = express.Router();

// Store active captcha challenges in memory with 5-min expiration
const activeCaptchas = new Map();

// Helper to cleanup expired captchas
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of activeCaptchas.entries()) {
    if (now - value.timestamp > 5 * 60 * 1000) {
      activeCaptchas.delete(key);
    }
  }
}, 60 * 1000);

// GET /auth/captcha - Generate SVG/text captcha challenge
router.get('/captcha', (e, res) => {
  const captchaId = Math.random().toString(36).substring(2, 10);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let text = '';
  for (let i = 0; i < 5; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  activeCaptchas.set(captchaId, { text, timestamp: Date.now() });

  res.json({
    captchaId,
    captchaText: text, // SVG or text rendering handled on client
  });
});

// POST /auth/login - Authenticate user credentials & captcha
router.post('/login', async (req, res) => {
  try {
    const { username, password, captchaId, captchaValue } = req.body;
    console.log('Login attempt:', { username });

    // Captcha validation
    if (captchaId) {
      const challenge = activeCaptchas.get(captchaId);
      if (!challenge || challenge.text.toUpperCase() !== (captchaValue || '').trim().toUpperCase()) {
        activeCaptchas.delete(captchaId);
        return res.status(400).json({ message: 'Invalid CAPTCHA response. Please try again.' });
      }
      activeCaptchas.delete(captchaId); // Consume captcha once checked
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const userRole = user.role || 'user';
    const userOfficeId = user.officeId || 'GMIDCHO';

    // Fetch office settings for this user's office
    let officeSettings = await OfficeSettings.findOne({ officeId: userOfficeId });
    if (!officeSettings) {
      officeSettings = await OfficeSettings.findOne({ officeId: 'GMIDCHO' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: userRole,
        officeId: userOfficeId,
      },
      process.env.JWT_SECRET || 'secret_jwt_key',
      { expiresIn: '2d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: userRole,
        officeId: userOfficeId,
        name: user.name || user.username,
      },
      officeSettings,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

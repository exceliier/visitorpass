const express = require('express');
const jwt = require('jsonwebtoken');
const Settings = require('../models/Settings');
const router = express.Router();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).send('Access denied. No token provided.');
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).send('Access denied. Invalid token format.');
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send('Invalid token.');
    }
    req.userId = decoded.id;
    next();
  });
}

// GET /settings - Fetch current settings or return default settings if none exist
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create and save initial default settings
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// PUT /settings - Update application settings (Protected)
router.put('/', verifyToken, async (req, res) => {
  try {
    const {
      organizationName,
      appTitle,
      passTitle,
      logoUrl,
      offices,
      validityHours,
      cutoffTime,
      footerNotice,
      fontFamily,
    } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (organizationName !== undefined) settings.organizationName = organizationName;
    if (appTitle !== undefined) settings.appTitle = appTitle;
    if (passTitle !== undefined) settings.passTitle = passTitle;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (Array.isArray(offices)) settings.offices = offices;
    if (validityHours !== undefined) settings.validityHours = Number(validityHours);
    if (cutoffTime !== undefined) settings.cutoffTime = cutoffTime;
    if (footerNotice !== undefined) settings.footerNotice = footerNotice;
    if (fontFamily !== undefined) settings.fontFamily = fontFamily;

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;

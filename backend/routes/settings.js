const express = require('express');
const jwt = require('jsonwebtoken');
const OfficeSettings = require('../models/OfficeSettings');
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
  jwt.verify(token, process.env.JWT_SECRET || 'secret_jwt_key', (err, decoded) => {
    if (err) {
      return res.status(500).send('Invalid token.');
    }
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    req.officeId = decoded.officeId || 'GMIDCHO';
    next();
  });
}

function verifyAdminToken(req, res, next) {
  verifyToken(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Settings modification requires Admin privileges.' });
    }
    next();
  });
}

// GET /settings - Fetch office settings for the requesting user's office or requested officeId
router.get('/', verifyToken, async (req, res) => {
  try {
    const targetOfficeId = (req.userRole === 'admin' && req.query.officeId) ? req.query.officeId : req.officeId;

    let settings = await OfficeSettings.findOne({ officeId: targetOfficeId });
    if (!settings) {
      // Fallback to GMIDCHO settings
      settings = await OfficeSettings.findOne({ officeId: 'GMIDCHO' });
    }
    if (!settings) {
      settings = new OfficeSettings({ officeId: targetOfficeId || 'GMIDCHO' });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// PUT /settings - Update office settings (Strictly restricted to Admin role)
router.put('/', verifyAdminToken, async (req, res) => {
  try {
    const {
      targetOfficeId,
      officeName,
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

    const officeToUpdate = targetOfficeId || req.officeId || 'GMIDCHO';

    let settings = await OfficeSettings.findOne({ officeId: officeToUpdate });
    if (!settings) {
      settings = new OfficeSettings({ officeId: officeToUpdate });
    }

    if (officeName !== undefined) settings.officeName = officeName;
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
    res.json({ message: 'Office settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.verifyAdminToken = verifyAdminToken;

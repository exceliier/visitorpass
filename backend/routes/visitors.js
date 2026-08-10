const express = require('express');
const Visitor = require('../models/Visitor');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

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

const { savePhotoToDisk } = require('../utils/imageStorage');

// Save visitor data with officeId tag
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, mobile, adhaar, toVisit, photo } = req.body;
    const visitorID = uuidv4();
    const photoUrl = savePhotoToDisk(photo, 'visitor');

    const visitor = new Visitor({
      name,
      mobile,
      adhaar,
      toVisit,
      photo: photoUrl,
      barcode: visitorID,
      officeId: req.officeId || 'GMIDCHO',
    });

    await visitor.save();
    res.status(201).json({ visitorID, photoUrl });
  } catch (error) {
    console.error('Error saving visitor data:', error);
    res.status(500).json({ message: 'Failed to save visitor data.' });
  }
});

// Get visitors (isolated by officeId for users, or selectable for admins)
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    if (req.userRole !== 'admin' || req.query.officeId) {
      const targetOffice = req.query.officeId || req.officeId;
      query = { $or: [{ officeId: targetOffice }, { officeId: 'GMIDCHO' }] };
    }

    const visitors = await Visitor.find(query).sort({ date: -1 });
    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch visitors.' });
  }
});

// Search visitor by mobile or adhaar within office scope
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { mobile, adhaar } = req.query;
    const query = {};

    if (mobile) query.mobile = mobile;
    if (adhaar) query.adhaar = adhaar;

    // Scope search by officeId or fallback to GMIDCHO for legacy records
    if (req.userRole !== 'admin' || req.query.officeId) {
      const targetOffice = req.query.officeId || req.officeId;
      query.$or = [{ officeId: targetOffice }, { officeId: 'GMIDCHO' }];
    }

    const visitor = await Visitor.findOne(query).sort({ date: -1 });
    if (visitor) {
      res.json(visitor);
    } else {
      res.status(404).json({ message: 'Visitor not found.' });
    }
  } catch (error) {
    console.error('Error searching visitor:', error);
    res.status(500).json({ message: 'Failed to search visitor.' });
  }
});

// Get visitors for a specific date
router.get('/by-date', verifyToken, async (req, res) => {
  try {
    const { date, officeId } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    if (req.userRole !== 'admin' || officeId) {
      const targetOffice = officeId || req.officeId;
      query.$or = [{ officeId: targetOffice }, { officeId: 'GMIDCHO' }];
    }

    const visitors = await Visitor.find(query).sort({ date: 1 });
    res.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors by date:', error);
    res.status(500).json({ message: 'Failed to fetch visitors by date.' });
  }
});

module.exports = router;

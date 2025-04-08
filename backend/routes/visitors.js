const express = require('express');
const Visitor = require('../models/Visitor');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // For generating unique visitor IDs
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Save visitor data
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, mobile, address, purpose, toVisit, photo } = req.body;

    // Generate a unique visitor ID
    const visitorID = uuidv4();

    // Create a new visitor record
    const visitor = new Visitor({
      name,
      mobile,
      address,
      purpose,
      toVisit,
      photo,
      barcode: visitorID,
    });

    // Save to the database
    await visitor.save();

    // Return the visitor ID
    res.status(201).json({ visitorID });
  } catch (error) {
    console.error('Error saving visitor data:', error); // Log the error
    res.status(500).json({ message: 'Failed to save visitor data.' });
  }
});

// Get all visitors
router.get('/', verifyToken, async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch visitors.' });
  }
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Access denied.');
  if (token === 'Bearer your_jwt_secret') {
    next(); // Allow the request if the token matches
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(500).send('Invalid token.');
      req.userId = decoded.id;
      next();
    });
  }
}

module.exports = router;

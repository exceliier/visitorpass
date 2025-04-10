const express = require('express');
const Visitor = require('../models/Visitor');
const router = express.Router();
const { v4: uuidv4 } = require('uuid'); // For generating unique visitor IDs
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Save visitor data
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, mobile, adhaar, toVisit, photo } = req.body;

    // Generate a unique visitor ID
    const visitorID = uuidv4();

    // Create a new visitor record
    const visitor = new Visitor({
      name,
      mobile,
      adhaar,
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
  const authHeader = req.headers['authorization'];

  // Check if the Authorization header exists
  if (!authHeader) {
    return res.status(403).send('Access denied. No token provided.');
  }

  // Extract the token from the "Bearer <token>" format
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).send('Access denied. Invalid token format.');
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send('Invalid token.');
    }
    req.userId = decoded.id; // Attach the decoded user ID to the request object
    next(); // Proceed to the next middleware or route handler
  });
}

router.get('/search', verifyToken, async (req, res) => {
  try {
    const { mobile, adhaar } = req.query;

    // Search by mobile or adhaar
    const query = {};
    if (mobile) query.mobile = mobile;
    if (adhaar) query.adhaar = adhaar;
    console.log('Query:', query); // Log the query for debugging
    const visitor = await Visitor.findOne(query);

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

module.exports = router;

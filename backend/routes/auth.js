const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });

    const user = await User.findOne({ username });
    console.log('Retrieved Hashed Password:', user.password);
    console.log('Length of Retrieved Hash:', user.password.length);
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user);

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (isPasswordValid) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '2d',
      });
      console.log('Token generated:', token);
      res.json({ token });
    } else {
      console.log('Invalid password for user:', username);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

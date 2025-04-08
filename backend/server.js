const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Visitor = require('./models/Visitor');
const authRoutes = require('./routes/auth');
const visitorRoutes = require('./routes/visitors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/visitors', visitorRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs'); // Import the file system module
const https = require('https'); // Import the HTTPS module
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

// Load SSL certificate and key using relative paths
const sslOptions = {
  key: fs.readFileSync('../certs/server-key.pem'), // Relative path to your private key
  cert: fs.readFileSync('../certs/server-cert.pem'), // Relative path to your certificate
};

// Start the HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Server running securely on https://localhost:${PORT}`);
});

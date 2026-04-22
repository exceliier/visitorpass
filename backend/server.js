const path = require('path');
const express = require('express');
// const cors = require('cors'); // Removed CORS import
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const visitorRoutes = require('./routes/visitors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Backend startup info:', {
  cwd: process.cwd(),
  dirname: __dirname,
  envPath: path.join(__dirname, '.env'),
  port: process.env.PORT || 5000,
  mongoUriDefined: !!process.env.MONGO_URI,
  nodeEnv: process.env.NODE_ENV || 'undefined',
});
if (process.env.MONGO_URI) {
  console.log('MONGO_URI set, using local host or remote DB');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Global process logging for unexpected crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Middleware
// app.use(cors()); // Enable CORS - replaced with manual headers
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit

// MongoDB connection
const mongoUri =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/visitorpass';
console.log(
  'Connecting to MongoDB using URI:',
  mongoUri.replace(/(mongodb:\/\/)(.*@)?/, '$1***@'),
);

mongoose.connection.on('connected', () => console.log('Mongoose connected'));
mongoose.connection.on('error', (err) =>
  console.error('Mongoose connection error event:', err),
);
mongoose.connection.on('disconnected', () =>
  console.log('Mongoose disconnected'),
);

mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/visitors', visitorRoutes);

// Start the HTTP server (IIS will handle SSL termination)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

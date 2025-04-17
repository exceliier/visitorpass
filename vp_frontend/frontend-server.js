const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();

// Serve the static files from the "dist" folder
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Load SSL certificate and key
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certs/server-key.pem')), // Path to your private key
  cert: fs.readFileSync(path.join(__dirname, '../certs/server-cert.pem')), // Path to your certificate
};

// Start the HTTPS server
const PORT = 443;
https
  .createServer(sslOptions, app)
  .listen(PORT, () => {
    console.log(`Frontend running securely on https://localhost:${PORT}`);
  })
  .on('error', (err) => {
    console.error('Error starting the server:', err.message);
  });

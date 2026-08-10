const fs = require('fs');
const path = require('path');

/**
 * Saves base64 photo data to disk as a static image file.
 * Returns the public relative URL (e.g. /uploads/photos/2026/08/pass_abc123.png).
 */
const savePhotoToDisk = (base64Data, filenamePrefix = 'pass') => {
  if (!base64Data || typeof base64Data !== 'string') {
    return base64Data;
  }

  // If already a URL path (not base64 Data URI), return as-is
  if (!base64Data.startsWith('data:image')) {
    return base64Data;
  }

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Define storage directory: backend/public/uploads/photos/YYYY/MM
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'photos', String(year), month);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Extract base64 payload & extension
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');

    const uniqueId = Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    const filename = `${filenamePrefix}_${uniqueId}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, imageBuffer);

    // Return public relative web URL
    return `/uploads/photos/${year}/${month}/${filename}`;
  } catch (error) {
    console.error('[ImageStorage Error] Failed to save photo to disk:', error);
    return base64Data; // Fallback to original string if error occurs
  }
};

module.exports = { savePhotoToDisk };

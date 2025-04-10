const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, index: true }, // Add index for mobile
  adhaar: { type: String, required: true, index: true }, // Add index for adhaar
  toVisit: { type: String, required: true },
  photo: { type: String, required: true }, // Base64 encoded photo
  barcode: { type: String, required: true }, // Visitor ID for barcode
  date: { type: Date, default: Date.now },
});

// Optional: Create a compound index for mobile and adhaar if needed
// visitorSchema.index({ mobile: 1, adhaar: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);

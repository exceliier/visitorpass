const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  adhaar: { type: String, required: true },
  toVisit: { type: String, required: true },
  photo: { type: String, required: true }, // Base64 encoded photo
  barcode: { type: String, required: true }, // Visitor ID for barcode
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visitor', visitorSchema);

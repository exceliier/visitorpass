const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, index: true },
  adhaar: { type: String, required: true, index: true },
  toVisit: { type: String, required: true },
  photo: { type: String, required: true },
  barcode: { type: String, required: true },
  officeId: { type: String, default: 'GMIDCHO', index: true },
  date: { type: Date, default: Date.now },
});

// Compound indexes for sub-millisecond multi-office query performance
visitorSchema.index({ officeId: 1, date: -1 });
visitorSchema.index({ officeId: 1, mobile: 1 });
visitorSchema.index({ officeId: 1, adhaar: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);

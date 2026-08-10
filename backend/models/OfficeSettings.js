const mongoose = require('mongoose');

const defaultOfficesList = [
  'GMIDC Technical-section',
  'GMIDC Accounts-section',
  'GMIDC Dakshata-court-section',
  'GMIDC-Ex Dir',
  'GMIDC-Sup Engr',
  'GMIDC-EE/DySE',
  'CEWRD-Techincal',
  'CEWRD-Corr. Branch',
  'CEWRD-Chief Engr',
  'CEWRD-Ex Engr',
  'QCC',
  'AID',
  'MID-1',
  'Other',
];

const officeSettingsSchema = new mongoose.Schema(
  {
    officeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'GMIDCHO',
    },
    officeName: {
      type: String,
      default: 'GMIDC Head Office',
    },
    organizationName: {
      type: String,
      default: 'सिंचन भवन, छत्रपती संभाजीनगर',
    },
    appTitle: {
      type: String,
      default: 'Visitor Pass Management',
    },
    passTitle: {
      type: String,
      default: 'अभ्यागत प्रवेश परवाना',
    },
    logoUrl: {
      type: String,
      default: '/logo.png',
    },
    offices: {
      type: [String],
      default: defaultOfficesList,
    },
    validityHours: {
      type: Number,
      default: 2,
    },
    cutoffTime: {
      type: String,
      default: '17:00',
    },
    footerNotice: {
      type: String,
      default: 'पर्यन्त प्रवेश परवाना वैध आहे.',
    },
    fontFamily: {
      type: String,
      default: "'DVOT-Surekh', 'DVOT Surekh', 'Nirmala UI', 'Mangal', sans-serif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OfficeSettings', officeSettingsSchema);
module.exports.defaultOfficesList = defaultOfficesList;

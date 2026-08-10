const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const OfficeSettings = require('../models/OfficeSettings');

const runMigration = async () => {
  try {
    console.log('[Migration] Verifying GMIDCHO & Multi-Office Database Migration...');

    // 1. Ensure GMIDCHO OfficeSettings exist
    let gmidcSettings = await OfficeSettings.findOne({ officeId: 'GMIDCHO' });
    if (!gmidcSettings) {
      // Check if DEFAULT_OFFICE exists to migrate over
      const defaultDoc = await OfficeSettings.findOne({ officeId: 'DEFAULT_OFFICE' });
      if (defaultDoc) {
        console.log('[Migration] Migrating DEFAULT_OFFICE settings to GMIDCHO...');
        gmidcSettings = new OfficeSettings({
          officeId: 'GMIDCHO',
          officeName: 'GMIDC Head Office',
          organizationName: defaultDoc.organizationName || 'सिंचन भवन, छत्रपती संभाजीनगर',
          appTitle: defaultDoc.appTitle || 'Visitor Pass Management',
          passTitle: defaultDoc.passTitle || 'अभ्यागत प्रवेश परवाना',
          logoUrl: defaultDoc.logoUrl || '/logo.png',
          offices: defaultDoc.offices || OfficeSettings.defaultOfficesList,
          validityHours: defaultDoc.validityHours || 2,
          cutoffTime: defaultDoc.cutoffTime || '17:00',
          footerNotice: defaultDoc.footerNotice || 'पर्यन्त प्रवेश परवाना वैध आहे.',
          fontFamily: defaultDoc.fontFamily || "'DVOT-Surekh', 'DVOT Surekh', 'Nirmala UI', 'Mangal', sans-serif",
        });
      } else {
        gmidcSettings = new OfficeSettings({
          officeId: 'GMIDCHO',
          officeName: 'GMIDC Head Office',
        });
      }
      await gmidcSettings.save();
      console.log('[Migration] Initialized GMIDCHO office settings.');
    }

    // 2. Ensure superadmin account exists
    let superAdmin = await User.findOne({ username: 'superadmin' });
    if (!superAdmin) {
      console.log('[Migration] Creating superadmin user account...');
      superAdmin = new User({
        username: 'superadmin',
        password: 'SuperAdmin@2026',
        role: 'admin',
        officeId: 'GMIDCHO',
        name: 'Global Super Admin',
      });
      await superAdmin.save();
      console.log('[Migration] Superadmin account created: username: superadmin');
    }

    // 3. Rename legacy 'admin' user to 'GMIDCHO'
    const legacyAdmin = await User.findOne({ username: 'admin' });
    if (legacyAdmin) {
      console.log('[Migration] Renaming legacy single user admin -> GMIDCHO...');
      const existingGmidcUser = await User.findOne({ username: 'GMIDCHO' });
      if (!existingGmidcUser) {
        legacyAdmin.username = 'GMIDCHO';
        legacyAdmin.role = 'user';
        legacyAdmin.officeId = 'GMIDCHO';
        legacyAdmin.name = 'GMIDC Head Office Operator';
        await legacyAdmin.save();
        console.log('[Migration] Renamed admin to GMIDCHO (Operator for GMIDC Head Office).');
      } else {
        // If GMIDCHO already exists, update admin role to superadmin or user
        legacyAdmin.role = 'admin';
        await legacyAdmin.save();
      }
    } else {
      // Ensure GMIDCHO operator user exists
      let gmidcUser = await User.findOne({ username: 'GMIDCHO' });
      if (!gmidcUser) {
        gmidcUser = new User({
          username: 'GMIDCHO',
          password: 'password123',
          role: 'user',
          officeId: 'GMIDCHO',
          name: 'GMIDC Head Office Operator',
        });
        await gmidcUser.save();
        console.log('[Migration] Created GMIDCHO operator account.');
      }
    }

    // 4. Migrate any visitor records with officeId: 'DEFAULT_OFFICE' -> 'GMIDCHO'
    const visitorUpdate = await Visitor.updateMany(
      { $or: [{ officeId: 'DEFAULT_OFFICE' }, { officeId: { $exists: false } }, { officeId: null }] },
      { $set: { officeId: 'GMIDCHO' } }
    );
    if (visitorUpdate.modifiedCount > 0) {
      console.log(`[Migration] Reassigned ${visitorUpdate.modifiedCount} visitor passes to GMIDCHO.`);
    }

    console.log('[Migration] GMIDCHO migration completed successfully.');
  } catch (error) {
    console.error('[Migration Error]', error);
  }
};

module.exports = runMigration;

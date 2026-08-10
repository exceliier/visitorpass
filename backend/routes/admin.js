const express = require('express');
const User = require('../models/User');
const OfficeSettings = require('../models/OfficeSettings');
const { verifyAdminToken } = require('./settings');
const router = express.Router();

// Apply verifyAdminToken middleware to all admin routes
router.use(verifyAdminToken);

// --- OFFICE MANAGEMENT ---

// GET /admin/offices - List all registered offices
router.get('/offices', async (req, res) => {
  try {
    const offices = await OfficeSettings.find().sort({ createdAt: -1 });
    res.json(offices);
  } catch (error) {
    console.error('Error fetching offices:', error);
    res.status(500).json({ message: 'Failed to fetch offices' });
  }
});

// POST /admin/offices - Create a new office profile
router.post('/offices', async (req, res) => {
  try {
    const { officeId, officeName, organizationName, passTitle, logoUrl, offices, validityHours, cutoffTime, footerNotice, fontFamily } = req.body;

    if (!officeId || !officeName) {
      return res.status(400).json({ message: 'officeId and officeName are required.' });
    }

    const existing = await OfficeSettings.findOne({ officeId: officeId.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Office ID already exists.' });
    }

    const newOffice = new OfficeSettings({
      officeId: officeId.trim().toUpperCase(),
      officeName,
      organizationName: organizationName || officeName,
      passTitle: passTitle || 'अभ्यागत प्रवेश परवाना',
      logoUrl: logoUrl || '/logo.png',
      offices: Array.isArray(offices) && offices.length > 0 ? offices : OfficeSettings.defaultOfficesList,
      validityHours: validityHours || 2,
      cutoffTime: cutoffTime || '17:00',
      footerNotice: footerNotice || 'पर्यन्त प्रवेश परवाना वैध आहे.',
      fontFamily: fontFamily || "'DVOT-Surekh', 'DVOT Surekh', 'Nirmala UI', 'Mangal', sans-serif",
    });

    await newOffice.save();
    res.status(201).json({ message: 'Office created successfully', office: newOffice });
  } catch (error) {
    console.error('Error creating office:', error);
    res.status(500).json({ message: 'Failed to create office' });
  }
});

// PUT /admin/offices/:officeId - Update an office profile
router.put('/offices/:officeId', async (req, res) => {
  try {
    const { officeId } = req.params;
    const updateData = req.body;

    const office = await OfficeSettings.findOne({ officeId });
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    Object.assign(office, updateData);
    await office.save();
    res.json({ message: 'Office updated successfully', office });
  } catch (error) {
    console.error('Error updating office:', error);
    res.status(500).json({ message: 'Failed to update office' });
  }
});

// --- USER MANAGEMENT ---

// GET /admin/users - List all users with office mapping
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// POST /admin/users - Create a new user operator account mapped to an office
router.post('/users', async (req, res) => {
  try {
    const { username, password, role, officeId, name } = req.body;

    if (!username || !password || !officeId) {
      return res.status(400).json({ message: 'Username, password, and assigned office are required.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const user = new User({
      username: username.trim(),
      password,
      role: role || 'user',
      officeId,
      name: name || username,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { id: user._id, username: user.username, role: user.role, officeId: user.officeId, name: user.name } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// DELETE /admin/users/:userId - Delete a user operator
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;

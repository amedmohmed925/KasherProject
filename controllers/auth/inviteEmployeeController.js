const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const mailSender = require('../../utils/mailSender');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    console.log('DEBUG req.user:', req.user);
    const { email, tenantId, name } = req.body;
    if (!email || !tenantId) {
      return res.status(400).json({ message: 'Email and tenantId are required' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated', debug: 'req.user is missing' });
    }
    if (!['admin', 'superAdmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    // Generate invite token
    const inviteToken = jwt.sign({ email, tenantId, name, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '2d' });
    // Send email using mailSender utility
    const inviteLink = `http://localhost:8080/api/accept-invite?token=${inviteToken}`;
    await mailSender(
      email,
      'You are invited to join the company',
      `<p>You have been invited to join the company. Click <a href='${inviteLink}'>here</a> to register as an employee.</p>`
    );
    res.json({ message: 'Invitation sent', inviteLink });
  } catch (err) {
    console.error('Invite employee error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

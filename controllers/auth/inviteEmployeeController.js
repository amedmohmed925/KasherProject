const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    const { email, tenantId, name } = req.body;
    if (!email || !tenantId) {
      return res.status(400).json({ message: 'Email and tenantId are required' });
    }
    // Only admin or superAdmin can invite
    if (!['admin', 'superAdmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    // Generate invite token
    const inviteToken = jwt.sign({ email, tenantId, name, role: 'employee' }, process.env.JWT_SECRET, { expiresIn: '2d' });
    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const inviteLink = `http://localhost:8080/api/accept-invite?token=${inviteToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'You are invited to join the company',
      html: `<p>You have been invited to join the company. Click <a href='${inviteLink}'>here</a> to register as an employee.</p>`
    });
    res.json({ message: 'Invitation sent', inviteLink });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

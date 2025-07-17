const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    const { token, password, name } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }
    const exists = await User.findOne({ email: payload.email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      name: name || payload.name || '',
      email: payload.email,
      password: hash,
      role: 'employee',
      tenantId: payload.tenantId
    });
    await user.save();
    res.status(201).json({ message: 'Employee registered', user: { id: user._id, email: user.email, role: user.role, tenantId: user.tenantId } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

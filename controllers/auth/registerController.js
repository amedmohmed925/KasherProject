const User = require('../../models/User');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  try {
    const { name, email, password, role, tenantId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['admin', 'superAdmin'].includes(role)) {
      return res.status(403).json({ message: 'Only admin or superAdmin can register directly. Employees must be invited.' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role, tenantId: tenantId || null });
    await user.save();
    res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

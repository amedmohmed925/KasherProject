const User = require('../../models/User');
const Tenant = require('../../models/Tenant');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const { tenantId, name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ tenantId, name, email, password: hash, role: 'admin' });
    await user.save();
    await Tenant.findByIdAndUpdate(tenantId, { adminId: user._id });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, role: 'admin' });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

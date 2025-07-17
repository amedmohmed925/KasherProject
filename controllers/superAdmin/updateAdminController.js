const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    if (req.user.role !== 'superAdmin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user || user.role !== 'admin') return res.status(404).json({ message: 'Admin not found' });
    Object.assign(user, req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

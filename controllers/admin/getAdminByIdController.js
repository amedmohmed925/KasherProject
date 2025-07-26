const User = require('../../models/User');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

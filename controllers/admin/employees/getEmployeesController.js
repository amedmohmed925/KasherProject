const User = require('../../../models/User');

module.exports = async (req, res) => {
  try {
    const employees = await User.find({ tenantId: req.user.tenantId, role: 'employee' });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
